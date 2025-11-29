import React, { useRef } from 'react';
import { Scene, Character, SavedMaterial, Tool } from '../../types';
import StoryInputs from '../StoryInputs';
import SceneCard from '../SceneCard';
import { BookOpenIcon, RefreshCwIcon, ImportIcon, PlusIcon } from '../icons';
import { useStory } from '../../contexts/StoryContext';

interface StoryViewProps {
    storyPremise: string;
    setStoryPremise: (premise: string) => void;
    storyTextToAnalyze: string;
    setStoryTextToAnalyze: (text: string) => void;
    onAnalyze: () => void;
    isLoading: boolean;
    characters: Character[];
    scenes: Scene[];
    savedMaterials: SavedMaterial[];
    onCompileBook: () => void;
    onGenerate: (tool: Tool) => void;
    filteredScenes: Scene[];
    selectedSceneIds: Set<string>;
    onToggleSelect: (id: string, type: 'scene') => void;
    onUpdateScene: (id: string, updates: Partial<Scene>) => void;
    onDeleteScene: (id: string) => void;
    onGenerateSceneDetails: (id: string) => void;
    onGenerateSceneImage: (scene: Scene) => void;
    onOpenStoryboard: (id: string) => void;
    reorderScenes: (scenes: Scene[]) => void;
    onOpenSplitView: (type: 'scene', id: string) => void;
    addScene: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({
    storyPremise, setStoryPremise, storyTextToAnalyze, setStoryTextToAnalyze, onAnalyze, isLoading,
    characters, scenes, savedMaterials, onCompileBook, onGenerate, filteredScenes,
    selectedSceneIds, onToggleSelect, onUpdateScene, onDeleteScene, onGenerateSceneDetails,
    onGenerateSceneImage, onOpenStoryboard, reorderScenes, onOpenSplitView, addScene
}) => {
    const { loadProject } = useStory();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <StoryInputs
                        storyPremise={storyPremise}
                        setStoryPremise={setStoryPremise}
                        storyTextToAnalyze={storyTextToAnalyze}
                        setStoryTextToAnalyze={setStoryTextToAnalyze}
                        onAnalyze={onAnalyze}
                        isLoading={isLoading}
                    />
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center space-y-4">
                    <h3 className="text-xl font-serif font-bold text-brand-text">Story Statistics</h3>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-brand-secondary">{characters.length}</p>
                            <p className="text-xs text-brand-text-muted uppercase tracking-wider">Characters</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-brand-accent">{scenes.length}</p>
                            <p className="text-xs text-brand-text-muted uppercase tracking-wider">Scenes</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-emerald-400">{savedMaterials.length}</p>
                            <p className="text-xs text-brand-text-muted uppercase tracking-wider">Saved Items</p>
                        </div>
                    </div>
                    {scenes.length > 0 && (
                        <button
                            onClick={onCompileBook}
                            className="mt-4 flex items-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition shadow-lg transform hover:scale-105"
                        >
                            <BookOpenIcon className="w-5 h-5" />
                            Read Story
                        </button>
                    )}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-2xl font-serif font-bold text-brand-text">Scene List</h2>
                    <div className="flex gap-2">
                        <button onClick={() => onGenerate(Tool.REASSESS_FLOW)} disabled={isLoading || scenes.length < 2} className="flex items-center gap-2 text-xs bg-brand-primary/50 hover:bg-brand-primary text-white px-3 py-1.5 rounded-full transition border border-white/10">
                            <RefreshCwIcon className="w-3 h-3" /> Reassess Flow
                        </button>
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) loadProject(file);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }} accept=".json" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs bg-brand-primary/50 hover:bg-brand-primary text-white px-3 py-1.5 rounded-full transition border border-white/10">
                            <ImportIcon className="w-3 h-3" /> Import
                        </button>
                    </div>
                </div>
                {/* Story View Scene Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredScenes.map((scene, index) => (
                        <SceneCard
                            key={scene.id}
                            scene={scene}
                            isSelected={selectedSceneIds.has(scene.id)}
                            onToggleSelect={() => onToggleSelect(scene.id, 'scene')}
                            onUpdate={onUpdateScene}
                            onDelete={() => onDeleteScene(scene.id)}
                            onExport={() => { }}
                            allCharacters={characters}
                            isLoading={isLoading}
                            onGenerateDetails={onGenerateSceneDetails}
                            onGenerateImage={onGenerateSceneImage}
                            onOpenStoryboard={s => onOpenStoryboard(s.id)}
                            isFirst={index === 0}
                            isLast={index === scenes.length - 1}
                            layout="vertical"
                            onMove={(dir) => {
                                if (dir === 'up' && index > 0) {
                                    const newScenes = [...scenes];
                                    [newScenes[index], newScenes[index - 1]] = [newScenes[index - 1], newScenes[index]];
                                    reorderScenes(newScenes);
                                } else if (dir === 'down' && index < scenes.length - 1) {
                                    const newScenes = [...scenes];
                                    [newScenes[index], newScenes[index + 1]] = [newScenes[index + 1], newScenes[index]];
                                    reorderScenes(newScenes);
                                }
                            }}
                            onOpenSplitView={() => onOpenSplitView('scene', scene.id)}
                        />
                    ))}
                    <button onClick={addScene} className="h-full min-h-[200px] border-2 border-dashed border-white/10 rounded-xl text-brand-text-muted hover:text-white hover:border-brand-secondary/50 hover:bg-brand-secondary/5 transition flex flex-col justify-center items-center gap-3 group">
                        <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition"><PlusIcon className="w-6 h-6" /></div>
                        <span className="font-medium">Add New Scene</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryView;
