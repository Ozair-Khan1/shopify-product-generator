/**
 * Create a full product in Shopify with variants, images, and SEO fields.
 *
 * @param {object} admin - Shopify admin API client from authenticate.admin()
 * @param {object} productData - AI-generated product data
 * @param {Array<{base64: string, mimeType: string}>} images - AI-generated images
 * @returns {Promise<{productId: string, handle: string}>}
 */
export async function createFullProduct(admin, productData, images = []) {
    // Step 1: Determine option name from variants
    const optionTypes = [
        ...new Set(productData.variants.map((v) => v.optionType)),
    ];    

    // Build variants array for productSet
    const variants = productData.variants.map((v, index) => ({
        optionValues: [
            {
                name: v.optionValue,
                optionName: v.optionType,
            },
        ],
        price: parseFloat(v.price).toFixed(2),
        position: index + 1,
    }));

    // Step 2: Create the product using productSet mutation
    const productSetResponse = await admin.graphql(
        `#graphql
    mutation CreateProduct($input: ProductSetInput!) {
      productSet(input: $input) {
        product {
          id
          handle
          title
          status
          variants(first: 20) {
            edges {
              node {
                id
                title
                price
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
        {
            variables: {
                input: {
                    title: productData.title,
                    descriptionHtml: productData.description,
                    productType: productData.productType || "",
                    tags: productData.tags || [],
                    status: "DRAFT",
                    seo: {
                        title: productData.seoTitle || "",
                        description: productData.seoDescription || "",
                    },
                    productOptions: optionTypes.map((optType) => ({
                        name: optType,
                        values: productData.variants
                            .filter((v) => v.optionType === optType)
                            .map((v) => ({ name: v.optionValue })),
                    })),
                    variants: variants,
                },
            },
        }
    );

    const productSetJson = await productSetResponse.json();

    if (productSetJson.data?.productSet?.userErrors?.length > 0) {
        const errors = productSetJson.data.productSet.userErrors;
        throw new Error(
            `Product creation failed: ${errors.map((e) => e.message).join(", ")}`
        );
    }

    const product = productSetJson.data.productSet.product;

    // Step 3: Upload images if available
    if (images.length > 0) {
        await uploadProductImages(admin, product.id, images);
    }

    return {
        productId: product.id,
        handle: product.handle,
        title: product.title,
        variants: product.variants.edges.map((e) => e.node),
    };
}

/**
 * Upload images to a Shopify product using staged uploads.
 */
async function uploadProductImages(admin, productId, images) {
    // Step 1: Create staged upload targets
    const stagedUploadsResponse = await admin.graphql(
        `#graphql
    mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
        {
            variables: {
                input: images.map((_, index) => ({
                    resource: "IMAGE",
                    filename: `ai-product-image-${index + 1}.png`,
                    mimeType: "image/png",
                    httpMethod: "POST",
                })),
            },
        }
    );

    const stagedJson = await stagedUploadsResponse.json();
    const targets = stagedJson.data?.stagedUploadsCreate?.stagedTargets;

    if (!targets || targets.length === 0) {
        console.error("No staged upload targets returned");
        return;
    }

    // Step 2: Upload each image to the staged URL
    const resourceUrls = [];

    for (let i = 0; i < Math.min(images.length, targets.length); i++) {
        const target = targets[i];
        const image = images[i];

        try {
            // Build multipart form data for the upload
            const formData = new FormData();
            for (const param of target.parameters) {
                formData.append(param.name, param.value);
            }

            // Convert base64 to blob
            const binaryData = Buffer.from(image.base64, "base64");
            const blob = new Blob([binaryData], { type: "image/png" });
            formData.append("file", blob, `ai-product-image-${i + 1}.png`);

            const uploadResponse = await fetch(target.url, {
                method: "POST",
                body: formData,
            });

            if (uploadResponse.ok) {
                resourceUrls.push(target.resourceUrl);
            } else {
                console.error(`Image upload ${i + 1} failed:`, uploadResponse.status);
            }
        } catch (error) {
            console.error(`Image upload ${i + 1} error:`, error.message);
        }
    }

    // Step 3: Attach uploaded images to the product
    if (resourceUrls.length > 0) {
        const mediaResponse = await admin.graphql(
            `#graphql
      mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media {
            ... on MediaImage {
              id
              status
            }
          }
          mediaUserErrors {
            field
            message
          }
        }
      }`,
            {
                variables: {
                    productId: productId,
                    media: resourceUrls.map((url) => ({
                        originalSource: url,
                        mediaContentType: "IMAGE",
                    })),
                },
            }
        );

        const mediaJson = await mediaResponse.json();
        if (mediaJson.data?.productCreateMedia?.mediaUserErrors?.length > 0) {
            console.error(
                "Media attach errors:",
                mediaJson.data.productCreateMedia.mediaUserErrors
            );
        }
    }
}
