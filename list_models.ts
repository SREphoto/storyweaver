
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
        console.log("Full Response:", JSON.stringify(response, null, 2));

        if (response.models) {
            console.log(`Found ${response.models.length} models.`);
            response.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName}) methods: ${m.supportedGenerationMethods}`);
            });
        } else {
            console.log("response.models is undefined");
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
