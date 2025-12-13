import React, { useState, useEffect } from 'react';
import { useStory } from '../../contexts/StoryContext';
import { StoryObject } from '../../types';
import { PlusIcon, TrashIcon, SearchIcon, ImageIcon, EditIcon, SaveIcon, XIcon, WandSparklesIcon as SparklesIcon } from '../icons';
import * as geminiService from '../../services/geminiService';

const ItemsView: React.FC = () => {
    const { items, addItem, updateItem, deleteItem, storyPremise } = useStory();
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // New Item State
    const [newItemName, setNewItemName] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');

    const selectedItem = items.find(i => i.id === selectedItemId);

    const handleCreateItem = () => {
        if (!newItemName.trim()) return;

        const newItem: StoryObject = {
            id: `item_${Date.now()}`,
            name: newItemName,
            appearance: newItemDesc || 'No description provided.',
            history: '',
            significance: '',
            notes: ''
        };

        addItem(newItem);
        setNewItemName('');
        setNewItemDesc('');
        setSelectedItemId(newItem.id);
    };

    const handleDeleteItem = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteItem(id);
            if (selectedItemId === id) setSelectedItemId(null);
        }
    };

    const handleGenerateImage = async () => {
        if (!selectedItem) return;
        setIsGenerating(true);
        try {
            const imageUrl = await geminiService.generateItemImage(selectedItem);
            updateItem(selectedItem.id, { image: imageUrl });
        } catch (error) {
            console.error(error);
            alert('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.appearance.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full animate-in fade-in duration-500">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-white/10 flex flex-col bg-brand-surface/30 backdrop-blur-sm">
                <div className="p-4 border-b border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold font-serif text-brand-text">Items & Artifacts</h2>
                    </div>

                    {/* Quick Add */}
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="New Item Name"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="w-full bg-brand-bg/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-text placeholder-brand-text-muted focus:ring-1 focus:ring-brand-secondary outline-none"
                        />
                        <button
                            onClick={handleCreateItem}
                            disabled={!newItemName.trim()}
                            className="w-full py-2 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            aria-label="Create New Item"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Create Item
                        </button>
                    </div>

                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-brand-bg/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-brand-text focus:ring-1 focus:ring-brand-secondary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {filteredItems.length === 0 ? (
                        <div className="text-center text-brand-text-muted py-8 text-sm">
                            No items found.
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItemId(item.id)}
                                className={`group p-3 rounded-lg cursor-pointer transition-all border ${selectedItemId === item.id
                                    ? 'bg-brand-primary/10 border-brand-primary/30'
                                    : 'hover:bg-white/5 border-transparent hover:border-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-medium truncate ${selectedItemId === item.id ? 'text-brand-primary' : 'text-brand-text'}`}>
                                        {item.name}
                                    </h3>
                                    <button
                                        onClick={(e) => handleDeleteItem(e, item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                        title="Delete Item"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-xs text-brand-text-muted line-clamp-2">
                                    {item.appearance}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Item Editor */}
            <div className="w-2/3 flex flex-col bg-brand-bg/50">
                {selectedItem ? (
                    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                        {/* Header Image / Placeholder */}
                        <div className="h-48 bg-black/40 relative group shrink-0">
                            {selectedItem.image ? (
                                <img
                                    src={selectedItem.image.startsWith('data:') ? selectedItem.image : `data:image/png;base64,${selectedItem.image}`}
                                    alt={selectedItem.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-brand-text-muted">
                                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                    <span className="text-sm">No image available</span>
                                </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-end">
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={isGenerating}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors text-xs flex items-center gap-2 disabled:opacity-50"
                                    title="Generate Item Image"
                                >
                                    <SparklesIcon className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                    {isGenerating ? 'Generating...' : 'Generate Image'}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="item-name-input" className="block text-xs uppercase tracking-wider text-brand-text-muted mb-1">Item Name</label>
                                <input
                                    id="item-name-input"
                                    type="text"
                                    value={selectedItem.name}
                                    onChange={(e) => updateItem(selectedItem.id, { name: e.target.value })}
                                    className="w-full bg-transparent text-3xl font-serif font-bold text-brand-text outline-none border-b border-transparent focus:border-white/10 py-1"
                                />
                            </div>

                            {/* Appearance */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-brand-text-muted mb-2">Visual Description</label>
                                <textarea
                                    value={selectedItem.appearance}
                                    onChange={(e) => updateItem(selectedItem.id, { appearance: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-brand-text text-sm outline-none focus:border-brand-secondary/50 min-h-[100px]"
                                    placeholder="Describe how the object looks..."
                                />
                            </div>

                            {/* History */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-brand-text-muted mb-2">History & Origin</label>
                                <textarea
                                    value={selectedItem.history}
                                    onChange={(e) => updateItem(selectedItem.id, { history: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-brand-text text-sm outline-none focus:border-brand-secondary/50 min-h-[100px]"
                                    placeholder="Where did this item come from?"
                                />
                            </div>

                            {/* Significance */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-brand-text-muted mb-2">Significance & Powers</label>
                                <textarea
                                    value={selectedItem.significance}
                                    onChange={(e) => updateItem(selectedItem.id, { significance: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-brand-text text-sm outline-none focus:border-brand-secondary/50 min-h-[100px]"
                                    placeholder="Why is this item important?"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-brand-text-muted mb-2">Additional Notes</label>
                                <textarea
                                    value={selectedItem.notes}
                                    onChange={(e) => updateItem(selectedItem.id, { notes: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-brand-text text-sm outline-none focus:border-brand-secondary/50 min-h-[100px]"
                                    placeholder="Any other details..."
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-brand-text-muted">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                            <SparklesIcon className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-lg font-medium">Select an item or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemsView;
