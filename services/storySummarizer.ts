import { api } from './api';
import crypto from "crypto";

/**
 * Generate a concise summary of a full story.
 * @param storyText Full story text.
 * @returns Summary string.
 */
export async function summarizeStory(storyText: string): Promise<string> {
    const prompt = `Summarize the following story in 3-4 concise sentences, preserving main plot points and character arcs.\n\nStory:\n${storyText}`;
    const cacheKey = crypto.createHash('sha256').update(prompt).digest('hex');

    // Lazy load geminiCache
    const { geminiCache } = await import('./geminiService');
    const cached = geminiCache.get(cacheKey);
    if (cached) return cached as string;

    const response = await api.post('/ai/generate', {
        prompt,
        model: 'gemini-3-flash'
    });

    const summary = response.text?.trim() ?? '';
    geminiCache.set(cacheKey, summary);
    return summary;
}
