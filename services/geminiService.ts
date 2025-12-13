import { GoogleGenAI, Type } from "@google/genai";
import { Character, Scene, CharacterType, MapData, StoryObject, RelationshipWebData, TimelineItem, OutlineItem, StoryboardShot, Beat, ComicCharacter, ImageStyle } from '../types';

console.log("Gemini Service Initializing. API Key present:", !!(process.env.API_KEY || process.env.GEMINI_API_KEY));
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

const TEXT_MODEL_COMPLEX = 'gemini-2.0-flash-exp';
const TEXT_MODEL_FAST = 'gemini-2.0-flash-exp';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

/* 
 * Style Definitions
 * Maps ImageStyle enum to specific prompt engineering keywords.
 */
const STYLE_PROMPTS: Record<ImageStyle, string> = {
    [ImageStyle.CINEMATIC]: "Cinematic, photorealistic, 8k resolution, detailed texture, dramatic lighting, depth of field, movie still, wide dynamic range.",
    [ImageStyle.ANIME]: "Anime style, vibrant colors, clean lines, cel shaded, highly detailed, Studio Ghibli or Makoto Shinkai aesthetics.",
    [ImageStyle.WATERCOLOR]: "Watercolor painting, soft edges, artistic, painting on canvas, gentle brushstrokes, traditional media style.",
    [ImageStyle.OIL_PAINTING]: "Oil painting, textured brushwork, rich colors, classical art style, masterpiece, impasto details.",
    [ImageStyle.CYBERPUNK]: "Cyberpunk, neon lights, high tech low life, futuristic, distinct blue and pink lighting, gritty, detailed cityscape.",
    [ImageStyle.NOIR]: "Film noir, black and white, high contrast, dramatic shadows, moody, mystery, 1940s detective movie aesthetic.",
    [ImageStyle.PIXEL_ART]: "Pixel art, 16-bit or 32-bit style, retro game aesthetic, clean pixel lines.",
    [ImageStyle.CONCEPT_ART]: "Concept art, digital painting, highly detailed, polished, artstation trending, illustration.",
};

// Helper to generate an image using Gemini
async function generateImage(prompt: string, aspectRatio: string = '16:9'): Promise<string> {
    let finalPrompt = `${prompt} Aspect ratio: ${aspectRatio}.`;
    console.log(`[GeminiService] Generating image with model: ${IMAGE_MODEL}`);

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 1) {
                console.log(`[GeminiService] Retry attempt ${attempt}/${maxRetries} for image generation...`);
                // Append stricter instruction on retry
                finalPrompt += `\n\nSTRICT REQUIREMENT: Output raw image data. Do not provide a text description.`;
            }

            const response = await ai.models.generateContent({
                model: IMAGE_MODEL,
                contents: finalPrompt,
            });

            const candidate = response.candidates?.[0];
            const part = candidate?.content?.parts?.[0];

            // Detailed logging for debugging
            if (candidate?.finishReason !== 'STOP') {
                console.warn(`[GeminiService] Image generation finishReason: ${candidate?.finishReason}`);
            }
            if (candidate?.safetyRatings) {
                const blockedRatings = candidate.safetyRatings.filter(r => r.probability !== 'NEGLIGIBLE');
                if (blockedRatings.length > 0) {
                    console.warn(`[GeminiService] Non-negligible safety ratings:`, JSON.stringify(blockedRatings, null, 2));
                }
            }

            // Success Case
            if (part && 'inlineData' in part && part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }

            // Text Refusal Case
            if (part && 'text' in part && part.text) {
                console.warn(`[GeminiService] Attempt ${attempt} failed: Received text instead of image: "${part.text.substring(0, 50)}..."`);
                if (attempt === maxRetries) {
                    throw new Error(`Gemini refused to generate image (after ${maxRetries} attempts): ${part.text}`);
                }
                // Continue to next attempt
                continue;
            }

            console.error("[GeminiService] Image generation response missing inlineData:", JSON.stringify(response, null, 2));
            throw new Error(`No image data returned from Gemini. Reason: ${candidate?.finishReason || 'Unknown'}`);

        } catch (error: any) {
            console.error(`[GeminiService] Attempt ${attempt} error:`, error);
            lastError = error;
            if (attempt === maxRetries) break;
        }
    }

    throw lastError || new Error("Failed to generate image after multiple attempts.");
}

// Helper to convert File to Base64 for Gemini

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


// Helper to clean JSON string from Markdown code blocks
const cleanJson = (text: string): string => {
    if (!text) return '{}';
    let cleaned = text.trim();
    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return cleaned;
};

export async function generateCharacterProfile(name: string, type: CharacterType, initialInfo: string, traits: string, backstory: string): Promise<{ history: string, arc: string }> {
    const prompt = `Create a detailed character profile.
    Name: ${name}
    Type: ${type}
    Initial Info: ${initialInfo}
    Traits: ${traits}
    Backstory: ${backstory}

    Return JSON with "history" (detailed backstory, 2 paragraphs) and "arc" (character growth/journey).`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    history: { type: Type.STRING },
                    arc: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(cleanJson(response.text || '{"history": "", "arc": ""}'));
}

export async function analyzeStoryText(premise: string, text: string): Promise<{ characters: { name: string, type: CharacterType, description: string, traits: string, history: string, arc: string }[], scenes: { title: string, summary: string, fullText: string, characters_present: string[] }[] }> {
    const prompt = `Analyze the provided story text.
    Premise: ${premise}
    Text: ${text}

    Identify all characters and scenes.
    
    Return a JSON object with the following structure:
    {
      "characters": [
        {
          "name": "string",
          "type": "Protagonist" | "Antagonist" | "Deuteragonist" | "Mentor" | "Love Interest" | "Foil" | "Supporting Character" | "Minor Character",
          "description": "string (visuals and role)",
          "traits": "string (comma separated)",
          "history": "string (detailed backstory inferred from text)",
          "arc": "string (character journey/development inferred from text)"
        }
      ],
      "scenes": [
        {
          "title": "string",
          "summary": "string",
          "fullText": "string (the actual text of the scene if explicitly present, otherwise empty)",
          "characters_present": ["string (names)"]
        }
      ]
    }`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '{"characters": [], "scenes": []}'));
}

export async function generateNextChapter(premise: string, existingStory: string, characters: Character[], scenes: Scene[]): Promise<string> {
    const prompt = `Write the next chapter.
    Premise: ${premise}
    Context (Last 2000 chars): ${existingStory.slice(-2000)}
    Characters: ${characters.map(c => c.name).join(', ')}
    Recent Scenes: ${scenes.slice(-3).map(s => s.title).join(', ')}
    
    Write a compelling chapter.`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt
    });
    return response.text || '';
}

export async function generateRelationshipWeb(characters: Character[]): Promise<RelationshipWebData> {
    const prompt = `Analyze relationships between these characters: ${characters.map(c => c.name).join(', ')}.
    Return JSON:
    {
        "nodes": [{"id": "...", "name": "...", "type": "..."}],
        "links": [{"source": "id", "target": "id", "dynamic": "short description", "strength": "Strong" | "Developing" | "Weak"}]
    }
    Use the character names to map to provided IDs if possible, otherwise use names as IDs.`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '{"nodes": [], "links": []}'));
}

export async function generatePlotIdeas(premise: string, existingStory: string, characters: Character[]): Promise<string> {
    console.log("generatePlotIdeas called");
    console.log("Premise:", premise);
    console.log("API Key available:", !!process.env.API_KEY);

    const prompt = `Brainstorm plot ideas/twists.
    Premise: ${premise}
    Characters: ${characters.map(c => c.name).join(', ')}
    
    List 5 creative plot ideas.`;

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL_COMPLEX,
            contents: prompt
        });
        console.log("generatePlotIdeas success", response);
        return response.text || '';
    } catch (error: any) {
        console.error("generatePlotIdeas FAILED:", error);
        if (error.response) {
            console.error("Error response:", error.response);
        }
        console.error("Error message:", error.message);
        // Fallback to flash if pro fails?
        try {
            console.log("Retrying with Flash model...");
            const response = await ai.models.generateContent({
                model: TEXT_MODEL_FAST,
                contents: prompt
            });
            return response.text || '';
        } catch (retryError) {
            console.error("Retry failed:", retryError);
            throw error;
        }
    }
}

export async function generateSceneTransition(scenes: Scene[]): Promise<string> {
    const prompt = `Write a smooth narrative transition between scene "${scenes[0].title}" and "${scenes[1].title}".`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_FAST,
        contents: prompt
    });
    return response.text || '';
}

export async function generateMapData(content: string): Promise<MapData> {
    const prompt = `Generate a world map structure based on this content: ${content}.
    Return JSON:
    {
        "worldDescription": "string",
        "locations": [{"id": "loc_1", "name": "...", "description": "...", "x": 20, "y": 50}] 
    }
    x and y should be between 0 and 100.`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
}

export async function reassessNarrativeFlow(premise: string, scenes: Scene[]): Promise<string> {
    const prompt = `Analyze the narrative flow.
    Premise: ${premise}
    Scene Sequence: ${scenes.map(s => s.title).join(' -> ')}
    
    Identify pacing issues, plot holes, or structural improvements.`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt
    });
    return response.text || '';
}

export async function generateDialogue(char1: Character, char2: Character): Promise<string> {
    const prompt = `Write a dialogue scene between ${char1.name} (${char1.traits}) and ${char2.name} (${char2.traits}).`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt
    });
    return response.text || '';
}

export async function generateObject(premise: string): Promise<StoryObject> {
    const prompt = `Invent a key object/artifact for the story: ${premise}.
    Return JSON: { "name": "...", "appearance": "...", "history": "...", "significance": "..." }`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
}

export async function generateSetting(premise: string, sceneContext?: { title: string, summary: string }): Promise<string> {
    const prompt = `Describe the setting.
    Premise: ${premise}
    ${sceneContext ? `Scene: ${sceneContext.title}\nSummary: ${sceneContext.summary}` : ''}
    
    Provide a rich, sensory description (sight, sound, smell).`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt
    });
    return response.text || '';
}

export async function generateOutline(premise: string, characters: Character[], plotIdeas?: string): Promise<OutlineItem[]> {
    const prompt = `Create a detailed story outline.
    Premise: ${premise}
    Characters: ${characters.map(c => c.name).join(', ')}
    Ideas: ${plotIdeas || 'None'}
    
    Return JSON array of objects: { "act": "Act I", "title": "...", "summary": "..." }`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '[]'));
}

export async function generateMidjourneyPrompts(scene: Scene, characters: Character[]): Promise<string> {
    // 1. Construct Visual Context
    let visualContext = `SCENE SETTING:\n${scene.settingDescription || scene.summary}\n\nCHARACTERS PRESENT:\n`;

    characters.forEach(c => {
        let visualDesc = `Name: ${c.name}\n`;
        if (c.visualStats) {
            visualDesc += `Body: ${c.visualStats.height}, ${c.visualStats.build}, ${c.visualStats.distinguishingFeatures}.\n`;
            visualDesc += `Face: ${c.visualStats.hairColor} hair, ${c.visualStats.eyeColor} eyes.\n`;
        } else {
            visualDesc += `Appearance: ${c.initialInfo}\n`;
        }

        if (c.outfits && c.outfits.length > 0) {
            const activeOutfit = c.outfits.find(o => o.id === c.activeOutfitId) || c.outfits[0];
            visualDesc += `Wearing: ${activeOutfit.description}\n`;
        } else {
            visualDesc += `Wearing: Appropriate attire for role (${c.type}).\n`;
        }
        visualContext += `${visualDesc}--\n`;
    });

    const prompt = `Create 4 detailed Midjourney image generation prompts for the following scene.

    CONTEXT:
    Scene Title: "${scene.title}"
    Action Summary: ${scene.summary}
    
    VISUAL DETAILS:
    ${visualContext}
    
    IMPORTANT INSTRUCTIONS:
    1. Do NOT use character names in the prompts. Replace names with their physical descriptions (e.g., instead of "John", say "a tall muscular man with a scar wearing battle armor").
    2. Include details about the background, lighting, and camera angle.
    3. Ensure the characters described match the provided visual stats and outfits.
    4. Provide a list of prompts: Wide Shot, Medium Shot, Close Up, and Action Shot.`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt
    });
    return response.text || '';
}

export async function generateWithContext(prompt: string, context: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: `Context:\n${context}\n\nInstruction:\n${prompt}`
    });
    return response.text || '';
}

export async function generateImageForScene(scene: Scene, characters: Character[], style: ImageStyle = ImageStyle.CINEMATIC): Promise<string> {
    const styleKeywords = STYLE_PROMPTS[style] || STYLE_PROMPTS[ImageStyle.CINEMATIC];
    const prompt = `Generate a cinematic image for the scene: "${scene.title}".
    Summary: ${scene.summary}
    Setting: ${scene.settingDescription || 'Appropriate to the story'}
    
    Characters present:
    ${characters.map(c => `${c.name}: ${c.visualStats ? `${c.visualStats.build}, ${c.visualStats.hairColor} hair` : c.initialInfo}`).join('\n')}
    
    Style: ${styleKeywords}`;

    return await generateImage(prompt, '16:9');
}

export async function generateCharacterImage(character: Character, style: ImageStyle = ImageStyle.CONCEPT_ART): Promise<string> {
    const styleKeywords = STYLE_PROMPTS[style] || STYLE_PROMPTS[ImageStyle.CONCEPT_ART];
    const prompt = `Generate a full body character portrait.
    Name: ${character.name}
    Type: ${character.type}
    Appearance: ${character.visualStats ?
            `Height: ${character.visualStats.height}, Build: ${character.visualStats.build}, Hair: ${character.visualStats.hairColor}, Eyes: ${character.visualStats.eyeColor}, Features: ${character.visualStats.distinguishingFeatures}`
            : character.initialInfo}
    Outfit: ${character.outfits && character.outfits.length > 0 ? character.outfits[0].description : 'Standard attire'}
    
    Style: ${styleKeywords}, neutral background.`;

    const aspectRatio = (style === ImageStyle.PIXEL_ART) ? '1:1' : '3:4'; // Pixel art looks better square
    return await generateImage(prompt, aspectRatio);
}




export async function analyzeVideo(videoFile: File | null, videoUrl: string, prompt: string): Promise<string> {
    let contentParts: any[] = [{ text: prompt }];

    if (videoFile) {
        const filePart = await fileToGenerativePart(videoFile);
        contentParts = [filePart, { text: prompt }];
    } else if (videoUrl) {
        contentParts = [{ text: `${prompt}\n\nContext Video URL: ${videoUrl}` }];
    }

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: { parts: contentParts }
    });
    return response.text || '';
}

export async function generateTimeline(plotIdeas: string): Promise<TimelineItem[]> {
    const prompt = `Convert these plot ideas into a chronological timeline.
    Ideas: ${plotIdeas}
    Return JSON array: [{ "title": "...", "summary": "..." }]`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '[]'));
}

export async function generateSceneDetails(premise: string, previousScenes: string, scene: Scene, characters: Character[]): Promise<string> {
    const prompt = `Write the full prose for scene "${scene.title}".
    Premise: ${premise}
    Previous Context: ${previousScenes}
    Scene Summary: ${scene.summary}
    Characters: ${characters.map(c => c.name).join(', ')}
    
    Write engaging, formatted story text.`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt
    });
    return response.text || '';
}

export async function generateSceneSetting(scene: Scene): Promise<string> {
    const prompt = `Describe the setting for scene "${scene.title}".
    Summary: ${scene.summary}
    
    Focus on atmosphere, lighting, and sensory details.`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt
    });
    return response.text || '';
}

export async function generateScript(scene: Scene, characters: Character[]): Promise<string> {
    const prompt = `Write a screenplay script for scene "${scene.title}".
    Summary: ${scene.summary}
    Characters: ${characters.map(c => c.name).join(', ')}
    
    Use standard screenplay format (Scene Heading, Action, Character, Dialogue).`;
    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt
    });
    return response.text || '';
}

export async function generateStoryboardAnalysis(scene: Scene, characters: Character[], options?: { stylize?: number, aspectRatio?: string, version?: string }): Promise<StoryboardShot[]> {
    const { stylize = 100, aspectRatio = '16:9', version = '6' } = options || {};

    const prompt = `Create a storyboard shot list for "${scene.title}".
    Script/Summary: ${scene.script || scene.summary}
    
    Return JSON array of objects: 
    { "id": "shot_1", "shotType": "Wide/Close-up/etc", "visualDescription": "...", "midjourneyPrompt": "..." }
    
    IMPORTANT: For the "midjourneyPrompt" field, ensure you append the following parameters to the end of the prompt string: --stylize ${stylize} --ar ${aspectRatio} --v ${version}`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '[]'));
}

export async function generateStoryboardSketch(description: string): Promise<string> {
    const prompt = `Create a loose storyboard sketch for: ${description}.
    Style: Black and white, rough sketch, pencil or ink style, storyboard aesthetic.`;

    return await generateImage(prompt, '16:9');
}

export async function analyzeCharacterVisuals(file: File, mode: 'PHYSICAL_TRAITS' | 'OUTFIT_DETAILS' = 'PHYSICAL_TRAITS'): Promise<{ description: string, traits: string }> {
    const filePart = await fileToGenerativePart(file);
    let prompt = '';

    if (mode === 'PHYSICAL_TRAITS') {
        prompt = `Analyze this character image. Describe their physical appearance (height, build, hair, eyes, features) to be used in a visual prompt. Also infer personality traits.
        Return JSON: { "description": "string (physical stats)", "traits": "string" }`;
    } else {
        prompt = `Analyze the outfit in this image. Describe it in detail (materials, colors, style) so it can be recreated in a Midjourney prompt.
        Return JSON: { "description": "string (outfit details)", "traits": "string (style/vibe)" }`;
    }

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_FAST,
        contents: { parts: [filePart, { text: prompt }] },
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
}

// --- COMIC GENERATION FUNCTIONS ---

export async function generateComicBeat(historyText: string, pageNum: number, genre: string, activeCharacters: string[], villainDesc: string, storyContext: string): Promise<Beat> {
    const instruction = pageNum === 10 ? "This is the last page. End with a cliffhanger." :
        pageNum === 1 ? "Establish the setting and the hero." :
            "Advance the plot with conflict.";

    const prompt = `You are writing a comic book script based on a story.
    STORY CONTEXT: ${storyContext}
    
    PAGE ${pageNum}. GENRE: ${genre}.
    CHARACTERS:
    - ACTIVE: ${activeCharacters.join(', ')}
    - VILLAIN: ${villainDesc}
    
    PREVIOUS PANELS: ${historyText}
    
    INSTRUCTION: ${instruction}
    
    OUTPUT STRICT JSON:
    {
      "caption": "Narrator text...",
      "dialogue": "Character speech...",
      "scene": "Visual description mentioning HERO or VILLAIN for image generation",
      "focus_char": "hero" | "co-star" | "villain" | "other",
      "hero_emotion": "Angry",
      "costar_emotion": "Scared",
      "villain_emotion": "Smug"
    }`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_COMPLEX,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
}

export async function generateComicPanelImage(beat: Beat, genre: string, hero: ComicCharacter, costar: ComicCharacter, villain: ComicCharacter): Promise<string> {
    const prompt = `Comic book panel, ${genre} style.
    Scene: ${beat.scene}
    
    Characters:
    Hero: ${hero.name} (${hero.description}) - Emotion: ${beat.hero_emotion}
    ${costar ? `Co-star: ${costar.name} (${costar.description}) - Emotion: ${beat.costar_emotion}` : ''}
    ${villain ? `Villain: ${villain.name} (${villain.description}) - Emotion: ${beat.villain_emotion}` : ''}
    
    Focus: ${beat.focus_char}
    
    Style: ${genre} comic book art, vibrant colors, dynamic composition.`;

    return await generateImage(prompt, '2:3'); // Comic panel ratio
}

export async function generateVillain(heroDesc: string, genre: string): Promise<{ name: string, desc: string, image: string }> {
    // 1. Text generation for persona
    const textPrompt = `Create a villain for a ${genre} comic who opposes a hero described as: "${heroDesc}".
    Return JSON: { "name": "...", "desc": "Visual description..." }`;

    const textResponse = await ai.models.generateContent({
        model: TEXT_MODEL_FAST,
        contents: textPrompt,
        config: { responseMimeType: 'application/json' }
    });
    const persona = JSON.parse(cleanJson(textResponse.text || '{}'));

    // 2. Image generation
    let image = '';
    try {
        const imagePrompt = `Comic book villain portrait.
        Name: ${persona.name}
        Description: ${persona.desc}
        Genre: ${genre}
        Style: ${genre} comic book art, close up character portrait.`;

        image = await generateImage(imagePrompt, '1:1');
    } catch (e) {
        console.error("Failed to generate villain image", e);
    }

    return { ...persona, image };
}

export async function generateItemImage(item: StoryObject): Promise<string> {
    const prompt = `Visual representation of a story item/artifact.
    Name: ${item.name}
    Description: ${item.appearance}
    History: ${item.history}
    Style: Concept art, detailed, high quality, fantasy/sci-fi aesthetic appropriate for the item.
    Object isolated on simple background.`;

    return await generateImage(prompt, '1:1');
}
