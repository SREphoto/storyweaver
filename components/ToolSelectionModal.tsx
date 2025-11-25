
import React, { useState, useEffect } from 'react';
import { Character, Scene, Tool } from '../types';
import { XIcon, CheckCircleIcon, CrownIcon, SkullIcon, UsersIcon, DramaIcon, HeartIcon, GraduationCapIcon, UserIcon, LinkIcon, WandSparklesIcon, CameraIcon, MountainIcon } from './icons';
import { characterTypeDescriptions } from './characterTypeDescriptions';

interface ToolSelectionModalProps {
    tool: Tool;
    characters: Character[];
    scenes: Scene[];
    initialSelectedCharIds: Set<string>;
    initialSelectedSceneIds: Set<string>;
    onConfirm: (selectedCharIds: Set<string>, selectedSceneIds: Set<string>) => void;
    onClose: () => void;
}

type RequirementConfig = {
    title: string;
    description: string;
    minChars: number;
    maxChars?: number;
    minScenes: number;
    maxScenes?: number;
    showChars: boolean;
    showScenes: boolean;
};

const TOOL_REQUIREMENTS: Partial<Record<Tool, RequirementConfig>> = {
    [Tool.DIALOGUE_GENERATOR]: {
        title: 'Dialogue Generator',
        description: 'Select exactly two characters to generate a conversation.',
        minChars: 2,
        maxChars: 2,
        minScenes: 0,
        showChars: true,
        showScenes: false,
    },
    [Tool.TRANSITION]: {
        title: 'Scene Transition',
        description: 'Select exactly two scenes to generate a narrative bridge between them.',
        minChars: 0,
        minScenes: 2,
        maxScenes: 2,
        showChars: false,
        showScenes: true,
    },
    [Tool.RELATIONSHIP_WEB]: {
        title: 'Relationship Web',
        description: 'Select at least two characters to map their dynamics.',
        minChars: 2,
        minScenes: 0,
        showChars: true,
        showScenes: false,
    },
    [Tool.CHAPTER]: {
        title: 'Chapter Writer',
        description: 'Select the characters present in this chapter and any previous scenes for context.',
        minChars: 1,
        minScenes: 0,
        showChars: true,
        showScenes: true,
    },
    [Tool.PLOT_IDEAS]: {
        title: 'Plot Ideas',
        description: 'Select key characters and scenes to ground the plot suggestions.',
        minChars: 0,
        minScenes: 0,
        showChars: true,
        showScenes: true,
    },
    [Tool.MIDJOURNEY_PROMPTS]: {
        title: 'Midjourney Prompt Writer',
        description: 'Select a scene to visualize and the characters present. Uses character profiles and uploaded images for accuracy.',
        minChars: 0,
        minScenes: 1,
        maxScenes: 1,
        showChars: true,
        showScenes: true,
    },
    [Tool.SETTING_GENERATOR]: {
        title: 'Describe a Setting',
        description: 'Select a specific scene to generate a detailed, multi-sensory description of its location.',
        minChars: 0,
        minScenes: 1,
        maxScenes: 1,
        showChars: false,
        showScenes: true,
    },
};

const getCharacterIcon = (type: string) => {
    const props = { className: "w-4 h-4" };
    switch (type) {
        case 'Protagonist': return <CrownIcon {...props} className="w-4 h-4 text-amber-400" />;
        case 'Antagonist': return <SkullIcon {...props} className="w-4 h-4 text-red-400" />;
        case 'Mentor': return <GraduationCapIcon {...props} className="w-4 h-4 text-blue-400" />;
        case 'Love Interest': return <HeartIcon {...props} className="w-4 h-4 text-pink-400" />;
        default: return <UserIcon {...props} className="w-4 h-4 text-gray-400" />;
    }
};

const ToolSelectionModal: React.FC<ToolSelectionModalProps> = ({
    tool,
    characters,
    scenes,
    initialSelectedCharIds,
    initialSelectedSceneIds,
    onConfirm,
    onClose
}) => {
    const config = TOOL_REQUIREMENTS[tool];
    const [selectedCharIds, setSelectedCharIds] = useState<Set<string>>(new Set(initialSelectedCharIds));
    const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set(initialSelectedSceneIds));
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (!config) return;
        const charCount = selectedCharIds.size;
        const sceneCount = selectedSceneIds.size;

        let valid = true;
        if (charCount < config.minChars) valid = false;
        if (config.maxChars !== undefined && charCount > config.maxChars) valid = false;
        if (sceneCount < config.minScenes) valid = false;
        if (config.maxScenes !== undefined && sceneCount > config.maxScenes) valid = false;

        setIsValid(valid);
    }, [selectedCharIds, selectedSceneIds, config]);

    if (!config) return null;

    const toggleChar = (id: string) => {
        const newSet = new Set(selectedCharIds);
        if (newSet.has(id)) newSet.delete(id);
        else {
            // If strictly limited to 2, and we have 2, replace the first one or just add? 
            // Better UX: Just add, let validation fail if too many, or auto-deselect logic.
            // Let's keep it simple: toggle. User sees validation.
            newSet.add(id);
        }
        setSelectedCharIds(newSet);
    };

    const toggleScene = (id: string) => {
        const newSet = new Set(selectedSceneIds);
        if (config.maxScenes === 1) {
             // If max scenes is 1, selection should be exclusive (radio button style logic)
             newSet.clear();
             newSet.add(id);
        } else {
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
        }
        setSelectedSceneIds(newSet);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel bg-brand-surface/95 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/10">
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-brand-surface/50 to-brand-bg/50">
                    <div>
                        <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
                            {tool === Tool.MIDJOURNEY_PROMPTS ? <CameraIcon className="w-5 h-5 text-brand-secondary" /> : tool === Tool.SETTING_GENERATOR ? <MountainIcon className="w-5 h-5 text-brand-secondary" /> : <WandSparklesIcon className="w-5 h-5 text-brand-secondary" />}
                            {config.title}
                        </h2>
                        <p className="text-sm text-brand-text-muted mt-1">{config.description}</p>
                    </div>
                    <button onClick={onClose} className="text-brand-text-muted hover:text-white transition p-1 rounded-lg hover:bg-white/5">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {config.showChars && (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider">
                                        Characters <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${selectedCharIds.size >= config.minChars && (config.maxChars === undefined || selectedCharIds.size <= config.maxChars) ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary/40 text-brand-text-muted'}`}>{selectedCharIds.size} / {config.maxChars ? config.maxChars : '∞'}</span>
                                    </h3>
                                </div>
                                <div className="space-y-2 flex-grow overflow-y-auto pr-2 max-h-[50vh] custom-scrollbar">
                                    {characters.length === 0 ? <p className="text-sm italic text-brand-text-muted">No characters available.</p> : 
                                    characters.map(char => (
                                        <div 
                                            key={char.id}
                                            onClick={() => toggleChar(char.id)}
                                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${selectedCharIds.has(char.id) ? 'bg-brand-secondary/10 border-brand-secondary ring-1 ring-brand-secondary/30' : 'bg-brand-bg/40 border-transparent hover:bg-brand-bg/60 hover:border-white/5'}`}
                                        >
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${selectedCharIds.has(char.id) ? 'bg-brand-secondary border-brand-secondary' : 'border-brand-text-muted/50'}`}>
                                                {selectedCharIds.has(char.id) && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {getCharacterIcon(char.type)}
                                                    <span className={`font-medium truncate ${selectedCharIds.has(char.id) ? 'text-brand-text' : 'text-brand-text-muted'}`}>{char.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {config.showScenes && (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider">
                                        Scenes <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${selectedSceneIds.size >= config.minScenes && (config.maxScenes === undefined || selectedSceneIds.size <= config.maxScenes) ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary/40 text-brand-text-muted'}`}>{selectedSceneIds.size} / {config.maxScenes ? config.maxScenes : '∞'}</span>
                                    </h3>
                                </div>
                                <div className="space-y-2 flex-grow overflow-y-auto pr-2 max-h-[50vh] custom-scrollbar">
                                    {scenes.length === 0 ? <p className="text-sm italic text-brand-text-muted">No scenes available.</p> : 
                                    scenes.map((scene, index) => (
                                        <div 
                                            key={scene.id}
                                            onClick={() => toggleScene(scene.id)}
                                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${selectedSceneIds.has(scene.id) ? 'bg-teal-500/10 border-teal-500 ring-1 ring-teal-500/30' : 'bg-brand-bg/40 border-transparent hover:bg-brand-bg/60 hover:border-white/5'}`}
                                        >
                                             <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${selectedSceneIds.has(scene.id) ? 'bg-teal-500 border-teal-500' : 'border-brand-text-muted/50'}`}>
                                                {selectedSceneIds.has(scene.id) && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-brand-text-muted font-mono">#{index + 1}</span>
                                                    <span className={`font-medium truncate ${selectedSceneIds.has(scene.id) ? 'text-brand-text' : 'text-brand-text-muted'}`}>{scene.title}</span>
                                                </div>
                                                <p className="text-xs text-brand-text-muted truncate opacity-70">{scene.summary}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-brand-bg/20 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-brand-text-muted hover:bg-brand-primary/50 hover:text-white transition font-medium border border-transparent hover:border-white/5"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onConfirm(selectedCharIds, selectedSceneIds)}
                        disabled={!isValid}
                        className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2.5 px-8 rounded-xl hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <WandSparklesIcon className="w-5 h-5" />
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToolSelectionModal;