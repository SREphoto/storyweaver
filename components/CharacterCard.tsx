

import React, { useState } from 'react';
import { Character, CharacterType } from '../types';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, CrownIcon, SkullIcon, UsersIcon, DramaIcon, EditIcon, SaveIcon, HeartIcon, GraduationCapIcon, UserIcon, InfoIcon, CheckCircleIcon, DownloadIcon, ImageIcon, PaletteIcon, LayoutDashboardIcon } from './icons';
import { characterTypeDescriptions } from './characterTypeDescriptions';
import CollapsibleSubSection from './CollapsibleSubSection';
import ArcVisualizer from './ArcVisualizer';


interface CharacterCardProps {
    character: Character;
    isSelected: boolean;
    onToggleSelect: () => void;
    onDelete: () => void;
    onUpdate: (characterId: string, updates: Partial<Character>) => void;
    onExport: (characterId: string) => void;
    onGenerateImage: (character: Character) => void;
    onOpenVisuals?: (character: Character) => void;
    onOpenSplitView?: () => void;
}

const getCharacterColor = (type: CharacterType): string => {
    switch (type) {
        case CharacterType.PROTAGONIST: return '#fbbF24'; // amber-400
        case CharacterType.ANTAGONIST: return '#f87171'; // red-400
        case CharacterType.DEUTERAGONIST: return '#6ee7b7'; // emerald-300
        case CharacterType.MENTOR: return '#60a5fa'; // blue-400
        case CharacterType.LOVE_INTEREST: return '#f472b6'; // pink-400
        case CharacterType.FOIL: return '#c084fc'; // purple-400
        default: return '#9ca3af'; // gray-400
    }
}


const getCharacterIcon = (type: CharacterType, color: string) => {
    const iconProps = { className: "w-5 h-5", style: { color } };
    switch (type) {
        case CharacterType.PROTAGONIST:
            return <CrownIcon {...iconProps} title="Protagonist" />;
        case CharacterType.ANTAGONIST:
            return <SkullIcon {...iconProps} title="Antagonist" />;
        case CharacterType.DEUTERAGONIST:
            return <UsersIcon {...iconProps} title="Deuteragonist" />;
        case CharacterType.SUPPORTING_CHARACTER:
            return <UsersIcon {...iconProps} title="Supporting Character" />;
        case CharacterType.MENTOR:
            return <GraduationCapIcon {...iconProps} title="Mentor" />;
        case CharacterType.LOVE_INTEREST:
            return <HeartIcon {...iconProps} title="Love Interest" />;
        case CharacterType.FOIL:
            return <DramaIcon {...iconProps} title="Foil" />;
        case CharacterType.MINOR_CHARACTER:
            return <UserIcon {...iconProps} title="Minor Character" />;
        default:
            return null;
    }
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, isSelected, onToggleSelect, onDelete, onUpdate, onExport, onGenerateImage, onOpenVisuals, onOpenSplitView }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedHistory, setEditedHistory] = useState(character.history);
    const [editedArc, setEditedArc] = useState(character.arc);
    const [editedType, setEditedType] = useState<CharacterType>(character.type);

    const characterColor = getCharacterColor(character.type);
    const characterIcon = getCharacterIcon(character.type, characterColor);

    const handleEditToggle = () => {
        if (isEditing) {
            // If canceling, revert changes
            setEditedHistory(character.history);
            setEditedArc(character.arc);
            setEditedType(character.type);
        }
        setIsEditing(!isEditing);
        if (!isEditing) {
            setIsExpanded(true); // Expand when starting to edit
        }
    };

    const handleSave = () => {
        onUpdate(character.id, {
            history: editedHistory,
            arc: editedArc,
            type: editedType,
        });
        setIsEditing(false);
    };


    return (
        <div className={`glass-card rounded-xl transition-all duration-300 shadow-lg border ${isSelected ? 'border-brand-secondary ring-2 ring-brand-secondary/30' : 'border-white/5 hover:border-white/10'} overflow-hidden`}>
            {character.headerImage && (
                <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${character.headerImage})` }} />
            )}
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div
                        className="flex items-center gap-3 flex-grow min-w-0 cursor-pointer"
                        onClick={onToggleSelect}
                    >
                        {isSelected ? <CheckCircleIcon className="w-5 h-5 text-brand-secondary flex-shrink-0" /> : <div className="w-5 h-5 rounded-full border border-brand-text-muted/50 flex-shrink-0" />}
                        <div>
                            <div className="flex items-center gap-2">
                                {characterIcon}
                                <h3 className="font-bold text-brand-text text-lg truncate">{character.name}</h3>
                            </div>
                            <p className="text-xs text-brand-text-muted flex items-center gap-1">
                                {character.type}
                                <span className="w-1 h-1 rounded-full bg-brand-text-muted/50 mx-1"></span>
                                {character.traits}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {isEditing ? (
                            <button onClick={handleSave} className="p-1.5 bg-brand-secondary/20 text-brand-secondary rounded-lg hover:bg-brand-secondary hover:text-white transition mr-1">
                                <SaveIcon className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={handleEditToggle} className="p-1.5 text-brand-text-muted hover:text-white transition hover:bg-white/5 rounded-lg">
                                <EditIcon className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-brand-text-muted hover:text-white transition hover:bg-white/5 rounded-lg">
                            {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className={`mt-3 pt-3 border-t border-white/10 space-y-4 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
                    <div>
                        <CollapsibleSubSection title="History & Backstory" defaultCollapsed={false}>
                            {isEditing ? (
                                <textarea
                                    value={editedHistory}
                                    onChange={(e) => setEditedHistory(e.target.value)}
                                    className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-lg p-2 text-sm mt-2 min-h-[100px]"
                                />
                            ) : (
                                <p className="text-sm text-brand-text-muted font-serif leading-relaxed mt-2 whitespace-pre-wrap">{character.history}</p>
                            )}
                        </CollapsibleSubSection>
                    </div>

                    <div>
                        <CollapsibleSubSection title="Character Arc" defaultCollapsed={false}>
                            {isEditing ? (
                                <textarea
                                    value={editedArc}
                                    onChange={(e) => setEditedArc(e.target.value)}
                                    className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-lg p-2 text-sm mt-2 min-h-[80px]"
                                />
                            ) : (
                                <>
                                    <p className="text-sm text-brand-text-muted font-serif leading-relaxed mt-2 whitespace-pre-wrap">{character.arc}</p>
                                    <ArcVisualizer arcText={character.arc} />
                                </>
                            )}
                        </CollapsibleSubSection>
                    </div>

                    {isEditing && (
                        <div className="bg-brand-bg/30 p-3 rounded-lg border border-brand-primary/30">
                            <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">Change Archetype</label>
                            <select
                                value={editedType}
                                onChange={(e) => setEditedType(e.target.value as CharacterType)}
                                className="w-full bg-brand-bg border border-brand-primary/50 rounded px-2 py-1 text-sm"
                            >
                                {Object.values(CharacterType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        {onOpenVisuals && (
                            <button onClick={() => onOpenVisuals(character)} className="p-1.5 text-sky-400 hover:text-sky-300 transition hover:bg-sky-900/20 rounded-lg flex items-center gap-1" title="Edit Visuals & Outfits">
                                <PaletteIcon className="w-4 h-4" />
                            </button>
                        )}
                        {onOpenSplitView && (
                            <button onClick={onOpenSplitView} className="p-1.5 text-brand-secondary hover:text-white transition hover:bg-brand-secondary/20 rounded-lg" title="Open in Split View">
                                <LayoutDashboardIcon className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={() => onGenerateImage(character)} className="p-1.5 text-purple-400 hover:text-purple-300 transition hover:bg-purple-900/20 rounded-lg" title="Generate Portrait">
                            <ImageIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => onExport(character.id)} className="p-1.5 text-brand-text-muted hover:text-white transition hover:bg-white/10 rounded-lg" title="Export Character">
                            <DownloadIcon className="w-4 h-4" />
                        </button>
                        <button onClick={onDelete} className="p-1.5 text-red-400 hover:text-red-300 transition hover:bg-red-900/20 rounded-lg" title="Delete Character">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCard;