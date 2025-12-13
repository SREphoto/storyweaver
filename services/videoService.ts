
import { GoogleGenAI } from "@google/genai";

console.log("Video Service Initializing. API Key present:", !!process.env.API_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VIDEO_MODEL = 'veo-3.1-generate-preview'; // Or 'veo-3.1-generate-preview' based on research

export async function generateVideo(prompt: string, imageFile?: File): Promise<string> {
    console.log(`[VideoService] Generating video with model: ${VIDEO_MODEL}`);
    console.log(`[VideoService] Prompt: ${prompt}`);

    try {
        let contents: any = {
            parts: [{ text: prompt }]
        };

        if (imageFile) {
            const base64Data = await fileToGenerativePart(imageFile);
            contents.parts.unshift(base64Data.inlineData); // Add image before text
        }

        // Note: VEO 3.1 might return a URI or a polling ID. 
        // For 'preview' models, it often returns the video directly or a short wait.
        // We will assume standard generateContent for now, but might need to adjust for async operations.

        const response = await ai.models.generateContent({
            model: VIDEO_MODEL,
            contents: contents,
        });

        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part && 'inlineData' in part && part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }

        // If it returns a URI (fileUri)
        if (part && 'fileData' in part && part.fileData && part.fileData.fileUri) {
            return part.fileData.fileUri;
        }

        console.warn("[VideoService] Unexpected response format:", JSON.stringify(response, null, 2));
        throw new Error("No video data returned.");

    } catch (error: any) {
        console.error("[VideoService] Error generating video:", error);
        throw error;
    }
}

// Helper to convert File to Base64 for Gemini
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};
