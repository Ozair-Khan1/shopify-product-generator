import { GoogleGenAI } from "@google/genai";

let genaiInstance = null;

function getGenAI() {
    if (!genaiInstance) {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey || apiKey === "your-gemini-api-key-here") {
            throw new Error(
                "Please add your API key."
            );
        }
        genaiInstance = new GoogleGenAI({ apiKey });
    }
    return genaiInstance;
}


/**
 * Generate product images using Gemini Imagen.
 * @param {string} title
 * @param {string} style
 * @param {number} count
 * @returns {Promise<Array<{base64: string, mimeType: string}>>}
 */
export async function generateProductImages(title, style = "Studio", count) {
    const ai = getGenAI();

    const stylePrompts = {
        Studio: `Professional studio product photography of "${title}" on a clean white background, high-end commercial photography, soft lighting, 8k quality, sharp focus`,
        "3D": `3D rendered product visualization of "${title}", photorealistic 3D render, clean background, professional product showcase, studio lighting, 8k quality`,
        Lifestyle: `Lifestyle product photography of "${title}" in a natural setting, showing the product in use, warm natural lighting, professional editorial style, 8k quality`,
    };

    const prompt = stylePrompts[style] || stylePrompts.Studio;
    const images = [];

    const modelNames = [
        "imagen-4.0-generate-001",
    ];

    for (const modelName of modelNames) {
        try {
            const response = await ai.models.generateImages({
                model: modelName,
                prompt: prompt,
                config: {
                    numberOfImages: count,
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                for (const img of response.generatedImages) {
                    images.push({
                        base64: img.image.imageBytes,
                        mimeType: "image/png",
                    });
                }
                break;
            }
        } catch (error) {
            console.error(`Imagen attempt with ${modelName} failed!`);
            console.error("Error Message:", error.message);
            console.error("Error Status:", error.status);
            if (error.response) {
                console.error("Error Response Data:", JSON.stringify(error.response.data, null, 2));
            }
            if (error.message?.includes("not found") || error.status === 404) {
                continue;
            }
            if (error.status === 429 || error.message?.includes("quota")) {
                console.warn("Imagen quota exceeded. Stopping image generation.");
                return images;
            }
        }
    }

    if (images.length === 0) {
        console.warn("No images were generated. Returning empty array.");
    }

    return images;
}
