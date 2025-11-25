
import React, { useState } from 'react';
import { Tool, Character, Scene } from '../types';
import { BookOpenIcon, LightbulbIcon, NetworkIcon, LinkIcon, MapIcon, MessageSquareIcon, GemIcon, MountainIcon, ListOrderedIcon, CameraIcon, SparklesIcon } from './icons';
import ToolSelectionModal from './ToolSelectionModal';

interface WriterToolsProps {
    onGenerate: (tool: Tool, overrideSelections?: { characterIds?: Set<string>, sceneIds?: Set<string> }) => void;
    isLoading: boolean;
    characters: Character[];
    scenes: Scene[];
    selectedCharacterIds: Set<string>;
    selectedSceneIds: Set<string>;
    onBatchUpdateSelection: (type: 'character' | 'scene', ids: Set<string>) => void;
    hasContent: boolean;
}

const WriterTools: React.FC<WriterToolsProps> = ({
    onGenerate,
    isLoading,
    characters,
    scenes,
    selectedCharacterIds,
    selectedSceneIds,
    onBatchUpdateSelection,
    hasContent
}) => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);

    const tools = [
        {
            id: Tool.CHAPTER,
            label: 'Generate Chapter',
            icon: <BookOpenIcon className="w-5 h-5" />,
            description: "Writes the next chapter based on selected characters and scenes.",
            color: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-rose-900/20",
            needsModal: true,
        },
        {
            id: Tool.DIALOGUE_GENERATOR,
            label: 'Dialogue Generator',
            icon: <MessageSquareIcon className="w-5 h-5" />,
            description: "Generates a dialogue snippet between two characters.",
            color: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-900/20",
            needsModal: true,
        },
        {
            id: Tool.MIDJOURNEY_PROMPTS,
            label: 'Midjourney Prompt Writer',
            icon: <CameraIcon className="w-5 h-5" />,
            description: "Generates a list of detailed visual prompts for scenes and characters.",
            color: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-900/20",
            needsModal: true,
        },
        {
            id: Tool.SETTING_GENERATOR,
            label: 'Describe a Setting',
            icon: <MountainIcon className="w-5 h-5" />,
            description: "Generates a rich, multi-sensory description of a specific scene's location.",
            color: "bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 shadow-teal-900/20",
            needsModal: true,
        },
        {
            id: Tool.RELATIONSHIP_WEB,
            label: 'Relationship Web',
            icon: <NetworkIcon className="w-5 h-5" />,
            description: "Analyzes the dynamics between selected characters.",
            color: "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-purple-900/20",
            needsModal: true,
        },
        {
            id: Tool.PLOT_IDEAS,
            label: 'Plot Ideas',
            icon: <LightbulbIcon className="w-5 h-5" />,
            description: "Brainstorms new plot twists and ideas for your story.",
            color: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-amber-900/20",
            needsModal: true,
        },
        {
            id: Tool.TRANSITION,
            label: 'Generate Transition',
            icon: <LinkIcon className="w-5 h-5" />,
            description: "Generates a narrative transition between two scenes.",
            color: "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-900/20",
            needsModal: true,
        },
        {
            id: Tool.MAP_GENERATOR,
            label: 'Generate World Map',
            icon: <MapIcon className="w-5 h-5" />,
            description: "Analyzes all content to generate a world map with key locations.",
            color: "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 shadow-blue-900/20",
            needsModal: false,
        },
    ];

    const brainstormingTools = [
        {
            id: Tool.OUTLINE_GENERATOR,
            label: 'Generate Outline',
            icon: <ListOrderedIcon className="w-5 h-5" />,
            description: "Generates a structured story outline based on your premise and characters.",
            color: "bg-gradient-to-r from-fuchsia-500 to-rose-500 hover:from-fuchsia-600 hover:to-rose-600 shadow-fuchsia-900/20",
            needsModal: false,
        },
        {
            id: Tool.OBJECT_GENERATOR,
            label: 'Invent Object/MacGuffin',
            icon: <GemIcon className="w-5 h-5" />,
            description: "Creates a unique object or artifact with history and significance.",
            color: "bg-gradient-to-r from-indigo-400 to-violet-500 hover:from-indigo-500 hover:to-violet-600 shadow-indigo-900/20",
            needsModal: false,
        },
    ];

    const isRecommended = (toolId: Tool) => {
        const charCount = selectedCharacterIds.size;
        const sceneCount = selectedSceneIds.size;

        switch (toolId) {
            case Tool.DIALOGUE_GENERATOR:
                return charCount === 2;
            case Tool.RELATIONSHIP_WEB:
                return charCount >= 2;
            case Tool.TRANSITION:
                return sceneCount === 2;
            case Tool.MIDJOURNEY_PROMPTS:
            case Tool.SETTING_GENERATOR:
                return sceneCount === 1;
            case Tool.CHAPTER:
                return charCount > 0 && sceneCount > 0;
            default:
                return false;
        }
    };

    const handleToolClick = (tool: any) => {
        if (tool.needsModal) {
            setActiveTool(tool.id);
        } else {
            onGenerate(tool.id);
        }
    };

    const handleModalConfirm = (charIds: Set<string>, sceneIds: Set<string>) => {
        // Update global state so the UI reflects the choice
        onBatchUpdateSelection('character', charIds);
        onBatchUpdateSelection('scene', sceneIds);

        // Execute tool immediately with these selections
        if (activeTool) {
            onGenerate(activeTool, { characterIds: charIds, sceneIds: sceneIds });
        }
        setActiveTool(null);
    };

    const renderToolButton = (tool: any) => {
        // Only disable if completely impossible (e.g. no premise for outline)
        // But generally keep enabled to show error or guide.
        const isDisabled = isLoading;

        const recommended = isRecommended(tool.id);

        return (
            <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-start gap-3 text-white text-sm font-bold py-3 px-5 rounded-xl transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed 
                ${isDisabled ? 'bg-gray-700 border-white/10' :
                        recommended
                            ? `${tool.color} border-white/40 ring-2 ring-white/20 scale-[1.02] shadow-xl`
                            : `${tool.color} border-white/10 shadow-lg hover:scale-[1.02] hover:border-white/20`
                    }`}
                title={tool.description}
            >
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm relative">
                    {tool.icon}
                    {recommended && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-sm" />}
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className="flex items-center gap-2">
                        {tool.label}
                        {recommended && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Best Match</span>}
                    </span>
                    {recommended && <span className="text-[10px] font-normal opacity-90 mt-0.5">Recommended based on selection</span>}
                </div>
            </button>
        )
    };

    return (
        <>
            {activeTool && (
                <ToolSelectionModal
                    tool={activeTool}
                    characters={characters}
                    scenes={scenes}
                    initialSelectedCharIds={selectedCharacterIds}
                    initialSelectedSceneIds={selectedSceneIds}
                    onClose={() => setActiveTool(null)}
                    onConfirm={handleModalConfirm}
                />
            )}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3">
                    {tools.map(renderToolButton)}
                </div>
                <div className="pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-3 border-b border-white/10 pb-2">Brainstorming</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {brainstormingTools.map(renderToolButton)}
                    </div>
                </div>
            </div>
        </>
    )
}

export default WriterTools;