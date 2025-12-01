
import React, { useState, useEffect } from 'react';
import { Scene, Character } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, UserIcon, WandSparklesIcon, ChevronDownIcon, ChevronUpIcon } from './icons';

interface VisualNovelViewProps {
    scenes: Scene[];
    allCharacters: Character[];
    onGenerateImage: (scene: Scene) => void;
    onGenerateCharacterImage: (character: Character) => void;
}

const VisualNovelView: React.FC<VisualNovelViewProps> = ({ scenes, allCharacters, onGenerateImage, onGenerateCharacterImage }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTextVisible, setIsTextVisible] = useState(true);

    const currentScene = scenes[currentIndex];

    // Resolve characters present in the current scene
    const presentCharacters = React.useMemo(() => {
        if (!currentScene || !currentScene.characterIds) return [];
        return allCharacters.filter(c => currentScene.characterIds!.includes(c.id));
    }, [currentScene, allCharacters]);

    const handleNext = () => {
        if (currentIndex < scenes.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    if (scenes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-brand-text-muted p-10 text-center">
                <div className="p-6 bg-brand-surface rounded-full mb-4 opacity-50">
                    <ImageIcon className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-bold mb-2">No Scenes Available</h2>
                <p>Create scenes in the Story view to experience them here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-6rem)] gap-4 p-4 lg:p-0">
            {/* Visual Stage */}
            <div className="flex-grow relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black group">

                {/* Background Layer */}
                {currentScene.headerImage ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
                        style={{ backgroundImage: `url(${currentScene.headerImage})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-bg to-brand-surface flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-brand-text-muted mb-4 opacity-50 italic">No visual generated for this scene.</p>
                            <button
                                onClick={() => onGenerateImage(currentScene)}
                                className="flex items-center gap-2 bg-brand-secondary/20 hover:bg-brand-secondary text-brand-secondary hover:text-white px-6 py-3 rounded-full transition border border-brand-secondary/30"
                            >
                                <WandSparklesIcon className="w-5 h-5" />
                                Generate Scene Art
                            </button>
                        </div>
                    </div>
                )}

                {/* Character Layer */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end px-10 pb-[180px] gap-4 lg:gap-16 pointer-events-none">
                    {presentCharacters.map((char, idx) => (
                        <div key={char.id} className="relative flex flex-col items-center transition-all duration-500 transform translate-y-0">
                            {char.headerImage ? (
                                <img
                                    src={char.headerImage}
                                    alt={char.name}
                                    className="w-32 h-32 lg:w-64 lg:h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/10 transform hover:scale-105 transition pointer-events-auto"
                                />
                            ) : (
                                <div className="w-32 h-32 lg:w-48 lg:h-64 bg-brand-surface/80 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center p-4 pointer-events-auto">
                                    <UserIcon className="w-12 h-12 text-brand-text-muted mb-2 opacity-50" />
                                    <span className="text-xs text-brand-text-muted font-bold">{char.name}</span>
                                    <button
                                        onClick={() => onGenerateCharacterImage(char)}
                                        className="mt-2 text-[10px] bg-brand-secondary text-white px-2 py-1 rounded hover:bg-opacity-80 transition"
                                    >
                                        Generate
                                    </button>
                                </div>
                            )}
                            {/* Name Tag */}
                            <div className="mt-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs lg:text-sm font-bold text-white shadow-lg">
                                {char.name}
                            </div>
                        </div>
                    ))}
                </div>

                const [isTextVisible, setIsTextVisible] = useState(true);

                // ... (existing code)

                {/* Dialogue / Text Box Layer */}
                <div className={`absolute bottom-6 left-4 right-4 lg:left-12 lg:right-12 transition-all duration-300 ease-in-out flex flex-col ${isTextVisible ? 'min-h-[140px] max-h-[35vh] bg-brand-surface/90 border border-white/10 p-6' : 'h-12 w-auto self-start bg-transparent border-none p-0'}`}>

                    {/* Toggle Button (Always Visible) */}
                    <div className={`flex justify-between items-center ${isTextVisible ? 'mb-2' : 'absolute bottom-0 left-0 bg-brand-surface/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-lg'}`}>
                        {isTextVisible && (
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-serif font-bold text-brand-secondary drop-shadow-sm truncate max-w-[200px]">{currentScene.title}</h3>
                                <span className="text-xs font-mono text-brand-text-muted bg-black/20 px-2 py-1 rounded">Scene {currentIndex + 1}/{scenes.length}</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsTextVisible(!isTextVisible)}
                            className={`text-xs font-bold uppercase tracking-wider text-brand-text-muted hover:text-white transition flex items-center gap-2 ${!isTextVisible && 'w-full h-full'}`}
                        >
                            {isTextVisible ? (
                                <><span>Hide Text</span> <ChevronDownIcon className="w-4 h-4" /></>
                            ) : (
                                <><span className="text-brand-secondary">Show Text</span> <ChevronUpIcon className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>

                    {/* Text Content */}
                    {isTextVisible && (
                        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                            <p className="text-lg font-serif leading-relaxed text-brand-text/90 whitespace-pre-wrap">
                                {currentScene.fullText || currentScene.summary || <span className="italic opacity-50">No text available for this scene.</span>}
                            </p>
                        </div>
                    )}
                </div>

                {/* Controls Layer (Hover Only) */}
                <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="pointer-events-auto w-12 h-12 rounded-full bg-black/50 hover:bg-brand-secondary text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all transform hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === scenes.length - 1}
                        className="pointer-events-auto w-12 h-12 rounded-full bg-black/50 hover:bg-brand-secondary text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all transform hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Scene Strip Navigation */}
            <div className="h-24 flex gap-3 overflow-x-auto custom-scrollbar pb-2 px-2">
                {scenes.map((scene, idx) => (
                    <button
                        key={scene.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative min-w-[140px] rounded-xl overflow-hidden border-2 transition-all duration-200 group flex-shrink-0 ${idx === currentIndex ? 'border-brand-secondary scale-105 shadow-lg shadow-brand-secondary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                        {scene.headerImage ? (
                            <img src={scene.headerImage} className="w-full h-full object-cover" alt={scene.title} />
                        ) : (
                            <div className="w-full h-full bg-brand-surface flex items-center justify-center text-brand-text-muted text-xs italic px-2 text-center">
                                {scene.title}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                            <span className="text-[10px] font-bold text-white truncate w-full text-left">{idx + 1}. {scene.title}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VisualNovelView;
