
import React, { useState, useMemo } from 'react';
import { SavedMaterial, MaterialType, Note } from '../../types';
import { useStory } from '../../contexts/StoryContext';
import { SearchIcon, DownloadIcon, TrashIcon, ImageIcon, FilmIcon, ClipboardListIcon, EyeIcon, ClipboardIcon } from '../icons';
import AssetPreviewModal from '../AssetPreviewModal';

const AssetsView: React.FC = () => {
    const { savedMaterials, deleteSavedMaterial, notes } = useStory();
    const [filterType, setFilterType] = useState<MaterialType | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
    const [previewAsset, setPreviewAsset] = useState<SavedMaterial | null>(null);

    const filteredMaterials = useMemo(() => {
        // Convert notes to SavedMaterial-like objects
        const noteMaterials: SavedMaterial[] = notes.map(n => ({
            id: n.id,
            type: 'NOTE',
            title: n.title,
            content: n.content
        }));

        const allItems = [...savedMaterials, ...noteMaterials];

        return allItems.filter(m => {
            const matchesType = filterType === 'ALL' || m.type === filterType;
            const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [savedMaterials, notes, filterType, searchQuery]);

    const handleDownload = (material: SavedMaterial) => {
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

    const getIconForType = (type: MaterialType) => {
        switch (type) {
            case 'IMAGE': return <ImageIcon className="w-5 h-5" />;
            case 'VIDEO_ANALYSIS': return <FilmIcon className="w-5 h-5" />;
            case 'NOTE': return <ClipboardIcon className="w-5 h-5" />;
            default: return <ClipboardListIcon className="w-5 h-5" />;
        }
    };

    const handleAssetClick = (material: SavedMaterial) => {
        if (material.type === 'IMAGE' && typeof material.content === 'string') {
            setPreviewImage({ url: material.content, title: material.title });
        } else {
            setPreviewAsset(material);
        }
    };

    return (
        <div className="h-full flex flex-col bg-brand-bg/50">
            {/* Header & Filters */}
            <div className="p-6 border-b border-white/10 space-y-4 bg-brand-surface/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-serif font-bold text-white">Asset Library</h2>
                    <div className="text-sm text-brand-text-muted">{filteredMaterials.length} items</div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-brand-secondary outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                        {(['ALL', 'NOTE', 'IMAGE', 'VIDEO_ANALYSIS', 'CHARACTER_PROFILE', 'SCENE_WRITER'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type as any)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterType === type
                                    ? 'bg-brand-secondary text-white'
                                    : 'bg-white/5 text-brand-text-muted hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {type === 'ALL' ? 'All Assets' : type.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                {filteredMaterials.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-brand-text-muted opacity-50">
                        <ImageIcon className="w-16 h-16 mb-4" />
                        <p>No assets found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMaterials.map(material => (
                            <div
                                key={material.id}
                                className="group glass-panel rounded-xl overflow-hidden border border-white/5 hover:border-brand-secondary/50 transition-all duration-300 flex flex-col cursor-pointer"
                                onClick={() => handleAssetClick(material)}
                            >
                                {/* Preview Area */}
                                <div className="aspect-video bg-black/40 relative overflow-hidden">
                                    {material.type === 'IMAGE' && typeof material.content === 'string' ? (
                                        <>
                                            <img
                                                src={material.content.startsWith('data:') ? material.content : `data:image/png;base64,${material.content}`}
                                                alt={material.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm"
                                                    title="View Fullscreen"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-4 text-brand-text-muted group-hover:text-brand-secondary transition-colors">
                                            {getIconForType(material.type)}
                                            <span className="ml-2 text-xs uppercase tracking-wider">{material.type.replace(/_/g, ' ')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info Area */}
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-brand-text truncate" title={material.title}>{material.title}</h3>
                                        <p className="text-xs text-brand-text-muted mt-1 uppercase tracking-wide">{material.type.replace(/_/g, ' ')}</p>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleDownload(material)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-brand-text-muted hover:text-brand-secondary transition"
                                            title="Download"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteSavedMaterial(material.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-brand-text-muted hover:text-red-400 transition"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreviewModal
                    imageUrl={previewImage.url}
                    title={previewImage.title}
                    onClose={() => setPreviewImage(null)}
                    onSetHeader={() => { }} // Optional: Implement if needed for assets view
                    onSave={() => { }} // Already saved
                />
            )}

            {/* Asset Preview Modal (Text/Data) */}
            {previewAsset && (
                <AssetPreviewModal
                    title={previewAsset.title}
                    content={previewAsset.content}
                    type={previewAsset.type}
                    onClose={() => setPreviewAsset(null)}
                />
            )}
        </div>
    );
};

export default AssetsView;
