
import React from 'react';
import { SavedMaterial, Tool } from '../types';
import { useStory } from '../contexts/StoryContext';
import { TrashIcon, ImageIcon, BookOpenIcon, UserPlusIcon, TimelineIcon, WriteIcon, ClipboardListIcon, FilmIcon, DownloadIcon, EyeIcon } from './icons';

interface RecentGenerationsProps {
    materials: SavedMaterial[];
    onSelect: (material: SavedMaterial) => void;
}

const RecentGenerations: React.FC<RecentGenerationsProps> = ({ materials, onSelect }) => {
    const { deleteSavedMaterial } = useStory();

    const getMaterialIcon = (type: string) => {
        const props = { className: "w-4 h-4 text-brand-text-muted" };
        switch (type) {
            case Tool.CHAPTER: return <BookOpenIcon {...props} />;
            case 'CHARACTER_PROFILE': return <UserPlusIcon {...props} />;
            case 'TIMELINE': return <TimelineIcon {...props} />;
            case Tool.SCENE_WRITER: return <WriteIcon {...props} />;
            case 'IMAGE': return <ImageIcon {...props} />;
            case 'VIDEO': return <FilmIcon {...props} />;
            default: return <ClipboardListIcon {...props} />;
        }
    };

    const handleDownload = (e: React.MouseEvent, material: SavedMaterial) => {
        e.stopPropagation();
        if (typeof material.content !== 'string') return;

        const link = document.createElement('a');
        if (material.type === 'IMAGE' || material.type.includes('VIDEO')) {
            let href = material.content;
            if (!href.startsWith('data:') && !href.startsWith('http')) {
                href = `data:image/png;base64,${material.content}`;
            }
            link.href = href;
            link.download = `${material.title.replace(/[^a-z0-9]/gi, '_')}.${material.type === 'IMAGE' ? 'png' : 'mp4'}`;
        } else {
            const blob = new Blob([material.content], { type: 'text/plain' });
            link.href = URL.createObjectURL(blob);
            link.download = `${material.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (materials.length === 0) {
        return (
            <div className="p-4 text-center text-brand-text-muted text-xs italic border border-white/5 rounded-lg bg-white/5">
                No recent generations yet. Start creating!
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {materials.slice(0, 10).map(m => (
                <div
                    key={m.id}
                    onClick={() => onSelect(m)}
                    className="group relative flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-secondary/30 transition-all cursor-pointer overflow-hidden"
                >
                    {/* Thumbnail or Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black/20 flex items-center justify-center overflow-hidden border border-white/10">
                        {m.type === 'IMAGE' && typeof m.content === 'string' ? (
                            <img
                                src={m.content.startsWith('data:') ? m.content : `data:image/png;base64,${m.content}`}
                                alt={m.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            getMaterialIcon(m.type)
                        )}
                    </div>

                    {/* Content Info */}
                    <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-medium text-brand-text truncate pr-6">{m.title}</h4>
                        <p className="text-[10px] text-brand-text-muted uppercase tracking-wider mt-0.5">{m.type.replace(/_/g, ' ')}</p>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-surface/90 rounded-lg p-1 backdrop-blur-sm shadow-lg border border-white/10">
                        <button
                            onClick={(e) => handleDownload(e, m)}
                            className="p-1.5 hover:bg-white/10 rounded text-brand-text-muted hover:text-brand-secondary transition"
                            title="Download"
                        >
                            <DownloadIcon className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteSavedMaterial(m.id); }}
                            className="p-1.5 hover:bg-red-500/10 rounded text-brand-text-muted hover:text-red-400 transition"
                            title="Delete"
                        >
                            <TrashIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentGenerations;
