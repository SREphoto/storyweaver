
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testBanana() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // List of models to try
    const modelsToTry = [
        'gemini-2.5-flash-image',
        // 'gemini-2.5-flash-image', 
    ];

    const prompt = `Generate a cinematic image for the scene: "The Lost Temple".
    Summary: Aria discovers an ancient, crumbling temple hidden behind a waterfall. The air is thick with mist and mystery.
    Setting: Jungle, Waterfall, Ancient Ruins.
    
    Characters present:
    Aria: Athletic build, silver hair, wearing explorer gear.
    
    Style: Cinematic, detailed, high quality. Aspect ratio: 16:9.`;

    for (const model of modelsToTry) {
        console.log(`\nTesting model: ${model}`);
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });

            console.log(`Response received for ${model}!`);
            const candidates = response.candidates;
            if (candidates && candidates.length > 0) {
                const parts = candidates[0].content?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.inlineData && part.inlineData.data) {
                            console.log(`SUCCESS! Image data found for ${model}. Length: ${part.inlineData.data.length}`);
                            return;
                        }
                    }
                }
            }
            console.log(`No image data in response for ${model}.`);
            if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
                console.log("Text response:", candidates[0].content.parts[0].text);
            }

        } catch (error: any) {
            console.log(`Failed for ${model}: ${error.message?.substring(0, 100)}...`);
        }
    }
}

testBanana();
