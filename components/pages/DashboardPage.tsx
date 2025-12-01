import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStory } from '../../contexts/StoryContext';
import { api } from '../../services/api';
import { PlusIcon, TrashIcon, BookOpenIcon, LogOutIcon } from '../icons';

interface StoryMeta {
    id: string;
    title: string;
    premise: string;
    lastUpdated: string;
}

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const { loadProject } = useStory();
    const navigate = useNavigate();
    const [stories, setStories] = useState<StoryMeta[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const data = await api.get('/stories');
            setStories(data);
        } catch (error) {
            console.error('Failed to fetch stories', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = async () => {
        try {
            const newStory = await api.post('/stories', {
                title: 'New Story',
                premise: '',
                data: {
                    characters: [],
                    scenes: [],
                    savedMaterials: [],
                    storyPremise: '',
                    storyTextToAnalyze: ''
                }
            });
            // Load the new story into context
            // We need to fetch the full story data first, but here we just created it empty
            // Actually, we should probably navigate to the editor and let it load there.
            // For now, let's just load it directly if we can, or navigate to /editor/:id
            navigate(`/editor/${newStory.id}`);
        } catch (error) {
            console.error('Failed to create story', error);
        }
    };

    const handleOpenStory = async (id: string) => {
        navigate(`/editor/${id}`);
    };

    const handleDeleteStory = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this story?')) return;
        try {
            await api.delete(`/stories/${id}`);
            setStories(stories.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to delete story', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-serif font-bold">Welcome, <span className="text-brand-secondary">{user?.username}</span></h1>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-brand-text-muted hover:text-white transition">
                        <LogOutIcon className="w-5 h-5" /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Create New Card */}
                    <button onClick={handleCreateNew} className="glass-card p-6 rounded-2xl border border-white/5 border-dashed hover:border-brand-secondary/50 hover:bg-brand-secondary/5 transition flex flex-col items-center justify-center gap-4 group min-h-[200px]">
                        <div className="p-4 bg-white/5 rounded-full group-hover:bg-white/10 transition">
                            <PlusIcon className="w-8 h-8 text-brand-secondary" />
                        </div>
                        <span className="font-bold text-lg">Create New Story</span>
                    </button>

                    {/* Story Cards */}
                    {isLoading ? (
                        <div className="col-span-full text-center py-10 text-brand-text-muted">Loading stories...</div>
                    ) : stories.map(story => (
                        <div key={story.id} onClick={() => handleOpenStory(story.id)} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-brand-primary/50 cursor-pointer transition group relative flex flex-col min-h-[200px]">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold mb-2 line-clamp-2">{story.title}</h3>
                                <p className="text-sm text-brand-text-muted line-clamp-3">{story.premise || 'No premise yet...'}</p>
                            </div>
                            <div className="mt-4 flex justify-between items-end">
                                <span className="text-xs text-brand-text-muted">Updated: {new Date(story.lastUpdated).toLocaleDateString()}</span>
                                <button onClick={(e) => handleDeleteStory(e, story.id)} className="p-2 hover:bg-red-500/20 rounded-full text-brand-text-muted hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
