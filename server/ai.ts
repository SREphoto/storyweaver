import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateToken } from './auth';

const router = express.Router();

// Initialize Gemini with server-side API Key
// Render dashboard will provide GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const TEXT_MODEL = 'gemini-1.5-flash'; // Using stable flash for reliability

// Generic AI Content Generation Endpoint
router.post('/generate', authenticateToken, async (req: any, res) => {
    try {
        const { prompt, config, model = TEXT_MODEL } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
        }

        const genModel = genAI.getGenerativeModel({ model });

        // Optional JSON mode config
        const generationConfig = config?.responseMimeType === 'application/json'
            ? { responseMimeType: 'application/json' }
            : undefined;

        const result = await genModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig
        });

        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error: any) {
        console.error('[AI Server Error]:', error);
        res.status(500).json({ error: error.message || 'AI Generation failed' });
    }
});

// Specific Image Generation Placeholder (Gemini 1.5 doesn't do direct Image Gen in standard SDK like Imagen yet)
// If you use Gemini 2.0 Flash Image, the logic would go here.
router.post('/generate-image', authenticateToken, async (req: any, res) => {
    // Placeholder for when you want to move Imagen/ImageGen logic to server
    res.status(501).json({ error: 'Image generation via API bridge not yet implemented' });
});

export default router;
