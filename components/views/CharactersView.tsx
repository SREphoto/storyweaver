import React, { useState } from 'react';
import { Character, CharacterType, ImageStyle } from '../../types';
import CharacterBuilder from '../CharacterBuilder';
import CharacterLegend from '../CharacterLegend';
import CharacterCard from '../CharacterCard';
import { UsersIcon, ImageIcon } from '../icons';

interface CharactersViewProps {
    onCreateCharacter: (name: string, type: CharacterType, initialInfo: string, traits: string, backstory: string, imageUrl?: string) => void;
    isLoading: boolean;
    filteredCharacters: Character[];
    selectedCharacterIds: Set<string>;
    onToggleSelect: (id: string, type: 'character') => void;
    onDeleteCharacter: (id: string) => void;
    onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
    onGenerateCharacterImage: (character: Character, style?: ImageStyle) => void;
    onOpenVisuals: (character: Character) => void;
    onOpenSplitView: (type: 'character', id: string) => void;
}

const CharactersView: React.FC<CharactersViewProps> = ({
    onCreateCharacter, isLoading, filteredCharacters, selectedCharacterIds,
    onToggleSelect, onDeleteCharacter, onUpdateCharacter, onGenerateCharacterImage,
    onOpenVisuals, onOpenSplitView
}) => {
    const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.CONCEPT_ART);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-serif font-bold mb-4">Character Builder</h2>
                    <CharacterBuilder onCreateCharacter={onCreateCharacter} isLoading={isLoading} />
                </div>
                <div className="xl:col-span-1 glass-card p-6 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-serif font-bold mb-4">Archetypes</h2>
                    <CharacterLegend />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-2xl font-serif font-bold">Cast of Characters</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select
                                value={imageStyle}
                                onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                                className="appearance-none bg-brand-surface border border-white/10 text-xs px-3 py-1.5 rounded-full text-brand-text pr-8 focus:ring-1 focus:ring-brand-secondary outline-none"
                                aria-label="Image Style"
                            >
                                {Object.values(ImageStyle).map(style => (
                                    <option key={style} value={style}>{style}</option>
                                ))}
                            </select>
                            <ImageIcon className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCharacters.length > 0 ? (
                        filteredCharacters.map(char => (
                            <CharacterCard
                                key={char.id}
                                character={char}
                                isSelected={selectedCharacterIds.has(char.id)}
                                onToggleSelect={() => onToggleSelect(char.id, 'character')}
                                onDelete={() => onDeleteCharacter(char.id)}
                                onUpdate={onUpdateCharacter}
                                onExport={() => { }}
                                onGenerateImage={(c) => onGenerateCharacterImage(c, imageStyle)}
                                onOpenVisuals={(c) => onOpenVisuals(c)}
                                onOpenSplitView={() => onOpenSplitView('character', char.id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-brand-text-muted">
                            <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No characters found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharactersView;
