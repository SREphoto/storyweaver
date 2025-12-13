import React, { useState } from 'react';
import { Scene, Character, StoryObject } from '../types';
import { SaveIcon, CheckCircleIcon, WriteIcon, MapIcon, BookOpenIcon, XIcon, PackageIcon } from './icons';
import Modal from './ui/Modal';

interface SceneEditModalProps {
    scene: Scene;
    allCharacters: Character[];
    allItems: StoryObject[];
    onSave: (id: string, updates: Partial<Scene>) => void;
    onClose: () => void;
}

type Tab = 'details' | 'setting' | 'script';

const SceneEditModal: React.FC<SceneEditModalProps> = ({ scene, allCharacters, allItems, onSave, onClose }) => {

    const [activeTab, setActiveTab] = useState<Tab>('details');

    // Fields
    const [title, setTitle] = useState(scene.title);
    const [summary, setSummary] = useState(scene.summary);
    const [fullText, setFullText] = useState(scene.fullText);
    const [characterIds, setCharacterIds] = useState<string[]>(scene.characterIds || []);
    const [itemIds, setItemIds] = useState<string[]>(scene.itemIds || []);
    const [settingDescription, setSettingDescription] = useState(scene.settingDescription || '');
    const [script, setScript] = useState(scene.script || '');

    const handleSave = () => {
        onSave(scene.id, {
            title,
            summary,
            fullText,
            characterIds,
            itemIds,
            settingDescription,
            script
        });
    };

    const toggleCharacter = (id: string) => {
        setCharacterIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleItem = (id: string) => {
        setItemIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Edit Scene: ${title}`} maxWidth="4xl">
            {/* Tabs */}
            <div className="flex items-center border-b border-white/10 px-5 bg-brand-bg/30 shrink-0">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-3 text-sm font-medium transition border-b-2 ${activeTab === 'details' ? 'border-brand-secondary text-brand-secondary' : 'border-transparent text-brand-text-muted hover:text-white'}`}
                >
                    <div className="flex items-center gap-2"><BookOpenIcon className="w-4 h-4" /> Details & Draft</div>
                </button>
                <button
                    onClick={() => setActiveTab('setting')}
                    className={`px-4 py-3 text-sm font-medium transition border-b-2 ${activeTab === 'setting' ? 'border-brand-secondary text-brand-secondary' : 'border-transparent text-brand-text-muted hover:text-white'}`}
                >
                    <div className="flex items-center gap-2"><MapIcon className="w-4 h-4" /> Setting</div>
                </button>
                <button
                    onClick={() => setActiveTab('script')}
                    className={`px-4 py-3 text-sm font-medium transition border-b-2 ${activeTab === 'script' ? 'border-brand-secondary text-brand-secondary' : 'border-transparent text-brand-text-muted hover:text-white'}`}
                >
                    <div className="flex items-center gap-2"><WriteIcon className="w-4 h-4" /> Screenplay</div>
                </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* TAB: DETAILS */}
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-brand-text-muted mb-2 uppercase tracking-wider">Scene Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-2.5 text-brand-text focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
                                placeholder="Enter scene title..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 flex flex-col">
                                <label className="block text-sm font-semibold text-brand-text-muted mb-2 uppercase tracking-wider">Summary</label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={6}
                                    className="w-full flex-grow bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 text-sm text-brand-text font-serif focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition resize-none"
                                    placeholder="Brief summary of what happens..."
                                />
                            </div>
                            <div className="md:col-span-1 flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-brand-text-muted uppercase tracking-wider">Characters</label>
                                    <span className="text-xs text-brand-text-muted">{characterIds.length} Active</span>
                                </div>
                                <div className="bg-brand-bg/30 rounded-xl p-2 h-[168px] overflow-y-auto border border-brand-primary/30 custom-scrollbar">
                                    {allCharacters.length > 0 ? allCharacters.map(char => (
                                        <div
                                            key={char.id}
                                            onClick={() => toggleCharacter(char.id)}
                                            className={`flex items-center justify-between p-2 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${characterIds.includes(char.id) ? 'bg-brand-secondary/20 border border-brand-secondary/40' : 'hover:bg-brand-primary/30 border border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${characterIds.includes(char.id) ? 'bg-brand-secondary border-brand-secondary' : 'border-brand-text-muted/50'}`}>
                                                    {characterIds.includes(char.id) && <CheckCircleIcon className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className={`text-sm font-medium ${characterIds.includes(char.id) ? 'text-white' : 'text-brand-text-muted'}`}>{char.name}</span>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-brand-text-muted italic p-2">No characters created yet.</p>}
                                </div>

                                <div className="flex justify-between items-center mb-2 mt-4">
                                    <label className="block text-sm font-semibold text-brand-text-muted uppercase tracking-wider">Items</label>
                                    <span className="text-xs text-brand-text-muted">{itemIds.length} Linked</span>
                                </div>
                                <div className="bg-brand-bg/30 rounded-xl p-2 h-[168px] overflow-y-auto border border-brand-primary/30 custom-scrollbar">
                                    {allItems.length > 0 ? allItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`flex items-center justify-between p-2 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${itemIds.includes(item.id) ? 'bg-brand-secondary/20 border border-brand-secondary/40' : 'hover:bg-brand-primary/30 border border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${itemIds.includes(item.id) ? 'bg-brand-secondary border-brand-secondary' : 'border-brand-text-muted/50'}`}>
                                                    {itemIds.includes(item.id) && <CheckCircleIcon className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className={`text-sm font-medium ${itemIds.includes(item.id) ? 'text-white' : 'text-brand-text-muted'}`}>{item.name}</span>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-brand-text-muted italic p-2">No items created yet.</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-text-muted mb-2 uppercase tracking-wider">Full Scene Draft (Prose)</label>
                            <textarea
                                value={fullText}
                                onChange={(e) => setFullText(e.target.value)}
                                rows={12}
                                className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 text-sm text-brand-text font-serif focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
                                placeholder="Write the full scene prose here..."
                            />
                        </div>
                    </div>
                )}

                {/* TAB: SETTING */}
                {activeTab === 'setting' && (
                    <div className="h-full flex flex-col">
                        <label className="block text-sm font-semibold text-brand-text-muted mb-2 uppercase tracking-wider">Setting Description</label>
                        <p className="text-xs text-brand-text-muted mb-4">Describe the location, atmosphere, lighting, and sensory details for this specific scene.</p>
                        <textarea
                            value={settingDescription}
                            onChange={(e) => setSettingDescription(e.target.value)}
                            className="w-full flex-grow min-h-[400px] bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 text-sm text-brand-text font-serif focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
                            placeholder="The room was dim, smelling of ozone and stale coffee..."
                        />
                    </div>
                )}

                {/* TAB: SCRIPT */}
                {activeTab === 'script' && (
                    <div className="h-full flex flex-col">
                        <label className="block text-sm font-semibold text-brand-text-muted mb-2 uppercase tracking-wider">Screenplay Format</label>
                        <p className="text-xs text-brand-text-muted mb-4">Auto-generated or manually written script format (Scene Heading, Action, Dialogue).</p>
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            className="w-full flex-grow min-h-[400px] bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 text-sm text-brand-text font-mono focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition leading-relaxed whitespace-pre-wrap"
                            placeholder="EXT. CITY STREET - NIGHT..."
                        />
                    </div>
                )}

            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-brand-bg/20 rounded-b-xl shrink-0">
                <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-brand-text-muted hover:bg-brand-primary/50 hover:text-white transition font-medium border border-transparent hover:border-white/5"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20"
                >
                    <SaveIcon className="w-5 h-5" />
                    Save Changes
                </button>
            </div>
        </Modal>
    );
};

export default SceneEditModal;