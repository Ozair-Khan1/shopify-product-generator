import { GoogleGenAI } from "@google/genai";

let genaiInstance = null;

function getGenAI() {
    if (!genaiInstance) {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey || apiKey === "your-gemini-api-key-here") {
            throw new Error(
                "Please add your API key"
            );
        }
        genaiInstance = new GoogleGenAI({ apiKey });
    }
    return genaiInstance;
}

/**
 * @param {string} title - The product title
 * @param {object} settings - AI settings (tone, pricingStrategy)
 * @returns {Promise<object>} Structured product data
 */
export async function generateProductData(title, settings = {}) {
    const ai = getGenAI();
    const tone = settings.tone || "SEO-rich";
    const pricingStrategy = settings.pricingStrategy || "Medium";

    const prompt = `You are an expert e-commerce product copywriter and strategist.

Given the product title: "${title}"

Generate a COMPLETE product listing with the following requirements:

1. **Description**: Write a high-converting product description (2-3 paragraphs) in HTML format using <p>, <ul>, <li>, <strong> tags. Tone: ${tone}.

2. **Bullet Features**: List 4-6 key product features/benefits.

3. **SEO Title**: An optimized SEO title (max 70 characters).

4. **SEO Description**: An optimized meta description (max 160 characters).

5. **Tags**: Generate 5-8 relevant product tags for categorization and search.

6. **Variants**: Suggest 2-4 logical product variants. CRITICAL: All variants for a single product MUST share the same option type (e.g., if one is "Size", all others must also use "Size"). Each variant should have:
   - A descriptive name
   - Option type (e.g., "Size", "Color", "Plan", "Storage", "Material")
   - Option value
   - A suggested price based on the "${pricingStrategy}" pricing strategy:
     - Low = budget-friendly, competitive pricing
     - Medium = standard market pricing
     - Premium = high-end, luxury pricing

7. **Product Type**: A single category/type for this product.

Return ONLY valid JSON in this exact structure:
{
  "description": "<p>HTML description here</p>",
  "bulletFeatures": ["feature 1", "feature 2"],
  "seoTitle": "SEO optimized title",
  "seoDescription": "Meta description for search engines",
  "tags": ["tag1", "tag2"],
  "productType": "Category Name",
  "variants": [
    {
      "name": "Variant Display Name",
      "optionType": "Size",
      "optionValue": "Medium",
      "price": "49.99"
    }
  ]
}`;

    console.log("Generating product data for:", title);
    const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-2.5-flash-exp"];
    let lastError = null;

    for (const modelName of modelNames) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                },
            });

            const text = response.text;
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error(`Gemini Parse Error for ${modelName}. Raw text:`, text);
                const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1].trim());
                }
                throw e;
            }
        } catch (error) {
            console.error(`Attempt with ${modelName} failed:`, error.message);
            lastError = error;
            if (error.message?.includes("not found") || error.status === 404) {
                continue;
            }
            throw error;
        }
    }

    throw lastError || new Error("All Gemini models failed to generate content.");
}
