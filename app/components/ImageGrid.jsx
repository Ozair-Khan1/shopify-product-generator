/**
 * Image Grid Component
 * Displays AI-generated product images in a responsive grid.
 */
export default function ImageGrid({ images = [] }) {
    if (!images || images.length === 0) {
        return (
            <s-card>
                <s-stack direction="block" gap="base">
                    <s-heading>Product Images</s-heading>
                    <s-box
                        padding="loose"
                        borderWidth="base"
                        borderRadius="base"
                        background="subdued"
                    >
                        <s-paragraph>
                            No images were generated. This could be due to content policy
                            restrictions or API limits. You can still publish the product
                            without images.
                        </s-paragraph>
                    </s-box>
                </s-stack>
            </s-card>
        );
    }

    return (
        <s-card>
            <s-stack direction="block" gap="base">
                <s-heading>Product Images ({images.length})</s-heading>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, 1fr)`,
                        gap: "12px",
                    }}
                >
                    {images.map((image, index) => (
                        <div
                            key={index}
                            style={{
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: "1px solid var(--p-color-border-subdued, #ddd)",
                                aspectRatio: "1",
                            }}
                        >
                            <img
                                src={`data:${image.mimeType};base64,${image.base64}`}
                                alt={`AI generated product image ${index + 1}`}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        </div>
                    ))}
                </div>
            </s-stack>
        </s-card>
    );
}
