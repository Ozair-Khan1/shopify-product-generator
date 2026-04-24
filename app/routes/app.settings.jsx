import { useState } from "react";
import { useLoaderData, useActionData, useNavigation, useSubmit } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Get or create default settings
    let settings = await prisma.aiSettings.findUnique({
        where: { shop },
    });

    if (!settings) {
        settings = {
            id: "",
            shop,
            tone: "SEO-rich",
            imageStyle: "Studio",
            imageCount: 3,
            pricingStrategy: "Medium",
        };
    }

    return { settings };
};

export const action = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const formData = await request.formData();

    const tone = formData.get("tone") || "SEO-rich";
    const imageStyle = formData.get("imageStyle") || "Studio";
    const imageCount = parseInt(formData.get("imageCount") || "3", 10);
    const pricingStrategy = formData.get("pricingStrategy") || "Medium";

    await prisma.aiSettings.upsert({
        where: { shop },
        update: { tone, imageStyle, imageCount, pricingStrategy },
        create: { shop, tone, imageStyle, imageCount, pricingStrategy },
    });

    return { success: true };
};

export default function SettingsPage() {
    const { settings } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const shopify = useAppBridge();
    const submit = useSubmit();
    const isSaving = navigation.state === "submitting";

    const [tone, setTone] = useState(settings.tone);
    const [imageStyle, setImageStyle] = useState(settings.imageStyle);
    const [imageCount, setImageCount] = useState(settings.imageCount);
    const [pricingStrategy, setPricingStrategy] = useState(settings.pricingStrategy);

    if (actionData?.success) {
        shopify.toast.show("Settings saved");
    }

    const handleSave = () => {
        const formData = new FormData();
        formData.append("tone", tone);
        formData.append("imageStyle", imageStyle);
        formData.append("imageCount", String(imageCount));
        formData.append("pricingStrategy", pricingStrategy);
        submit(formData, { method: "post" });
    };

    return (
        <s-page heading="Settings" backAction={{ url: "/app" }}>
            <s-section heading="Configure AI Generation Preferences">
                <s-stack direction="block" gap="base">
                    {actionData?.success && (
                        <s-banner tone="success" dismissible>
                            Settings saved successfully!
                        </s-banner>
                    )}

                    {/* Tone Setting */}
                    <s-card>
                        <s-stack direction="block" gap="base">
                            <s-heading>Product Description Tone</s-heading>
                            <s-paragraph>
                                Choose the writing style for AI-generated product descriptions.
                            </s-paragraph>
                            <s-select
                                label="Tone"
                                name="tone"
                                value={tone}
                                onInput={(e) => setTone(e.currentTarget.value)}
                            >
                                <s-option value="Luxury" {...(tone === "Luxury" ? { selected: true } : {})}>
                                    Luxury — Premium, elegant, sophisticated
                                </s-option>
                                <s-option value="Simple" {...(tone === "Simple" ? { selected: true } : {})}>
                                    Simple — Clear, straightforward, minimal
                                </s-option>
                                <s-option value="Fun" {...(tone === "Fun" ? { selected: true } : {})}>
                                    Fun — Playful, energetic, engaging
                                </s-option>
                                <s-option value="SEO-rich" {...(tone === "SEO-rich" ? { selected: true } : {})}>
                                    SEO-rich — Keyword-optimized, search-friendly
                                </s-option>
                            </s-select>
                        </s-stack>
                    </s-card>

                    {/* Image Style Setting */}
                    <s-card>
                        <s-stack direction="block" gap="base">
                            <s-heading>Image Generation Style</s-heading>
                            <s-paragraph>
                                Choose the visual style for AI-generated product images.
                            </s-paragraph>
                            <s-select
                                label="Image Style"
                                name="imageStyle"
                                value={imageStyle}
                                onInput={(e) => setImageStyle(e.currentTarget.value)}
                            >
                                <s-option value="Studio" {...(imageStyle === "Studio" ? { selected: true } : {})}>
                                    Studio — Clean white background, professional photography
                                </s-option>
                                <s-option value="3D" {...(imageStyle === "3D" ? { selected: true } : {})}>
                                    3D — Photorealistic 3D rendered product visualization
                                </s-option>
                                <s-option value="Lifestyle" {...(imageStyle === "Lifestyle" ? { selected: true } : {})}>
                                    Lifestyle — Product in natural setting, in-use context
                                </s-option>
                            </s-select>
                        </s-stack>
                    </s-card>

                    {/* Image Count Setting */}
                    <s-card>
                        <s-stack direction="block" gap="base">
                            <s-heading>Number of Images</s-heading>
                            <s-paragraph>
                                How many product images should the AI generate? (1–6)
                            </s-paragraph>
                            <s-select
                                label="Number of Images"
                                name="imageCount"
                                value={imageCount}
                                onInput={(e) => setImageCount(e.currentTarget.value)}
                            >
                                <s-option value="1" {...(imageCount === "1" ? { selected: true } : {})}>
                                    1
                                </s-option>
                                <s-option value="2" {...(imageCount === "2" ? { selected: true } : {})}>
                                    2
                                </s-option>
                                <s-option value="3" {...(imageCount === "3" ? { selected: true } : {})}>
                                    3
                                </s-option>
                                <s-option value="4" {...(imageCount === "4" ? { selected: true } : {})}>
                                    4
                                </s-option>
                                <s-option value="5" {...(imageCount === "5" ? { selected: true } : {})}>
                                    5
                                </s-option>
                                <s-option value="6" {...(imageCount === "6" ? { selected: true } : {})}>
                                    6
                                </s-option>
                            </s-select>
                        </s-stack>
                    </s-card>

                    {/* Pricing Strategy Setting */}
                    <s-card>
                        <s-stack direction="block" gap="base">
                            <s-heading>Pricing Strategy</s-heading>
                            <s-paragraph>
                                Choose the pricing tier for AI-suggested variant prices.
                            </s-paragraph>
                            <s-select
                                label="Pricing Strategy"
                                name="pricingStrategy"
                                value={pricingStrategy}
                                onInput={(e) => setPricingStrategy(e.currentTarget.value)}
                            >
                                <s-option value="Low" {...(pricingStrategy === "Low" ? { selected: true } : {})}>
                                    Low — Budget-friendly, competitive pricing
                                </s-option>
                                <s-option value="Medium" {...(pricingStrategy === "Medium" ? { selected: true } : {})}>
                                    Medium — Standard market pricing
                                </s-option>
                                <s-option value="Premium" {...(pricingStrategy === "Premium" ? { selected: true } : {})}>
                                    Premium — High-end, luxury pricing
                                </s-option>
                            </s-select>
                        </s-stack>
                    </s-card>

                    {/* Save Button */}
                    <s-button
                        variant="primary"
                        onClick={handleSave}
                        {...(isSaving ? { loading: true } : {})}
                    >
                        Save Settings
                    </s-button>
                </s-stack>
            </s-section>

            <s-section slot="aside" heading="About Settings">
                <s-stack direction="block" gap="base">
                    <s-paragraph>
                        These settings customize how AI generates your products. Changes
                        apply to all future product generations.
                    </s-paragraph>
                    <s-paragraph>
                        <strong>Tone</strong> affects the writing style of descriptions.
                    </s-paragraph>
                    <s-paragraph>
                        <strong>Image Style</strong> determines the visual aesthetic of
                        generated product photos.
                    </s-paragraph>
                    <s-paragraph>
                        <strong>Pricing Strategy</strong> influences the price suggestions
                        the AI makes for product variants.
                    </s-paragraph>
                </s-stack>
            </s-section>
        </s-page>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};
