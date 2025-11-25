
import React, { useRef } from 'react';
import { Character, Scene } from '../types';
import SceneCard from './SceneCard';
import { PlusIcon } from './icons';

interface TimelineProps {
    scenes: Scene[];
    allCharacters: Character[];
    selectedSceneIds: Set<string>;
    onToggleSelect: (sceneId: string) => void;
    onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
    onDeleteScene: (sceneId: string) => void;
    onAddScene: () => void;
    onReorderScenes: (reorderedScenes: Scene[]) => void;
    onExportScene: (sceneId: string) => void;
    isLoading: boolean;
    onGenerateDetails: (sceneId: string) => void;
    onGenerateImage: (scene: Scene) => void;
    onMoveScene: (sceneId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
}

const Timeline: React.FC<TimelineProps> = ({
    scenes,
    allCharacters,
    selectedSceneIds,
    onToggleSelect,
    onUpdateScene,
    onDeleteScene,
    onAddScene,
    onReorderScenes,
    onExportScene,
    isLoading,
    onGenerateDetails,
    onGenerateImage,
    onMoveScene,
}) => {
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        dragItem.current = id;
        e.dataTransfer.effectAllowed = 'move';
    };



    const handleDragEnd = () => {
        if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
            const reorderedScenes = [...scenes];
            const dragItemIndex = scenes.findIndex(s => s.id === dragItem.current);
            const dragOverItemIndex = scenes.findIndex(s => s.id === dragOverItem.current);

            const [removed] = reorderedScenes.splice(dragItemIndex, 1);
            reorderedScenes.splice(dragOverItemIndex, 0, removed);

            onReorderScenes(reorderedScenes);
        }
        dragItem.current = null;
        dragOverItem.current = null;
        // Force update to clear any visual drag states if needed
    };

    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string, index: number) => {
        dragOverItem.current = id;
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };


    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {scenes.map((scene, index) => (
                <div
                    key={scene.id}
                    className="relative"
                    draggable
                    onDragStart={(e) => handleDragStart(e, scene.id)}
                    onDragEnter={(e) => handleDragEnter(e, scene.id, index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={() => { handleDragEnd(); setDragOverIndex(null); }}
                >
                    {/* Drop Indicator Line */}
                    {dragOverIndex === index && dragItem.current !== scene.id && (
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-brand-secondary rounded-full shadow-[0_0_10px_rgba(var(--color-secondary),0.8)] z-20 animate-pulse" />
                    )}
                    {/* Scene Order Indicator */}
                    <div className="absolute -top-2 -left-2 z-10 bg-brand-surface border border-brand-primary/50 text-xs font-mono text-brand-text-muted px-2 py-0.5 rounded-full shadow-sm">
                        {index + 1}
                    </div>
                    <SceneCard
                        scene={scene}
                        isSelected={selectedSceneIds.has(scene.id)}
                        onToggleSelect={() => onToggleSelect(scene.id)}
                        onUpdate={onUpdateScene}
                        onDelete={onDeleteScene}
                        onExport={onExportScene}
                        allCharacters={allCharacters}
                        isLoading={isLoading}
                        onGenerateDetails={onGenerateDetails}
                        onGenerateImage={onGenerateImage}
                        layout="horizontal"
                        onMove={onMoveScene} // Standard Grid doesn't strictly support directional buttons easily, but logical index swapping works
                        isFirst={index === 0}
                        isLast={index === scenes.length - 1}
                    />
                </div>
            ))}

            <button
                onClick={onAddScene}
                title="Add New Scene"
                className="h-full min-h-[140px] flex flex-col items-center justify-center bg-brand-primary/10 border-2 border-dashed border-brand-primary/30 text-brand-text-muted hover:bg-brand-secondary/10 hover:text-brand-secondary hover:border-brand-secondary/50 transition-all duration-300 rounded-lg group gap-2"
            >
                <div className="p-3 bg-brand-primary/20 rounded-full group-hover:bg-brand-secondary/20 transition-colors">
                    <PlusIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Add Scene</span>
            </button>
        </div>
    );
};

export default Timeline;
