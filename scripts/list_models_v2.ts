import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
    console.log("Checking available models...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("No API KEY found!");
        return;
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        console.log("Listing models (default version):");
        const response = await genAI.models.list();
        // The new SDK likely returns an async iterable or an object with models
        // We'll try to iterate or print it.
        for await (const model of response) {
            if (model.name.includes('gemini') || model.name.includes('imagen')) {
                console.log(`- ${model.name}`);
            }
        }
    } catch (e: any) {
        console.error("Error listing on default:", e.message);
    }

    try {
        console.log("\nListing models (v1beta):");
        // Try passing httpOptions or similar if possible, but let's just see default first.
    } catch (e) { }
}

listModels();
