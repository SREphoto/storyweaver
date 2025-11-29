import React from 'react';
import { Scene, Character, Tool } from '../../types';
import Timeline from '../Timeline';
import { LightbulbIcon, TimelineIcon } from '../icons';

interface TimelineViewProps {
    onGenerate: (tool: Tool) => void;
    scenes: Scene[];
    allCharacters: Character[];
    selectedSceneIds: Set<string>;
    onToggleSelect: (id: string, type: 'scene') => void;
    onUpdateScene: (id: string, updates: Partial<Scene>) => void;
    onDeleteScene: (id: string) => void;
    onAddScene: () => void;
    onReorderScenes: (scenes: Scene[]) => void;
    isLoading: boolean;
    onGenerateDetails: (id: string) => void;
    onGenerateImage: (scene: Scene) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
    onGenerate, scenes, allCharacters, selectedSceneIds, onToggleSelect,
    onUpdateScene, onDeleteScene, onAddScene, onReorderScenes, isLoading,
    onGenerateDetails, onGenerateImage
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold">Story Timeline</h2>
                    <div className="flex gap-2">
                        <button onClick={() => onGenerate(Tool.PLOT_IDEAS)} className="flex items-center gap-2 text-xs bg-brand-primary/50 hover:bg-brand-primary text-white px-3 py-2 rounded-lg transition">
                            <LightbulbIcon className="w-3 h-3" /> Brainstorm Plots
                        </button>
                    </div>
                </div>
                {scenes.length > 0 ? (
                    <Timeline
                        scenes={scenes}
                        allCharacters={allCharacters}
                        selectedSceneIds={selectedSceneIds}
                        onToggleSelect={(id) => onToggleSelect(id, 'scene')}
                        onUpdateScene={onUpdateScene}
                        onDeleteScene={onDeleteScene}
                        onAddScene={onAddScene}
                        onReorderScenes={onReorderScenes}
                        onExportScene={() => { }}
                        isLoading={isLoading}
                        onGenerateDetails={onGenerateDetails}
                        onGenerateImage={onGenerateImage}
                        onMoveScene={(id, dir) => { }}
                    />
                ) : (
                    <div className="text-center py-20 text-brand-text-muted">
                        <TimelineIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Add scenes to visualize your timeline.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineView;
