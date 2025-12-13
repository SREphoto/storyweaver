import { GoogleGenAI, Type } from "@google/genai";
import { withRetry } from "../utils/retry";
import { GeminiError } from "../utils/errors";
import crypto from "crypto";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generate a concise summary of a full story.
 * @param storyText Full story text.
 * @returns Summary string.
 */
export async function summarizeStory(storyText: string): Promise<string> {
    const prompt = `Summarize the following story in 3-4 concise sentences, preserving main plot points and character arcs.\n\nStory:\n${storyText}`;
    const cacheKey = crypto.createHash('sha256').update(prompt).digest('hex');
    // Simple cache lookup (global cache instance from geminiService)
    // Note: we import the shared cache lazily to avoid circular deps.
    const { geminiCache } = await import('../services/geminiService');
    const cached = geminiCache.get(cacheKey);
    if (cached) return cached as string;

    const response = await withRetry(() =>
        ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt,
        })
    );

    const summary = response.text?.trim() ?? '';
    geminiCache.set(cacheKey, summary);
    return summary;
}
