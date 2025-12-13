import React, { useState, useMemo } from 'react';
import { Note } from '../../types';
import { useStory } from '../../contexts/StoryContext';
import { PlusIcon, TrashIcon, SearchIcon } from '../icons';

const NotesView: React.FC = () => {
    const { notes, addNote, updateNote, deleteNote } = useStory();
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = useMemo(() => {
        if (!searchQuery) return notes;
        const q = searchQuery.toLowerCase();
        return notes.filter(n =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        );
    }, [notes, searchQuery]);

    const selectedNote = useMemo(() =>
        notes.find(n => n.id === selectedNoteId),
        [notes, selectedNoteId]);

    const handleCreateNote = () => {
        const newNote: Note = {
            id: `note_${Date.now()}`,
            title: 'New Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        addNote(newNote);
        setSelectedNoteId(newNote.id);
    };

    const handleDeleteNote = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this note?')) {
            deleteNote(id);
            if (selectedNoteId === id) setSelectedNoteId(null);
        }
    };

    return (
        <div className="flex h-full animate-in fade-in duration-500">
            {/* Notes Sidebar */}
            <div className="w-1/3 border-r border-white/10 flex flex-col bg-brand-surface/30 backdrop-blur-sm">
                <div className="p-4 border-b border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold font-serif text-brand-text">Notes</h2>
                        <button
                            onClick={handleCreateNote}
                            className="p-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <PlusIcon className="w-4 h-4" />
                            New Note
                        </button>
                    </div>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-brand-bg/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-brand-text focus:ring-1 focus:ring-brand-secondary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {filteredNotes.length === 0 ? (
                        <div className="text-center text-brand-text-muted py-8 text-sm">
                            No notes found.
                        </div>
                    ) : (
                        filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => setSelectedNoteId(note.id)}
                                className={`group p-3 rounded-lg cursor-pointer transition-all border ${selectedNoteId === note.id
                                        ? 'bg-brand-primary/10 border-brand-primary/30'
                                        : 'hover:bg-white/5 border-transparent hover:border-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-medium truncate ${selectedNoteId === note.id ? 'text-brand-primary' : 'text-brand-text'}`}>
                                        {note.title || 'Untitled Note'}
                                    </h3>
                                    <button
                                        onClick={(e) => handleDeleteNote(e, note.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-xs text-brand-text-muted line-clamp-2">
                                    {note.content || 'No content...'}
                                </p>
                                <div className="mt-2 text-[10px] text-brand-text-muted/50">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Note Editor */}
            <div className="w-2/3 flex flex-col bg-brand-bg/50">
                {selectedNote ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-white/10">
                            <input
                                type="text"
                                value={selectedNote.title}
                                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                                className="w-full bg-transparent text-3xl font-serif font-bold text-brand-text placeholder-brand-text-muted/30 outline-none"
                                placeholder="Note Title"
                            />
                            <div className="flex items-center gap-4 mt-2 text-xs text-brand-text-muted">
                                <span>Last edited: {new Date(selectedNote.updatedAt).toLocaleString()}</span>
                                {selectedNote.relatedType && (
                                    <span className="px-2 py-0.5 bg-brand-surface rounded-full border border-white/5">
                                        Linked to {selectedNote.relatedType}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-grow p-6">
                            <textarea
                                value={selectedNote.content}
                                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                                className="w-full h-full bg-transparent text-brand-text placeholder-brand-text-muted/30 outline-none resize-none leading-relaxed custom-scrollbar"
                                placeholder="Start writing..."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-brand-text-muted">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                            <PlusIcon className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-lg font-medium">Select a note or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesView;
