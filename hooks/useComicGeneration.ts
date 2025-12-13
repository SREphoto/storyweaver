
import { useState, useRef, useCallback } from 'react';
import { ComicFace, ComicCharacter } from '../types';
import * as geminiService from '../services/geminiService';

interface UseComicGenerationProps {
    storyPremise?: string;
    scenes?: any[]; // Using any for now to avoid complex type imports if not needed
}

export const useComicGeneration = ({ storyPremise, scenes }: UseComicGenerationProps) => {
    const [faces, setFaces] = useState<ComicFace[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const generationRef = useRef(false);

    const initializeFaces = (hero: ComicCharacter) => {
        const initialFaces: ComicFace[] = [
            { id: 'cover', type: 'cover', imageUrl: hero.image, pageIndex: 0, choices: [], isLoading: false },
            { id: 'p1', type: 'story', pageIndex: 1, choices: [], isLoading: true },
            { id: 'p2', type: 'story', pageIndex: 2, choices: [], isLoading: true },
        ];
        setFaces(initialFaces);
        return initialFaces;
    };

    const generatePages = useCallback(async (currentFaces: ComicFace[], currentGenre: string, currentCharacters: ComicCharacter[]) => {
        if (!generationRef.current) return;

        // Find first loading page
        const nextIdx = currentFaces.findIndex(f => f.isLoading);
        if (nextIdx === -1) {
            setIsGenerating(false);
            return;
        }

        const face = currentFaces[nextIdx];
        const pageNum = face.pageIndex || 1;
        setIsGenerating(true);
        setError(null);

        // Build History Context
        const history = currentFaces
            .slice(0, nextIdx)
            .filter(f => f.narrative)
            .map(f => `Page ${f.pageIndex}: ${f.narrative?.caption || ''} ${f.narrative?.dialogue || ''}`)
            .join('\n');

        // Build Story Context
        const storyContext = `STORY PREMISE: ${storyPremise || 'Original Adventure'}\n
        RELEVANT SCENES: ${scenes?.slice(0, 3).map(s => s.summary).join('; ') || 'None'}`;

        try {
            // 1. Generate Beat
            const activeChars = currentCharacters.map(c => c.name);
            const villainDesc = currentCharacters.find(c => c.role === 'villain')?.description || 'Evil villain';

            const beat = await geminiService.generateComicBeat(history, pageNum, currentGenre, activeChars, villainDesc, storyContext);

            // Update Face with Beat
            const facesWithBeat = [...currentFaces];
            facesWithBeat[nextIdx] = { ...face, narrative: beat };
            setFaces(facesWithBeat);

            // 2. Generate Image
            const hero = currentCharacters.find(c => c.role === 'hero')!;
            const costar = currentCharacters.find(c => c.role === 'co-star')!;
            const villain = currentCharacters.find(c => c.role === 'villain')!;

            const imageUrl = await geminiService.generateComicPanelImage(beat, currentGenre, hero, costar, villain);

            // Finalize Page
            const finalFaces = [...facesWithBeat];
            finalFaces[nextIdx] = { ...facesWithBeat[nextIdx], imageUrl, isLoading: false };

            // Add next page if needed (up to 10)
            if (pageNum < 10) {
                finalFaces.push({ id: `p${pageNum + 1}`, type: 'story', pageIndex: pageNum + 1, choices: [], isLoading: true });
            } else {
                finalFaces.push({ id: 'back', type: 'back_cover', pageIndex: 11, choices: [], isLoading: false });
            }

            setFaces(finalFaces);

            // Recursive call for next page
            generatePages(finalFaces, currentGenre, currentCharacters);

        } catch (err: any) {
            console.error("Generation Error", err);
            setError(err.message || "Failed to generate page");
            setIsGenerating(false);

            // Mark current page as failed (optional, or just leave loading to retry)
            // For now, we leave it so user can retry
        }
    }, [storyPremise, scenes]);

    const startGeneration = (genre: string, characters: ComicCharacter[]) => {
        generationRef.current = true;
        const hero = characters.find(c => c.role === 'hero');
        if (hero) {
            const initFaces = initializeFaces(hero);
            generatePages(initFaces, genre, characters);
        }
    };

    const stopGeneration = () => {
        generationRef.current = false;
        setIsGenerating(false);
    };

    const regeneratePage = (pageIndex: number, genre: string, characters: ComicCharacter[]) => {
        // Reset the page to loading and restart generation from there
        const newFaces = [...faces];
        const faceIdx = newFaces.findIndex(f => f.pageIndex === pageIndex);
        if (faceIdx !== -1) {
            newFaces[faceIdx] = { ...newFaces[faceIdx], isLoading: true, imageUrl: undefined, narrative: undefined };
            // Remove subsequent pages to regenerate flow? Or just regenerate this one?
            // For simplicity, let's just regenerate this one and continue if needed.
            // But generatePages is recursive.

            // Better approach: Slice faces up to this page, add this page as loading, and restart.
            const resetFaces = newFaces.slice(0, faceIdx + 1);
            // Ensure the target page is loading
            resetFaces[faceIdx] = { ...resetFaces[faceIdx], isLoading: true, imageUrl: undefined, narrative: undefined };

            setFaces(resetFaces);
            generationRef.current = true;
            generatePages(resetFaces, genre, characters);
        }
    };

    return {
        faces,
        isGenerating,
        error,
        startGeneration,
        stopGeneration,
        regeneratePage
    };
};
