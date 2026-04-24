import { useState } from "react";
import {
    useLoaderData,
    useActionData,
    useNavigation,
    useSubmit,
    redirect
} from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { createFullProduct } from "../lib/shopifyGraphql";
import AIPreview from "../components/AIPreview";
import ImageGrid from "../components/ImageGrid";
import VariantTable from "../components/VariantTable";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
        throw new Response("No product ID provided", { status: 400 });
    }

    const generatedProduct = await prisma.generatedProduct.findUnique({
        where: { id },
    });

    if (!generatedProduct || generatedProduct.shop !== shop) {
        throw new Response("Product not found", { status: 404 });
    }

    return {
        generatedProduct: {
            ...generatedProduct,
            aiPayload: JSON.parse(generatedProduct.aiPayload),
        },
    };
};

export const action = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;
    const formData = await request.formData();
    const intent = formData.get("intent");
    const id = formData.get("id");
    const variantsJson = formData.get("variants");

    if (!id) {
        return { error: "Missing product ID" };
    }

    const generatedProduct = await prisma.generatedProduct.findUnique({
        where: { id },
    });

    if (!generatedProduct || generatedProduct.shop !== shop) {
        return { error: "Product not found" };
    }

    const aiPayload = JSON.parse(generatedProduct.aiPayload);

    if (intent === "publish") {
        try {
            // Use updated variants if provided
            let variants = aiPayload.variants;
            if (variantsJson) {
                try {
                    variants = JSON.parse(variantsJson);
                } catch (e) {
                    // Use original variants if parsing fails
                }
            }

            const productDataForShopify = {
                ...aiPayload,
                variants,
            };

            const result = await createFullProduct(
                admin,
                productDataForShopify,
                aiPayload.images || []
            );

            // Update the database record
            await prisma.generatedProduct.update({
                where: { id },
                data: {
                    status: "published",
                    shopifyProductId: result.productId,
                },
            });

            return {
                success: true,
                productId: result.productId,
                handle: result.handle,
            };
        } catch (error) {
            console.error("Publish error:", error);
            return { error: `Failed to publish: ${error.message}` };
        }
    }

    if (intent === "delete") {
        await prisma.generatedProduct.delete({ where: { id } });
        return { deleted: true };
    }

    return { error: "Unknown action" };
};

export default function AIPreviewPage() {
    const { generatedProduct } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const submit = useSubmit();
    const shopify = useAppBridge();
    const isPublishing =
        navigation.state === "submitting" &&
        navigation.formData?.get("intent") === "publish";

    const aiPayload = generatedProduct.aiPayload;
    const [variants, setVariants] = useState(aiPayload.variants || []);

    if (actionData?.success) {
        return (
            <s-page heading="Product Published!" backAction={{ url: "/app" }}>
                <s-section>
                    <s-card>
                        <s-stack direction="block" gap="base">
                            <s-banner tone="success">
                                🎉 Your product has been successfully created in Shopify!
                            </s-banner>
                            <s-paragraph>
                                The product "<strong>{generatedProduct.title}</strong>" is now
                                available as a draft in your Shopify admin. You can edit it
                                further from there.
                            </s-paragraph>
                            <s-stack direction="inline" gap="base">
                                <s-button
                                    variant="primary"
                                    onClick={() => {
                                        shopify.intents.invoke?.("edit:shopify/Product", {
                                            value: actionData.productId,
                                        });
                                    }}
                                >
                                    View in Shopify Admin
                                </s-button>
                                <s-button variant="tertiary" href="/app/ai">
                                    Create Another Product
                                </s-button>
                                <s-button variant="tertiary" href="/app">
                                    Back to Dashboard
                                </s-button>
                            </s-stack>
                        </s-stack>
                    </s-card>
                </s-section>
            </s-page>
        );
    }

    // Show deleted state
    if (actionData?.deleted) {
        return (
            <s-page heading="Draft Deleted" backAction={{ url: "/app" }}>
                <s-section>
                    <s-card>
                        <s-stack direction="block" gap="base">
                            <s-banner tone="info">Draft has been deleted.</s-banner>
                            <s-button href="/app/ai">Create a New Product</s-button>
                        </s-stack>
                    </s-card>
                </s-section>
            </s-page>
        );
    }

    const handlePublish = () => {
        const formData = new FormData();
        formData.append("intent", "publish");
        formData.append("id", generatedProduct.id);
        formData.append("variants", JSON.stringify(variants));
        submit(formData, { method: "post" });
    };

    const handleDelete = () => {
        const formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", generatedProduct.id);
        submit(formData, { method: "post" });
    };

    return (
        <s-page
            heading={`Preview: ${generatedProduct.title}`}
            backAction={{ url: "/app/ai" }}
        >
            <s-stack slot="primary-action" direction="inline" gap="tight">
                <s-button
                    variant="primary"
                    onClick={handlePublish}
                    {...(isPublishing ? { loading: true } : {})}
                >
                    🚀 Publish to Shopify
                </s-button>
            </s-stack>

            <s-section>
                <s-stack direction="block" gap="loose">
                    {actionData?.error && (
                        <s-banner tone="critical" dismissible>
                            {actionData.error}
                        </s-banner>
                    )}

                    {isPublishing && (
                        <s-banner tone="info">
                            Publishing your product to Shopify... This may take a few seconds.
                        </s-banner>
                    )}

                    {/* AI Generated Images */}
                    <ImageGrid images={aiPayload.images || []} />

                    {/* AI Generated Content */}
                    <AIPreview productData={aiPayload} />

                    {/* Editable Variants Table */}
                    <VariantTable variants={variants} onVariantChange={setVariants} />

                    {/* Action Buttons */}
                    <s-card>
                        <s-stack direction="inline" gap="base">
                            <s-button
                                variant="primary"
                                onClick={handlePublish}
                                {...(isPublishing ? { loading: true } : {})}
                            >
                                🚀 Publish to Shopify
                            </s-button>
                            <s-button variant="tertiary" href="/app/ai">
                                ← Create New Product
                            </s-button>
                            <s-button variant="tertiary" tone="critical" onClick={handleDelete}>
                                🗑️ Delete Draft
                            </s-button>
                        </s-stack>
                    </s-card>
                </s-stack>
            </s-section>

            <s-section slot="aside" heading="Preview Info">
                <s-stack direction="block" gap="base">
                    <s-paragraph>
                        Review the AI-generated content before publishing. You can edit
                        variant prices in the table.
                    </s-paragraph>
                    <s-paragraph>
                        The product will be created as a <strong>Draft</strong> in your
                        Shopify store. You can activate it later from the Shopify admin.
                    </s-paragraph>
                </s-stack>
            </s-section>
        </s-page>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};
