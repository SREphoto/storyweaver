import React from 'react';
import { Tool, SavedMaterial, Scene, GeneratedContent } from '../types';
import { useStory } from '../contexts/StoryContext';
import {
    ChevronRightIcon, ChevronLeftIcon, WandSparklesIcon, ChevronDownIcon, TrashIcon,
    BookOpenIcon, UserPlusIcon, TimelineIcon, WriteIcon, ImageIcon, ClipboardListIcon
} from './icons';
import WriterTools from './WriterTools';
import GlobalGenerator from './GlobalGenerator';
import RecentGenerations from './RecentGenerations';

interface RightPanelProps {
    isRightPanelOpen: boolean;
    setIsRightPanelOpen: (isOpen: boolean) => void;
    onGenerate: (tool: Tool, overrideSelections?: { characterIds?: Set<string>, sceneIds?: Set<string> }) => Promise<void>;
    onGenerateWithContext: (prompt: string, contextSource: 'all' | 'selection') => Promise<void>;
    onGenerateTimeline: (plotIdeas: string) => Promise<void>;
    selectedCharacterIds: Set<string>;
    selectedSceneIds: Set<string>;
    onBatchUpdateSelection: (type: 'character' | 'scene', ids: Set<string>) => void;
    filteredMaterials: SavedMaterial[];
    onSaveMaterial: (content: GeneratedContent) => void;
    onViewImage: (material: SavedMaterial) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
    isRightPanelOpen,
    setIsRightPanelOpen,
    onGenerate,
    onGenerateWithContext,
    onGenerateTimeline,
    selectedCharacterIds,
    selectedSceneIds,
    onBatchUpdateSelection,
    filteredMaterials,
    onSaveMaterial,
    onViewImage
}) => {
    const {
        isLoading, loadingMessage, error, generatedContent, setGeneratedContent,
        characters, scenes, deleteSavedMaterial, updateScene
    } = useStory();

    const getMaterialIcon = (type: string) => {
        const props = { className: "w-4 h-4 text-brand-text-muted" };
        switch (type) {
            case Tool.CHAPTER: return <BookOpenIcon {...props} />;
            case 'CHARACTER_PROFILE': return <UserPlusIcon {...props} />;
            case 'TIMELINE': return <TimelineIcon {...props} />;
            case Tool.SCENE_WRITER: return <WriteIcon {...props} />;
            case 'IMAGE': return <ImageIcon {...props} />;
            default: return <ClipboardListIcon {...props} />;
        }
    }

    return (
        <aside className={`fixed inset-y-0 right-0 z-40 w-80 lg:w-96 glass-panel border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <button
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="absolute top-1/2 -left-3 w-6 h-12 bg-brand-surface border border-white/10 rounded-l-lg flex items-center justify-center text-brand-text-muted hover:text-white cursor-pointer z-50 shadow-md"
                title="Toggle Assistant"
            >
                {isRightPanelOpen ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
            </button>

            <div className="p-5 border-b border-white/5 bg-brand-surface/50 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
                    <WandSparklesIcon className="w-5 h-5 text-brand-secondary" />
                    AI Assistant
                </h2>
            </div>

            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-6">

                {/* Writer Tools */}
                <div>
                    <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Toolkit</h3>
                    <WriterTools
                        onGenerate={onGenerate}
                        isLoading={isLoading}
                        characters={characters}
                        scenes={scenes}
                        selectedCharacterIds={selectedCharacterIds}
                        selectedSceneIds={selectedSceneIds}
                        onBatchUpdateSelection={onBatchUpdateSelection}
                        hasContent={scenes.length > 0}
                    />
                </div>

                {/* Global Chat */}
                <div>
                    <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Chat / Command</h3>
                    <GlobalGenerator onGenerate={onGenerateWithContext} isLoading={isLoading} />
                </div>

                {/* Saved Materials List (Mini) */}
                <div>
                    <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Recent Generations</h3>
                    <RecentGenerations
                        materials={filteredMaterials}
                        onSelect={(m) => {
                            if (m.type === 'IMAGE') {
                                onViewImage(m);
                            } else {
                                setGeneratedContent({ title: m.title, content: m.content, type: m.type, sourceId: undefined });
                                setIsRightPanelOpen(true);
                            }
                        }}
                    />
                </div>
            </div>

        </aside>
    );
};

export default RightPanel;
