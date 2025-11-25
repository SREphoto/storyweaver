
import React, { useState, useRef } from 'react';
import { Character, CharacterVisualStats, CharacterOutfit } from '../types';
import { XIcon, SaveIcon, ShirtIcon, PaletteIcon, CheckCircleIcon, PlusIcon, TrashIcon, CameraIcon, WandSparklesIcon, ImageIcon } from './icons';
import * as geminiService from '../services/geminiService';

interface CharacterVisualModalProps {
    character: Character;
    onSave: (characterId: string, updates: Partial<Character>) => void;
    onClose: () => void;
}

const CharacterVisualModal: React.FC<CharacterVisualModalProps> = ({ character, onSave, onClose }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'outfits'>('stats');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Stats State
    const [stats, setStats] = useState<CharacterVisualStats>(character.visualStats || {
        height: '', build: '', hairColor: '', eyeColor: '', distinguishingFeatures: ''
    });

    // Outfits State
    const [outfits, setOutfits] = useState<CharacterOutfit[]>(character.outfits || []);
    const [activeOutfitId, setActiveOutfitId] = useState<string>(character.activeOutfitId || (character.outfits?.[0]?.id || ''));
    const [newOutfitName, setNewOutfitName] = useState('');
    const [newOutfitDesc, setNewOutfitDesc] = useState('');

    // Upload Refs
    const statsUploadRef = useRef<HTMLInputElement>(null);
    const outfitUploadRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        onSave(character.id, {
            visualStats: stats,
            outfits: outfits,
            activeOutfitId: activeOutfitId
        });
        onClose();
    };

    const handleStatsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsAnalyzing(true);
        try {
            const result = await geminiService.analyzeCharacterVisuals(file, 'PHYSICAL_TRAITS');
            if (result.description) {
                // Simple parsing logic or just dump into features if complex
                // Ideally prompt would return structured JSON for stats, but description block works for now to populate 'features'
                // Let's just append to features for safety or try to parse if we improved the prompt structure later
                setStats(prev => ({
                    ...prev,
                    distinguishingFeatures: (prev.distinguishingFeatures + '\n' + result.description).trim()
                }));
            }
        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddOutfit = () => {
        if (!newOutfitName.trim()) return;
        const newOutfit: CharacterOutfit = {
            id: `outfit_${Date.now()}`,
            name: newOutfitName,
            description: newOutfitDesc
        };
        const updatedOutfits = [...outfits, newOutfit];
        setOutfits(updatedOutfits);
        if (!activeOutfitId) setActiveOutfitId(newOutfit.id);
        setNewOutfitName('');
        setNewOutfitDesc('');
    };

    const handleDeleteOutfit = (id: string) => {
        setOutfits(prev => prev.filter(o => o.id !== id));
        if (activeOutfitId === id) setActiveOutfitId('');
    };

    const handleOutfitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        try {
            const result = await geminiService.analyzeCharacterVisuals(file, 'OUTFIT_DETAILS');
            if (result.description) {
                setNewOutfitDesc(result.description);
            }
        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel bg-brand-surface/95 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-white/10">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-secondary/20 rounded-lg">
                            <PaletteIcon className="w-6 h-6 text-brand-secondary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-brand-text font-serif">Visual Profile: {character.name}</h2>
                            <p className="text-xs text-brand-text-muted">Manage appearance for image generation consistency.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-brand-text-muted hover:text-white transition p-1 rounded-lg hover:bg-white/5">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex h-full overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-48 border-r border-white/10 p-4 flex flex-col gap-2 bg-brand-bg/30">
                        <button 
                            onClick={() => setActiveTab('stats')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'stats' ? 'bg-brand-secondary/20 text-white' : 'text-brand-text-muted hover:bg-white/5'}`}
                        >
                            <UserIcon className="w-4 h-4" /> Body & Face
                        </button>
                        <button 
                            onClick={() => setActiveTab('outfits')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'outfits' ? 'bg-brand-secondary/20 text-white' : 'text-brand-text-muted hover:bg-white/5'}`}
                        >
                            <ShirtIcon className="w-4 h-4" /> Wardrobe
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow p-6 overflow-y-auto custom-scrollbar bg-brand-bg/20">
                        
                        {/* STATS TAB */}
                        {activeTab === 'stats' && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="bg-brand-surface/40 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-brand-text">Physical Attributes</h3>
                                        <div className="relative">
                                            <button 
                                                onClick={() => statsUploadRef.current?.click()}
                                                disabled={isAnalyzing}
                                                className="flex items-center gap-2 text-xs bg-brand-primary/50 hover:bg-brand-primary text-white px-3 py-1.5 rounded-full transition"
                                            >
                                                {isAnalyzing ? <WandSparklesIcon className="w-3 h-3 animate-spin"/> : <CameraIcon className="w-3 h-3" />}
                                                {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                                            </button>
                                            <input type="file" ref={statsUploadRef} className="hidden" accept="image/*" onChange={handleStatsUpload} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Height</label>
                                            <input 
                                                type="text" 
                                                value={stats.height}
                                                onChange={e => setStats({...stats, height: e.target.value})}
                                                className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-secondary"
                                                placeholder="e.g. 6'2, Tall"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Body Build</label>
                                            <input 
                                                type="text" 
                                                value={stats.build}
                                                onChange={e => setStats({...stats, build: e.target.value})}
                                                className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-secondary"
                                                placeholder="e.g. Muscular, Slender"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Hair Color/Style</label>
                                            <input 
                                                type="text" 
                                                value={stats.hairColor}
                                                onChange={e => setStats({...stats, hairColor: e.target.value})}
                                                className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-secondary"
                                                placeholder="e.g. Short black, curly red"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Eye Color</label>
                                            <input 
                                                type="text" 
                                                value={stats.eyeColor}
                                                onChange={e => setStats({...stats, eyeColor: e.target.value})}
                                                className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-secondary"
                                                placeholder="e.g. Piercing blue"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Distinguishing Features</label>
                                        <textarea 
                                            rows={4}
                                            value={stats.distinguishingFeatures}
                                            onChange={e => setStats({...stats, distinguishingFeatures: e.target.value})}
                                            className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-secondary resize-none"
                                            placeholder="Scars, tattoos, glasses, facial structure..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OUTFITS TAB */}
                        {activeTab === 'outfits' && (
                            <div className="space-y-6">
                                {/* Existing Outfits */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {outfits.map(outfit => (
                                        <div 
                                            key={outfit.id}
                                            onClick={() => setActiveOutfitId(outfit.id)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${activeOutfitId === outfit.id ? 'bg-brand-secondary/10 border-brand-secondary ring-1 ring-brand-secondary/30' : 'bg-brand-surface/40 border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <ShirtIcon className={`w-4 h-4 ${activeOutfitId === outfit.id ? 'text-brand-secondary' : 'text-brand-text-muted'}`} />
                                                    <h4 className="font-bold text-brand-text">{outfit.name}</h4>
                                                </div>
                                                {activeOutfitId === outfit.id && <span className="text-[10px] bg-brand-secondary text-white px-2 py-0.5 rounded-full">Active</span>}
                                            </div>
                                            <p className="text-sm text-brand-text-muted line-clamp-3">{outfit.description}</p>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteOutfit(outfit.id); }}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-red-900/50 text-red-400 hover:text-white rounded-lg transition"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Outfit */}
                                <div className="bg-brand-bg/30 border-2 border-dashed border-white/10 rounded-xl p-6">
                                    <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <PlusIcon className="w-4 h-4" /> Add New Outfit
                                    </h3>
                                    <div className="flex gap-4 mb-4">
                                        <input 
                                            type="text" 
                                            value={newOutfitName}
                                            onChange={e => setNewOutfitName(e.target.value)}
                                            placeholder="Outfit Name (e.g. Battle Armor)"
                                            className="flex-1 bg-brand-bg/50 border border-brand-primary/50 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <div className="relative">
                                            <button 
                                                onClick={() => outfitUploadRef.current?.click()}
                                                disabled={isAnalyzing}
                                                className="h-full flex items-center gap-2 bg-brand-primary/50 hover:bg-brand-primary text-white px-4 py-2 rounded-lg transition text-sm"
                                                title="Upload image to describe outfit"
                                            >
                                                 {isAnalyzing ? <WandSparklesIcon className="w-4 h-4 animate-spin"/> : <ImageIcon className="w-4 h-4" />}
                                            </button>
                                            <input type="file" ref={outfitUploadRef} className="hidden" accept="image/*" onChange={handleOutfitUpload} />
                                        </div>
                                    </div>
                                    <textarea 
                                        value={newOutfitDesc}
                                        onChange={e => setNewOutfitDesc(e.target.value)}
                                        rows={3}
                                        placeholder="Detailed description of clothing, colors, materials..."
                                        className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-lg px-3 py-2 text-sm mb-4 resize-none"
                                    />
                                    <button 
                                        onClick={handleAddOutfit}
                                        disabled={!newOutfitName.trim()}
                                        className="w-full bg-brand-secondary/20 hover:bg-brand-secondary text-brand-secondary hover:text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
                                    >
                                        Add Outfit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-brand-bg/20 rounded-b-xl">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-brand-text-muted hover:bg-brand-primary/50 hover:text-white transition">Cancel</button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20">
                        <SaveIcon className="w-5 h-5" /> Save Visuals
                    </button>
                </div>
            </div>
        </div>
    );
};

import { UserIcon } from './icons'; // Re-import for local usage if needed or ensure it's in import list
export default CharacterVisualModal;
