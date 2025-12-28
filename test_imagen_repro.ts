
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const IMAGE_MODEL = 'imagen-4.0-generate-001';

async function testImagen() {
    console.log(`\n--- Testing Model: ${IMAGE_MODEL} ---`);
    try {
        const result = await ai.models.generateImages({
            model: IMAGE_MODEL,
            prompt: "A futuristic city skyline at sunset",
            config: {
                numberOfImages: 1,
                aspectRatio: '16:9',
                outputMimeType: 'image/jpeg'
            }
        });

        if (result.generatedImages && result.generatedImages.length > 0) {
            console.log("SUCCESS: Image generated.");
            console.log("Image Bytes Length:", result.generatedImages[0].image.imageBytes.length);
        } else {
            console.log("FAILURE: No images returned.");
        }
    } catch (error: any) {
        console.error("ERROR:", error.message);
        if (error.response) {
            console.error("Response details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testImagen();
