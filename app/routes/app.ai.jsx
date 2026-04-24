import { useActionData, useNavigation, useSubmit, redirect } from "react-router";
import { useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { generateProductData } from "../lib/openai";
import { generateProductImages } from "../lib/imageGen";

export const loader = async ({ request }) => {
    await authenticate.admin(request);
    return null;
};

export const action = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const formData = await request.formData();
    const productTitle = formData.get("productTitle");

    if (!productTitle || productTitle.trim() === "") {
        return { error: "Please enter a product title." };
    }

    try {
        // Get AI settings for this shop
        let settings = await prisma.aiSettings.findUnique({
            where: { shop },
        });

        if (!settings) {
            settings = {
                tone: "SEO-rich",
                imageStyle: "Studio",
                imageCount: 3,
                pricingStrategy: "Medium",
            };
        }

        // Step 1: Generate product text data with AI
        const productData = await generateProductData(productTitle, {
            tone: settings.tone,
            pricingStrategy: settings.pricingStrategy,
        });

        // Step 2: Generate product images with AI
        let images = [];
        let imageError = null;
        try {
            images = await generateProductImages(
                productTitle,
                settings.imageStyle,
                settings.imageCount
            );
            if (images.length === 0) {
                imageError = "Image generation returned 0 images. This is likely due to Free Tier quota limits on Imagen 3.";
            }
        } catch (imgError) {
            console.error("Image generation failed:", imgError.message);
            imageError = `Image generation failed: ${imgError.message}`;
        }

        const generatedProduct = await prisma.generatedProduct.create({
            data: {
                shop,
                title: productTitle,
                status: "draft",
                aiPayload: JSON.stringify({
                    ...productData,
                    title: productTitle,
                    images,
                    imageError,
                }),
            },
        });

        return redirect(`/app/preview?id=${generatedProduct.id}`);
    } catch (error) {
        console.error("AI generation error:", error);
        if (error.status === 429) {
            return { error: "Too many requests. Please try again later." };
        }
        return { error: error.message || "Failed to generate product." };
    }
};

export default function AIGeneratorPage() {
    const actionData = useActionData();
    const navigation = useNavigation();
    const submit = useSubmit();
    const [productTitle, setProductTitle] = useState("");
    const isSubmitting = navigation.state === "submitting";

    const handleGenerate = () => {
        if (!productTitle.trim()) return;
        const formData = new FormData();
        formData.append("productTitle", productTitle);
        submit(formData, { method: "post" });
    };

    return (
        <s-page heading="AI Product Generator" backAction={{ url: "/app" }}>
            <s-section heading="Create a new product">
                <s-stack direction="block" gap="base">
                    {actionData?.error && (
                        <s-banner tone="critical" dismissible>
                            {actionData.error}
                        </s-banner>
                    )}

                    <s-card>
                        <s-stack direction="block" gap="base">
                            <s-paragraph>
                                Enter a product title and our AI will generate a complete
                                product listing including description, images, variants,
                                pricing, and SEO fields.
                            </s-paragraph>

                            <s-text-field
                                label="Product Title"
                                name="productTitle"
                                placeholder="e.g. Premium Wireless Noise-Cancelling Headphones"
                                helpText="Be specific — the more descriptive your title, the better the AI output."
                                value={productTitle}
                                onInput={(e) => setProductTitle(e.currentTarget.value)}
                            />

                            <s-stack direction="inline" gap="base">
                                <s-button
                                    variant="primary"
                                    onClick={handleGenerate}
                                    {...(isSubmitting ? { loading: true } : {})}
                                >
                                    Generate Product
                                </s-button>

                                <s-button variant="secondary" href="/app/settings">
                                    Settings
                                </s-button>
                            </s-stack>
                        </s-stack>
                    </s-card>

                    {isSubmitting && (
                        <s-banner tone="info">
                            <s-stack direction="block" gap="tight">
                                <s-text variant="headingSm">
                                    Generating your product...
                                </s-text>
                                <s-paragraph>
                                    This may take 15-30 seconds.
                                </s-paragraph>
                            </s-stack>
                        </s-banner>
                    )}
                </s-stack>
            </s-section>

            <s-section slot="aside" heading="Tips">
                <s-unordered-list>
                    <s-list-item>
                        Use descriptive titles for better AI results
                    </s-list-item>
                    <s-list-item>
                        Configure your preferences in{" "}
                        <s-link href="/app/settings">Settings</s-link>
                    </s-list-item>
                    <s-list-item>
                        You can edit everything before publishing
                    </s-list-item>
                </s-unordered-list>
            </s-section>
        </s-page>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};
