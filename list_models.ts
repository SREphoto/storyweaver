
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY not found");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        const response = await ai.models.list();
        console.log("Available Models:");
        response.models?.forEach(m => {
            console.log(`- ${m.name} (${m.displayName}) - Supported Generation Methods: ${m.supportedGenerationMethods}`);
        });
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
