
export default function VariantTable({ variants = [], onVariantChange }) {
    if (!variants || variants.length === 0) {
        return null;
    }

    const handlePriceChange = (index, newPrice) => {
        if (onVariantChange) {
            const updatedVariants = [...variants];
            updatedVariants[index] = { ...updatedVariants[index], price: newPrice };
            onVariantChange(updatedVariants);
        }
    };

    return (
        <s-card>
            <s-stack direction="block" gap="base">
                <s-heading>
                    Variants ({variants.length})
                </s-heading>
                <s-paragraph>
                    Review and adjust variant pricing before publishing.
                </s-paragraph>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "14px",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                borderBottom: "2px solid var(--p-color-border, #ddd)",
                                textAlign: "left",
                            }}
                        >
                            <th style={{ padding: "8px 12px" }}>Variant</th>
                            <th style={{ padding: "8px 12px" }}>Option Type</th>
                            <th style={{ padding: "8px 12px" }}>Option Value</th>
                            <th style={{ padding: "8px 12px", width: "150px" }}>Price ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((variant, index) => (
                            <tr
                                key={index}
                                style={{
                                    borderBottom: "1px solid var(--p-color-border-subdued, #eee)",
                                }}
                            >
                                <td style={{ padding: "8px 12px", fontWeight: 500 }}>
                                    {variant.name}
                                </td>
                                <td style={{ padding: "8px 12px" }}>
                                    <s-badge>{variant.optionType}</s-badge>
                                </td>
                                <td style={{ padding: "8px 12px" }}>{variant.optionValue}</td>
                                <td style={{ padding: "8px 12px" }}>
                                    {onVariantChange ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={variant.price}
                                            onChange={(e) => handlePriceChange(index, e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "6px 8px",
                                                border:
                                                    "1px solid var(--p-color-border, #ccc)",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                            }}
                                        />
                                    ) : (
                                        <strong>${parseFloat(variant.price).toFixed(2)}</strong>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </s-stack>
        </s-card>
    );
}
