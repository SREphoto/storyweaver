
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const MODELS_TO_TEST = [
    'gemini-2.5-flash-image',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

async function testImageGen() {
    const prompt = "Generate an image of a futuristic city. Do not describe it, just generate the image.";

    for (const model of MODELS_TO_TEST) {
        console.log(`\n--- Testing Model: ${model} ---`);
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });

            const candidate = response.candidates?.[0];
            const part = candidate?.content?.parts?.[0];

            console.log("Finish Reason:", candidate?.finishReason);

            if (part && 'inlineData' in part && part.inlineData && part.inlineData.data) {
                console.log("SUCCESS: Image data received.");
                console.log("MimeType:", part.inlineData.mimeType);
                return; // Stop if success
            } else if (part && 'text' in part && part.text) {
                console.log("FAILURE: Received text.");
                console.log("Text Preview:", part.text.substring(0, 100));
            } else {
                console.log("FAILURE: No valid part found.");
            }

        } catch (error: any) {
            console.log(`ERROR with ${model}:`, error.message);
        }
    }
}

testImageGen();
