
import React, { useState } from 'react';
import { Character, Scene } from '../types';
import { ChevronDownIcon, ChevronUpIcon, EditIcon, TrashIcon, DownloadIcon, WriteIcon, ImageIcon, LinkIcon, ArrowLeftIcon, ArrowRightIcon, LayoutDashboardIcon, MapIcon, BookOpenIcon, GripVerticalIcon, FilmIcon } from './icons';
import SceneEditModal from './SceneEditModal';

interface SceneCardProps {
    scene: Scene;
    isSelected: boolean;
    onToggleSelect: () => void;
    onUpdate: (sceneId: string, updates: Partial<Scene>) => void;
    onDelete: (sceneId: string) => void;
    onExport: (sceneId: string) => void;
    allCharacters: Character[];
    isLoading: boolean;
    onGenerateDetails: (sceneId: string) => void;
    onGenerateImage: (scene: Scene) => void;
    onOpenStoryboard?: (scene: Scene) => void;
    layout?: 'grid' | 'vertical';
    onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void;
    isFirst?: boolean;
    isLast?: boolean;
    onOpenSplitView?: () => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, isSelected, onToggleSelect, onUpdate, onDelete, onExport, allCharacters, isLoading, onGenerateDetails, onGenerateImage, onOpenStoryboard, isFirst, isLast, layout = 'grid', onMove, onOpenSplitView }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

    const handleEditToggle = () => {
        setShowEditModal(true);
    };

    const handleSave = (id: string, updates: Partial<Scene>) => {
        onUpdate(id, updates);
        setShowEditModal(false);
    };

    const charactersInScene = allCharacters.filter(c => scene.characterIds?.includes(c.id));
    const hasCharacters = scene.characterIds && scene.characterIds.length > 0;
    const isTransition = scene.isTransition;

    return (
        <>
            {showEditModal && (
                <SceneEditModal
                    scene={scene}
                    allCharacters={allCharacters}
                    onSave={handleSave}
                    onClose={() => setShowEditModal(false)}
                />
            )}
            <div className={`glass-card rounded-lg shadow-sm h-full flex flex-col transition-all duration-300 overflow-hidden border ${isSelected ? 'border-brand-secondary ring-1 ring-brand-secondary/30' : isTransition ? 'border-teal-500/30 bg-teal-900/5' : 'border-white/5 hover:border-white/10 hover:shadow-md'}`}>
                {scene.headerImage && (
                    <div className="h-20 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${scene.headerImage})` }} />
                )}
                <div className="p-3 flex flex-col flex-grow">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-grow min-w-0">
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing text-brand-text-muted hover:text-brand-text p-1 -ml-1">
                                <GripVerticalIcon className="w-4 h-4" />
                            </div>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={onToggleSelect}
                                className="h-4 w-4 rounded bg-brand-surface/50 border-brand-text-muted text-brand-secondary focus:ring-brand-secondary cursor-pointer flex-shrink-0"
                            />
                            <div className="flex-grow cursor-pointer group min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
                                <div className="flex items-center gap-1.5">
                                    {isTransition && <LinkIcon className="w-3 h-3 text-teal-400 flex-shrink-0" />}
                                    <h3 className={`font-bold truncate text-sm leading-tight ${isTransition ? 'text-teal-300' : 'text-brand-text group-hover:text-brand-secondary transition'}`}>{scene.title}</h3>
                                </div>
                                <div className="flex gap-1 mt-1">
                                    {scene.script && <span title="Script Ready" className="bg-green-900/30 text-green-400 p-0.5 rounded"><WriteIcon className="w-2.5 h-2.5" /></span>}
                                    {scene.settingDescription && <span title="Setting Ready" className="bg-blue-900/30 text-blue-400 p-0.5 rounded"><MapIcon className="w-2.5 h-2.5" /></span>}
                                    {scene.storyboard && scene.storyboard.length > 0 && <span title="Storyboard Ready" className="bg-purple-900/30 text-purple-400 p-0.5 rounded"><LayoutDashboardIcon className="w-2.5 h-2.5" /></span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Mobile/Grid Move Controls */}
                            {(layout === 'vertical' || layout === 'horizontal') && onMove && (
                                <div className="flex items-center text-brand-text-muted opacity-50 hover:opacity-100 mr-1">
                                    <button onClick={() => onMove(layout === 'vertical' ? 'up' : 'left')} disabled={isFirst} className="p-0.5 disabled:opacity-20 hover:text-brand-text"><ArrowLeftIcon className="w-3 h-3" /></button>
                                    <button onClick={() => onMove(layout === 'vertical' ? 'down' : 'right')} disabled={isLast} className="p-0.5 disabled:opacity-20 hover:text-brand-text"><ArrowRightIcon className="w-3 h-3" /></button>
                                </div>
                            )}

                            <button onClick={handleEditToggle} title='Edit Details' className="text-brand-text-muted hover:text-white transition p-1 rounded hover:bg-brand-primary/50">
                                <EditIcon className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Collapse' : 'Expand'} className="text-brand-text-muted hover:text-white transition p-1 rounded hover:bg-brand-primary/50">
                                {isExpanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    <div className={`mt-2 pt-2 border-t border-white/5 space-y-2 text-xs text-brand-text flex-grow ${isExpanded ? 'block' : 'hidden'}`}>
                        <div className="space-y-2">
                            <div className="group">
                                <p className={`whitespace-pre-wrap font-serif text-brand-text-muted transition-all ${isSummaryExpanded ? '' : 'line-clamp-3'}`}>
                                    {scene.summary}
                                </p>
                                {scene.summary.length > 100 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsSummaryExpanded(!isSummaryExpanded); }}
                                        className="mt-1 text-[10px] font-bold text-brand-secondary/80 hover:text-brand-secondary flex items-center gap-1 transition-colors"
                                    >
                                        {isSummaryExpanded ? 'Less' : 'More'}
                                    </button>
                                )}
                            </div>

                            {!isTransition && (
                                <>
                                    {scene.fullText && (
                                        <div className="pt-1 border-t border-white/5">
                                            <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Draft</p>
                                            <p className="whitespace-pre-wrap font-serif text-brand-text-muted/80 max-h-20 overflow-y-auto custom-scrollbar line-clamp-3">{scene.fullText}</p>
                                        </div>
                                    )}

                                    {hasCharacters && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {charactersInScene.map(char => (
                                                <span key={char.id} className="text-[10px] bg-brand-bg/50 border border-brand-primary/50 text-brand-text-muted px-1.5 py-0.5 rounded-md">
                                                    {char.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex justify-end gap-1 pt-2 border-t border-white/5">
                                {!isTransition && (
                                    <>
                                        <button onClick={() => onGenerateImage(scene)} disabled={isLoading} title="Generate Image" className="text-purple-400 hover:text-purple-300 transition disabled:text-gray-600 p-1 rounded hover:bg-purple-900/20">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                        </button>
                                        {hasCharacters && (
                                            <button onClick={() => onGenerateDetails(scene.id)} disabled={isLoading} title="Write Scene" className="text-brand-secondary hover:text-red-400 transition disabled:text-gray-600 p-1 rounded hover:bg-brand-secondary/10">
                                                <WriteIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </>
                                )}
                                <button onClick={() => onExport(scene.id)} title="Export" className="text-brand-text-muted hover:text-white transition p-1 rounded hover:bg-brand-primary/50">
                                    <DownloadIcon className="w-3.5 h-3.5" />
                                </button>
                                {onOpenStoryboard && (
                                    <button onClick={() => onOpenStoryboard(scene)} className="p-1.5 text-purple-400 hover:text-purple-300 transition hover:bg-purple-900/20 rounded-lg" title="Open Storyboard">
                                        <FilmIcon className="w-4 h-4" />
                                    </button>
                                )}
                                {onOpenSplitView && (
                                    <button onClick={onOpenSplitView} className="p-1.5 text-brand-secondary hover:text-white transition hover:bg-brand-secondary/20 rounded-lg" title="Open in Split View">
                                        <LayoutDashboardIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => onDelete(scene.id)} title="Delete" className="text-red-400 hover:text-red-300 transition p-1 rounded hover:bg-red-900/20">
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SceneCard;