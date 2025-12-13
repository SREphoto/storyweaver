import React, { useState } from 'react';
import { ComicCharacter, Scene, Character } from '../types';
import ComicSetup from './ComicSetup';
import ComicBook from './ComicBook';
import StoryMap from './StoryMap';
import SoundManager from './SoundManager';
import { BookOpenIcon, ChevronLeftIcon, WandSparklesIcon, RefreshCwIcon } from './icons'; // Assuming ArrowPathIcon exists or I will use text
import { useComicGeneration } from '../hooks/useComicGeneration';

interface ComicCreatorProps {
    storyPremise?: string;
    scenes?: Scene[];
    characters?: Character[];
}

const ComicCreator: React.FC<ComicCreatorProps> = ({ storyPremise, scenes, characters: storyCharacters }) => {
    const [mode, setMode] = useState<'setup' | 'create'>('setup');
    const [genre, setGenre] = useState('Superhero');
    const [characters, setCharacters] = useState<ComicCharacter[]>([]);

    const {
        faces,
        isGenerating,
        error,
        startGeneration,
        stopGeneration,
        regeneratePage
    } = useComicGeneration({ storyPremise, scenes });

    const handleSetupComplete = (hero: ComicCharacter, costar: ComicCharacter, villain: ComicCharacter, selectedGenre: string) => {
        setCharacters([hero, costar, villain]);
        setGenre(selectedGenre);
        setMode('create');
        startGeneration(selectedGenre, [hero, costar, villain]);
    };

    const handleRegenerateCurrent = () => {
        // Find the current visible page (simplified logic: usually the last one or user selected)
        // For now, let's just regenerate the last generated page that isn't a cover
        const lastPage = [...faces].reverse().find(f => f.type === 'story' && !f.isLoading);
        if (lastPage) {
            regeneratePage(lastPage.pageIndex, genre, characters);
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

                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <button
                                onClick={() => { stopGeneration(); setMode('setup'); }}
                                className="glass-panel px-4 py-2 rounded-full text-white hover:bg-white/10 flex items-center gap-2 font-bold transition border border-white/10"
                            >
                                <ChevronLeftIcon className="w-4 h-4" /> BACK TO SETUP
                            </button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-xl backdrop-blur-md border border-red-400">
                                <p className="font-bold flex items-center gap-2">
                                    ⚠️ Generation Failed
                                </p>
                                <p className="text-sm opacity-90">{error}</p>
                                <button
                                    onClick={handleRegenerateCurrent}
                                    className="mt-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm w-full transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

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

                        {/* Regenerate Control (Bottom Right) */}
                        {!isGenerating && faces.length > 3 && (
                            <div className="absolute bottom-8 right-8 z-10">
                                <button
                                    onClick={handleRegenerateCurrent}
                                    className="glass-panel px-4 py-2 rounded-full text-white hover:bg-white/10 flex items-center gap-2 font-bold transition border border-white/10"
                                    title="Regenerate the last page"
                                >
                                    <span className="w-4 h-4">↻</span> REGENERATE PAGE
                                </button>
                            </div>
                        )}
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
