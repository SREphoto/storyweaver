import React, { useRef } from 'react';
import { ViewMode } from '../types';
import { useStory } from '../contexts/StoryContext';
import {
    BookOpenIcon, ChevronLeftIcon, UsersIcon, MapIcon, TimelineIcon,
    FilmIcon, ZapIcon, SaveIcon, ImportIcon, SunIcon, MoonIcon, HelpCircleIcon
} from './icons';

interface SidebarProps {
    activeView: ViewMode;
    setActiveView: (view: ViewMode) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    theme: 'dark' | 'light';
    setShowThemeSettings: (show: boolean) => void;
    setShowOnboarding: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    setActiveView,
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    setShowThemeSettings,
    setShowOnboarding
}) => {
    const { saveProject, loadProject, saveStatus } = useStory();
    const projectLoadRef = useRef<HTMLInputElement>(null);

    const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            loadProject(file);
        }
        if (projectLoadRef.current) {
            projectLoadRef.current.value = '';
        }
    };

    return (
        <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out relative z-20`}>
            <div className={`h-full w-80 flex flex-col glass-panel border-r border-white/10 overflow-hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-secondary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-secondary/20">
                            <BookOpenIcon className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-serif font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-secondary to-brand-accent">
                            StoryWeaver
                        </h1>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-brand-text-muted hover:text-brand-text">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-grow px-3 space-y-2 mt-4">
                    <a href="/" className="w-full flex items-center gap-3 p-3 rounded-xl text-brand-text-muted hover:text-brand-text hover:bg-white/5 transition-all duration-200">
                        <ChevronLeftIcon className="w-5 h-5" />
                        <span className="hidden lg:block font-medium text-sm">Back to Dashboard</span>
                    </a>
                    <div className="h-px bg-white/10 my-2 mx-2" />
                    <button onClick={() => setActiveView('story')} title="Story Context" className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeView === 'story' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 'text-brand-text-muted hover:text-brand-text hover:bg-white/5'}`}>
                        <BookOpenIcon className="w-5 h-5" />
                        <span className="hidden lg:block font-medium text-sm">Story Context</span>
                    </button>
                    <button onClick={() => setActiveView('characters')} title="Characters" className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeView === 'characters' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 'text-brand-text-muted hover:text-brand-text hover:bg-white/5'}`}>
                        <UsersIcon className="w-5 h-5" />
                        <span className="hidden lg:block font-medium text-sm">Characters</span>
                    </button>
                    <button onClick={() => setActiveView('world')} title="World & Visuals" className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeView === 'world' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 'text-brand-text-muted hover:text-brand-text hover:bg-white/5'}`}>
                        <MapIcon className="w-5 h-5" />
                        <span className="hidden lg:block font-medium text-sm">World & Visuals</span>
                    </button>
                    <button onClick={() => setActiveView('timeline')} title="Timeline" className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeView === 'timeline' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 'text-brand-text-muted hover:text-brand-text hover:bg-white/5'}`}>
                        <TimelineIcon className="w-5 h-5" />
                        <span className="hidden lg:block font-medium text-sm">Timeline</span>
                    </button>
                    <button onClick={() => setActiveView('visual')} title="Visual View" className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeView === 'visual' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 'text-brand-text-muted hover:text-brand-text hover:bg-white/5'}`}>
                        <FilmIcon className="w-5 h-5" />
                        <span className="hidden lg:block font-medium text-sm">Visual View</span>
                    </button>
                    <button onClick={() => setActiveView('comic')} title="Comic Creator" className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeView === 'comic' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 'text-brand-text-muted hover:text-brand-text hover:bg-white/5'}`}>
                        <ZapIcon className="w-5 h-5" />
                        <span className="hidden lg:block font-medium text-sm">Comic Creator</span>
                    </button>
                </nav>

                {/* Utilities / Footer */}
                <div className="p-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={() => saveProject()}
                        disabled={saveStatus === 'saving'}
                        className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-brand-text-muted hover:text-white hover:bg-white/5 transition group"
                    >
                        <SaveIcon className={`w-5 h-5 ${saveStatus === 'saved' ? 'text-green-400' : ''}`} />
                        <span className="hidden lg:block text-sm font-medium">
                            {saveStatus === 'saving' ? 'Zipping...' : saveStatus === 'saved' ? 'Saved!' : 'Save Project'}
                        </span>
                    </button>

                    <button
                        onClick={() => projectLoadRef.current?.click()}
                        className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-brand-text-muted hover:text-white hover:bg-white/5 transition"
                    >
                        <ImportIcon className="w-5 h-5" />
                        <span className="hidden lg:block text-sm font-medium">Load Project</span>
                    </button>
                    <input
                        type="file"
                        ref={projectLoadRef}
                        onChange={handleLoadProject}
                        accept=".zip,.json"
                        className="hidden"
                    />

                    <button onClick={() => setShowThemeSettings(true)} title="Appearance" className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-brand-text-muted hover:text-white hover:bg-white/5 transition">
                        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        <span className="hidden lg:block text-sm font-medium">Appearance</span>
                    </button>
                    <button onClick={() => setShowOnboarding(true)} className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-brand-text-muted hover:text-white hover:bg-white/5 transition">
                        <HelpCircleIcon className="w-5 h-5" />
                        <span className="hidden lg:block text-sm font-medium">Guide</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
