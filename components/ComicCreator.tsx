import React, { useState, useEffect, useRef } from 'react';
import { ComicCharacter, ComicFace, Scene, Character } from '../types';
import ComicSetup from './ComicSetup';
import ComicBook from './ComicBook';
import StoryMap from './StoryMap';
import SoundManager from './SoundManager';
import * as geminiService from '../services/geminiService';
import { BookOpenIcon, ChevronLeftIcon, WandSparklesIcon } from './icons';

interface ComicCreatorProps {
    storyPremise?: string;
    scenes?: Scene[];
    characters?: Character[];
}

const ComicCreator: React.FC<ComicCreatorProps> = ({ storyPremise, scenes, characters: storyCharacters }) => {
    const [mode, setMode] = useState<'setup' | 'create'>('setup');
    const [genre, setGenre] = useState('Superhero');
    const [characters, setCharacters] = useState<ComicCharacter[]>([]);
    const [faces, setFaces] = useState<ComicFace[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const generationRef = useRef(false);

    const handleSetupComplete = (hero: ComicCharacter, costar: ComicCharacter, villain: ComicCharacter, selectedGenre: string) => {
        setCharacters([hero, costar, villain]);
        setGenre(selectedGenre);
        setMode('create');
        
        // Init Faces (Cover, Page 1, Page 2...)
        const initialFaces: ComicFace[] = [
            { id: 'cover', type: 'cover', imageUrl: hero.image, pageIndex: 0, choices: [], isLoading: false }, 
            { id: 'p1', type: 'story', pageIndex: 1, choices: [], isLoading: true },
            { id: 'p2', type: 'story', pageIndex: 2, choices: [], isLoading: true },
        ];
        setFaces(initialFaces);
        
        // Start Generation Loop
        generationRef.current = true;
        generatePages(initialFaces, selectedGenre, [hero, costar, villain]);
    };

    const generatePages = async (currentFaces: ComicFace[], currentGenre: string, currentCharacters: ComicCharacter[]) => {
        // Find first loading page
        const nextIdx = currentFaces.findIndex(f => f.isLoading);
        if (nextIdx === -1 || !generationRef.current) return;

        const face = currentFaces[nextIdx];
        const pageNum = face.pageIndex || 1;
        setIsGenerating(true);

        // Build History Context
        const history = currentFaces
            .slice(0, nextIdx)
            .filter(f => f.narrative)
            .map(f => `Page ${f.pageIndex}: ${f.narrative?.caption || ''} ${f.narrative?.dialogue || ''}`)
            .join('\n');

        // Build Story Context (Premise + Recent Scenes)
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
            setIsGenerating(false);

            // Recursive call for next page
            generatePages(finalFaces, currentGenre, currentCharacters);

        } catch (error) {
            console.error("Generation Error", error);
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col relative">
            {mode === 'setup' ? (
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    <ComicSetup 
                        onComplete={handleSetupComplete} 
                        existingCharacters={storyCharacters || []}
                    />
                </div>
            ) : (
                <div className="flex-grow flex overflow-hidden animate-in fade-in duration-700">
                    <SoundManager pageIndex={faces.filter(f => !f.isLoading).length} genre={genre} />
                    
                    {/* Main Book Area */}
                    <div className="flex-grow relative flex items-center justify-center">
                         {/* Background Tint for Focus */}
                         <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                        <div className="absolute top-4 left-4 z-10">
                            <button 
                                onClick={() => { generationRef.current = false; setMode('setup'); }} 
                                className="glass-panel px-4 py-2 rounded-full text-white hover:bg-white/10 flex items-center gap-2 font-bold transition border border-white/10"
                            >
                                <ChevronLeftIcon className="w-4 h-4" /> BACK TO SETUP
                            </button>
                        </div>

                         {/* Generation Indicator */}
                        {isGenerating && (
                            <div className="absolute top-4 right-4 z-10 glass-panel px-4 py-2 rounded-full flex items-center gap-2 border border-brand-secondary/30">
                                <WandSparklesIcon className="w-4 h-4 text-brand-secondary animate-spin" />
                                <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Generating Page {faces.find(f => f.isLoading)?.pageIndex}...</span>
                            </div>
                        )}

                        <div className="relative z-0 transform scale-90 lg:scale-100 transition-transform duration-500">
                             <ComicBook faces={faces} />
                        </div>
                    </div>

                    {/* Sidebar Story Map */}
                    <div className="w-80 hidden xl:block h-full border-l border-white/10 glass-panel z-10">
                        <StoryMap faces={faces} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComicCreator;
