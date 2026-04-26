export default function AIPreview({ productData }) {
    if (!productData) return null;

    return (
        <s-stack direction="block" gap="base">
            {productData.imageError && (
                <s-banner tone="notice">
                    {productData.imageError}
                </s-banner>
            )}
            {/* Description Card */}
            <s-card>
                <s-stack direction="block" gap="base">
                    <s-heading>Product Description</s-heading>
                    <s-box
                        padding="base"
                        borderWidth="base"
                        borderRadius="base"
                        background="subdued"
                    >
                        <div dangerouslySetInnerHTML={{ __html: productData.description }} />
                    </s-box>
                </s-stack>
            </s-card>

            {/* Key Features Card */}
            {productData.bulletFeatures && productData.bulletFeatures.length > 0 && (
                <s-card>
                    <s-stack direction="block" gap="base">
                        <s-heading>Key Features</s-heading>
                        <s-unordered-list>
                            {productData.bulletFeatures.map((feature, index) => (
                                <s-list-item key={index}>{feature}</s-list-item>
                            ))}
                        </s-unordered-list>
                    </s-stack>
                </s-card>
            )}

            {/* SEO Fields Card */}
            <s-card>
                <s-stack direction="block" gap="base">
                    <s-heading>SEO Fields</s-heading>
                    <s-text-field
                        label="SEO Title"
                        value={productData.seoTitle || ""}
                        readOnly
                    />
                    <s-text-field
                        label="SEO Description"
                        value={productData.seoDescription || ""}
                        readOnly
                        multiline={2}
                    />
                </s-stack>
            </s-card>

            {/* Tags Card */}
            {productData.tags && productData.tags.length > 0 && (
                <s-card>
                    <s-stack direction="block" gap="base">
                        <s-heading>Product Tags</s-heading>
                        <s-stack direction="inline" gap="tight">
                            {productData.tags.map((tag, index) => (
                                <s-badge key={index}>{tag}</s-badge>
                            ))}
                        </s-stack>
                    </s-stack>
                </s-card>
            )}

            {/* Product Type */}
            {productData.productType && (
                <s-card>
                    <s-stack direction="block" gap="base">
                        <s-heading>Product Type</s-heading>
                        <s-paragraph>{productData.productType}</s-paragraph>
                    </s-stack>
                </s-card>
            )}
        </s-stack>
    );
}
