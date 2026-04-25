import { useState } from "react";
import { useSubmit } from "react-router";
import {
    Card,
    FormLayout,
    TextField,
    Button,
    BlockStack,
    Text,
} from "@shopify/polaris";


export default function AIForm({ isLoading }) {
    const [title, setTitle] = useState("");
    const submit = useSubmit();

    const handleGenerate = () => {
        if (!title) return;
        const formData = new FormData();
        formData.append("productTitle", title);
        submit(formData, { method: "post" });
    };

    return (
        <Card>
            <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                    Product Details
                </Text>
                <Text as="p" tone="subdued">
                    Enter a product title below. Our AI will generate a description,
                    images, variants, and pricing for you in seconds.
                </Text>

                <FormLayout>
                    <TextField
                        label="Product Title"
                        value={title}
                        onChange={(val) => setTitle(val)}
                        placeholder="e.g. Premium Wireless Headphones"
                        autoComplete="off"
                        disabled={isLoading}
                        helpText="Be descriptive for better results (e.g., 'Eco-friendly Yoga Mat' instead of just 'Mat')."
                    />

                    <Button
                        variant="primary"
                        onClick={handleGenerate}
                        loading={isLoading}
                        disabled={!title || isLoading}
                        size="large"
                    >
                        Generate Product with AI
                    </Button>
                </FormLayout>
            </BlockStack>
        </Card>
    );
}
