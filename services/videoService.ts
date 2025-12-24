import { api } from './api';

const VIDEO_MODEL = 'gemini-3.0-flash'; // High-speed intelligence for video prep 

export async function generateVideo(prompt: string, imageFile?: File): Promise<string> {
    console.warn("Video generation through bridge is limited to text-based prompts for now.");

    try {
        const response = await api.post('/ai/generate', {
            prompt,
            model: VIDEO_MODEL
        });

        // The bridge returns { text: "..." }
        // If the bridge is updated to support video/media, we would handle it here.
        // For now, we return the generated text or a placeholder if expecting a URI.
        return response.text;

    } catch (error: any) {
        console.error("[VideoService] Error generating video via bridge:", error);
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
