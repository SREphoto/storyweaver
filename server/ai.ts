import express from 'express';
import { GoogleGenAI } from "@google/genai";
import { authenticateToken } from './auth';

const router = express.Router();

// Initialize Gemini with server-side API Key
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const TEXT_MODEL = 'gemini-3-flash-preview'; // High-speed intelligence
const IMAGE_MODEL = 'imagen-4.0-fast-generate-001'; // Imagen 4 Fast

// Generic AI Content Generation Endpoint
router.post('/generate', authenticateToken, async (req: any, res) => {
    try {
        let { prompt, config, model = TEXT_MODEL } = req.body;

        // Force upgrade legacy models to prevent 404s
        if (model === 'gemini-1.5-flash' || model === 'gemini-1.5-pro') {
            console.log(`[AI Server] Upgrading legacy model ${model} to ${TEXT_MODEL}`);
            model = TEXT_MODEL;
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
        }

        const response = await genAI.models.generateContent({
            model: model,
            contents: prompt,
            config: config
        });

        res.json({ text: response.text });
    } catch (error: any) {
        console.error('[AI Server Error]:', error);
        res.status(500).json({ error: error.message || 'AI Generation failed' });
    }
});

// Implementation of the Nano Banana (Gemini 2.5 Flash Image) bridge
router.post('/generate-image', authenticateToken, async (req: any, res) => {
    try {
        const { prompt, aspectRatio = '16:9' } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
        }

        // Using the 2.5 Flash Image model (Nano Banana)
        const result = await genAI.models.generateImages({
            model: IMAGE_MODEL,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio,
                outputMimeType: 'image/jpeg'
            }
        });

        if (result.generatedImages && result.generatedImages.length > 0) {
            const imageBytes = result.generatedImages[0].image.imageBytes;
            res.json({ url: `data:image/jpeg;base64,${imageBytes}` });
        } else {
            throw new Error("No image data returned from AI");
        }
    } catch (error: any) {
        console.error('[AI Image Server Error]:', error);
        res.status(500).json({ error: error.message || 'Image Generation failed' });
    }
});

export default router;
