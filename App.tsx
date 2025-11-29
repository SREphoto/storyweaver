import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';


import { Character, CharacterType, GeneratedContent, Scene, Tool, SavedMaterial, MaterialType, TimelineItem, RelationshipWebData, MapData, Location, Section, FilterSettings, StoryObject, OutlineItem, Book, ViewMode, StoryboardShot } from './types';
import * as geminiService from './services/geminiService';
import CharacterCard from './components/CharacterCard';
import { LayoutDashboardIcon, ChevronRightIcon } from './components/icons';
import SceneCard from './components/SceneCard';
import ImagePreviewModal from './components/ImagePreviewModal';
import SearchBar from './components/SearchBar';
import InteractiveBackground from './components/InteractiveBackground';
import OnboardingWalkthrough from './components/OnboardingWalkthrough';
import BookReader from './components/BookReader';
import VisualNovelView from './components/VisualNovelView';
import StoryboardModal from './components/StoryboardModal';
import CharacterVisualModal from './components/CharacterVisualModal';
import ComicCreator from './components/ComicCreator';
import ThemeSettingsModal, { THEMES, ThemeColor } from './components/ThemeSettingsModal';
import { useStory } from './contexts/StoryContext';
import { useStoryGenerators } from './hooks/useStoryGenerators';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import StoryView from './components/views/StoryView';
import CharactersView from './components/views/CharactersView';
import WorldView from './components/views/WorldView';
import TimelineView from './components/views/TimelineView';



function App() {
    const {
        storyPremise, setStoryPremise,
        storyTextToAnalyze, setStoryTextToAnalyze,
        characters, setCharacters,
        scenes, setScenes,
        mapData, setMapData,
        savedMaterials, setSavedMaterials,
        compiledBook, setCompiledBook,
        isLoading, setIsLoading,
        loadingMessage, setLoadingMessage,
        error, setError,
        generatedContent, setGeneratedContent,
        updateCharacter, deleteCharacter,
        addScene, updateScene, deleteScene, reorderScenes,
        updateLocation, deleteSavedMaterial,
        loadProject
    } = useStory();

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as 'dark' | 'light';
        }
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    });
    const [showThemeSettings, setShowThemeSettings] = useState(false);
    const [currentThemeColor, setCurrentThemeColor] = useState<ThemeColor>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('themeColor')) {
            try {
                return JSON.parse(localStorage.getItem('themeColor')!);
            } catch (e) {
                return THEMES[0];
            }
        }
        return THEMES[0];
    });

    const [activeView, setActiveView] = useState<ViewMode>('story');
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeStoryboardSceneId, setActiveStoryboardSceneId] = useState<string | null>(null);

    const [activeVisualCharacterId, setActiveVisualCharacterId] = useState<string | null>(null);
    const [secondaryView, setSecondaryView] = useState<{ type: 'character' | 'scene', id: string } | null>(null);

    // Selection State
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<Set<string>>(new Set());
    const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
    const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
    const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string>>(new Set());

    // Local UI State
    // generatedImage moved to hook

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSettings, setFilterSettings] = useState<FilterSettings>({
        characters: true,
        scenes: true,
        locations: true,
        materials: true,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        handleCreateCharacter,
        handleAnalyzeStory,
        handleGenerate,
        handleGenerateWithContext,
        handleGenerateSceneImage,
        handleGenerateCharacterImage,
        handleAnalyzeVideo,
        handleGenerateTimeline,
        handleGenerateSceneDetails,
        generatedImage,
        setGeneratedImage
    } = useStoryGenerators({ selectedCharacterIds, selectedSceneIds, selectedMaterialIds });

    // --- Effects ---

    // --- Effects ---

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.add('light');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (currentThemeColor) {
            document.documentElement.style.setProperty('--color-primary', currentThemeColor.primary);
            document.documentElement.style.setProperty('--color-secondary', currentThemeColor.secondary);
            document.documentElement.style.setProperty('--color-accent', currentThemeColor.accent);
        }
    }, [currentThemeColor]);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('storyWeaver_onboarding_complete');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    useEffect(() => {
        if (isLoading) setIsRightPanelOpen(true);
    }, [isLoading]);


    // --- Handlers ---

    // --- Handlers ---

    const handleCompileBook = () => {
        if (scenes.length === 0) {
            setError("You need scenes to compile a story!");
            return;
        }

        const book: Book = {
            title: storyPremise.split('.')[0] || 'My Story', // Use first sentence of premise or default
            chapters: scenes.map(s => ({
                title: s.title,
                content: s.fullText || s.summary // Fallback to summary if full text isn't written
            }))
        };
        setCompiledBook(book);
        setActiveView('book');
    };

    const handleCompleteOnboarding = () => {
        localStorage.setItem('storyWeaver_onboarding_complete', 'true');
        setShowOnboarding(false);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleSetThemeColor = (themeColor: ThemeColor) => {
        setCurrentThemeColor(themeColor);
        localStorage.setItem('themeColor', JSON.stringify(themeColor));
    };

    const handleViewLocationScenes = (locationName: string) => {
        // Simple filter for now: find scenes that mention the location name in their setting description or title
        // Or better, just filter by text search for the location name
        setSearchQuery(locationName);
        setFilterSettings(prev => ({ ...prev, scenes: true, characters: false, materials: false, locations: false }));
        setActiveView('story');
        // Optionally show a toast or message
    };

    const clearOutput = () => {
        setError(null);
        setGeneratedContent(null);
        setIsRightPanelOpen(true);
    }



    // ... (Storyboard Logic remains same)
    const handleGenerateStoryboard = async (sceneId: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;

        setIsLoading(true);
        // Keep modal open but show loading state
        try {
            const charactersInScene = characters.filter(c => scene.characterIds?.includes(c.id));
            let updatedScene = { ...scene };

            // 1. Ensure Setting Description
            if (!updatedScene.settingDescription) {
                setLoadingMessage('Generating scene setting...');
                const setting = await geminiService.generateSceneSetting(updatedScene);
                updatedScene.settingDescription = setting;
            }

            // 2. Ensure Script
            if (!updatedScene.script) {
                setLoadingMessage('Generating screenplay...');
                const script = await geminiService.generateScript(updatedScene, charactersInScene);
                updatedScene.script = script;
            }

            // 3. Generate Shots
            setLoadingMessage('Visualizing shots...');
            const shots = await geminiService.generateStoryboardAnalysis(updatedScene, charactersInScene);
            updatedScene.storyboard = shots;

            // Update Scene in State
            setScenes(prev => prev.map(s => s.id === sceneId ? updatedScene : s));
            setActiveStoryboardSceneId(sceneId);

        } catch (e) {
            console.error(e);
            setError('Failed to generate storyboard.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };



    const handleGenerateSketch = async (sceneId: string, shotId: string, description: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;

        try {
            const base64Sketch = await geminiService.generateStoryboardSketch(description);
            const newStoryboard = scene.storyboard?.map(shot =>
                shot.id === shotId ? { ...shot, sketchImage: base64Sketch } : shot
            );
            updateScene(sceneId, { storyboard: newStoryboard });
        } catch (e) {
            console.error("Sketch failed", e);
        }
    };

    const handleUpdateShot = (sceneId: string, shotId: string, updates: Partial<StoryboardShot>) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;
        const newStoryboard = scene.storyboard?.map(shot =>
            shot.id === shotId ? { ...shot, ...updates } : shot
        );
        updateScene(sceneId, { storyboard: newStoryboard });
    };

    // Data Update Helpers
    const handleSetHeaderImage = () => {
        if (!generatedImage) return;
        if (generatedImage.source.type === 'scene') {
            updateScene(generatedImage.source.id, { headerImage: generatedImage.imageUrl });
        } else {
            updateCharacter(generatedImage.source.id, { headerImage: generatedImage.imageUrl });
        }
        setGeneratedImage(null);
    };

    const handleSaveImageToMaterials = () => {
        if (!generatedImage) return;
        setSavedMaterials(prev => [{
            id: `material_${Date.now()}`,
            type: 'IMAGE',
            title: `Image: ${generatedImage.title}`,
            content: generatedImage.imageUrl,
        }, ...prev]);
        setGeneratedImage(null);
    };

    const handleToggleSelection = (id: string, type: 'character' | 'scene' | 'material' | 'location') => {
        const updater = type === 'character' ? setSelectedCharacterIds :
            type === 'scene' ? setSelectedSceneIds :
                type === 'location' ? setSelectedLocationIds :
                    setSelectedMaterialIds;
        updater(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    };

    const handleBatchUpdateSelection = (type: 'character' | 'scene', ids: Set<string>) => {
        if (type === 'character') setSelectedCharacterIds(ids); else setSelectedSceneIds(ids);
    };

    const handleDeleteCharacterWrapper = (id: string) => {
        deleteCharacter(id);
        setSelectedCharacterIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    };

    const handleDeleteSceneWrapper = (id: string) => {
        deleteScene(id);
        setSelectedSceneIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    };

    const handleViewSavedMaterial = (m: SavedMaterial) => {
        clearOutput();
        setGeneratedContent({ title: m.title, content: m.content, type: m.type });
    };

    const handleExportData = (format: 'json' | 'txt') => {
        const data = { storyPremise, characters, scenes, mapData, savedMaterials };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'storyweaver_export.json'; a.click();
    }

    // ... (Render Helpers and filtered content logic)
    const filteredCharacters = useMemo(() => {
        if (!filterSettings.characters || !searchQuery) return characters;
        const q = searchQuery.toLowerCase();
        return characters.filter(c => c.name.toLowerCase().includes(q) || c.traits.toLowerCase().includes(q));
    }, [characters, searchQuery, filterSettings.characters]);

    const filteredScenes = useMemo(() => {
        if (!filterSettings.scenes || !searchQuery) return scenes;
        const q = searchQuery.toLowerCase();
        return scenes.filter(s => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q));
    }, [scenes, searchQuery, filterSettings.scenes]);

    const filteredMaterials = useMemo(() => {
        if (!filterSettings.materials || !searchQuery) return savedMaterials;
        const q = searchQuery.toLowerCase();
        return savedMaterials.filter(m => m.title.toLowerCase().includes(q));
    }, [savedMaterials, searchQuery, filterSettings.materials]);




    const activeStoryboardScene = activeStoryboardSceneId ? scenes.find(s => s.id === activeStoryboardSceneId) : null;
    const activeVisualCharacter = activeVisualCharacterId ? characters.find(c => c.id === activeVisualCharacterId) : null;

    return (
        <div className="flex h-screen w-screen bg-brand-bg text-brand-text overflow-hidden font-sans transition-colors duration-300">

            {/* --- Left Sidebar (Navigation & Tools) --- */}
            {/* --- Left Sidebar (Navigation & Tools) --- */}
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                theme={theme}
                setShowThemeSettings={setShowThemeSettings}
                setShowOnboarding={setShowOnboarding}
            />

            {activeVisualCharacter && (
                <CharacterVisualModal
                    character={activeVisualCharacter}
                    onSave={updateCharacter}
                    onClose={() => setActiveVisualCharacterId(null)}
                />
            )}

            {/* --- Main Content Area --- */}
            <main className="flex-grow flex flex-col relative">
                {/* Toggle Sidebar Button */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-4 left-4 p-2 bg-brand-surface border border-white/10 rounded-md text-brand-text-muted hover:text-white z-30 shadow-md"
                        title="Open Sidebar"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                )}

                <ThemeSettingsModal
                    isOpen={showThemeSettings}
                    onClose={() => setShowThemeSettings(false)}
                    currentTheme={theme}
                    onToggleTheme={toggleTheme}
                    currentThemeColorName={currentThemeColor.name}
                    onSelectThemeColor={handleSetThemeColor}
                />

                <InteractiveBackground theme={theme} />
                {showOnboarding && <OnboardingWalkthrough onComplete={handleCompleteOnboarding} />}
                {generatedImage && (
                    <ImagePreviewModal
                        imageUrl={generatedImage.imageUrl}
                        title={generatedImage.title}
                        onClose={() => setGeneratedImage(null)}
                        onSetHeader={handleSetHeaderImage}
                        onSave={handleSaveImageToMaterials}
                    />
                )}

                {activeStoryboardScene && (
                    <StoryboardModal
                        scene={activeStoryboardScene}
                        onGenerateStoryboard={() => handleGenerateStoryboard(activeStoryboardScene.id)}
                        onGenerateSketch={(shotId, desc) => handleGenerateSketch(activeStoryboardScene.id, shotId, desc)}
                        onUpdateShot={(shotId, updates) => handleUpdateShot(activeStoryboardScene.id, shotId, updates)}
                        onClose={() => setActiveStoryboardSceneId(null)}
                        isGenerating={isLoading}
                    />
                )}

                <div className="flex flex-grow overflow-hidden">
                    {/* Primary Content Area */}
                    <div className={`flex-grow overflow-y-auto custom-scrollbar p-6 lg:p-10 transition-all duration-300 ${secondaryView ? 'w-1/2 border-r border-white/10' : 'w-full'}`}>
                        <div className="max-w-6xl mx-auto space-y-8 pb-24 h-full">

                            {/* Search Bar Global */}
                            {activeView !== 'book' && activeView !== 'visual' && activeView !== 'comic' && (
                                <div className="mb-6">
                                    <SearchBar query={searchQuery} onQueryChange={setSearchQuery} filters={filterSettings} onFilterChange={setFilterSettings} />
                                </div>
                            )}

                            {/* --- VIEW: BOOK READER --- */}
                            {activeView === 'book' && compiledBook && (
                                <BookReader book={compiledBook} onClose={() => setActiveView('story')} />
                            )}

                            {/* --- VIEW: STORY --- */}
                            {activeView === 'story' && (
                                <StoryView
                                    storyPremise={storyPremise}
                                    setStoryPremise={setStoryPremise}
                                    storyTextToAnalyze={storyTextToAnalyze}
                                    setStoryTextToAnalyze={setStoryTextToAnalyze}
                                    onAnalyze={handleAnalyzeStory}
                                    isLoading={isLoading}
                                    characters={characters}
                                    scenes={scenes}
                                    savedMaterials={savedMaterials}
                                    onCompileBook={handleCompileBook}
                                    onGenerate={handleGenerate}
                                    filteredScenes={filteredScenes}
                                    selectedSceneIds={selectedSceneIds}
                                    onToggleSelect={handleToggleSelection}
                                    onUpdateScene={updateScene}
                                    onDeleteScene={handleDeleteSceneWrapper}
                                    onGenerateSceneDetails={handleGenerateSceneDetails}
                                    onGenerateSceneImage={handleGenerateSceneImage}
                                    onOpenStoryboard={(id) => setActiveStoryboardSceneId(id)}
                                    reorderScenes={reorderScenes}
                                    onOpenSplitView={(type, id) => setSecondaryView({ type, id })}
                                    addScene={addScene}
                                />
                            )}

                            {/* --- VIEW: CHARACTERS --- */}
                            {activeView === 'characters' && (
                                <CharactersView
                                    onCreateCharacter={handleCreateCharacter}
                                    isLoading={isLoading}
                                    filteredCharacters={filteredCharacters}
                                    selectedCharacterIds={selectedCharacterIds}
                                    onToggleSelect={handleToggleSelection}
                                    onDeleteCharacter={handleDeleteCharacterWrapper}
                                    onUpdateCharacter={updateCharacter}
                                    onGenerateCharacterImage={handleGenerateCharacterImage}
                                    onOpenVisuals={(c) => setActiveVisualCharacterId(c.id)}
                                    onOpenSplitView={(type, id) => setSecondaryView({ type, id })}
                                />
                            )}

                            {/* --- VIEW: WORLD --- */}






                            {/* --- VIEW: WORLD --- */}
                            {activeView === 'world' && (
                                <WorldView
                                    onGenerate={handleGenerate}
                                    isLoading={isLoading}
                                    mapData={mapData}
                                    selectedLocationIds={selectedLocationIds}
                                    onToggleSelectLocation={handleToggleSelection}
                                    onUpdateLocation={updateLocation}
                                    onExportData={handleExportData}
                                    onViewLocationScenes={handleViewLocationScenes}
                                    onAnalyzeVideo={handleAnalyzeVideo}
                                />
                            )}

                            {/* --- VIEW: TIMELINE --- */}
                            {activeView === 'timeline' && (
                                <TimelineView
                                    onGenerate={handleGenerate}
                                    scenes={scenes}
                                    allCharacters={characters}
                                    selectedSceneIds={selectedSceneIds}
                                    onToggleSelect={handleToggleSelection}
                                    onUpdateScene={updateScene}
                                    onDeleteScene={handleDeleteSceneWrapper}
                                    onAddScene={addScene}
                                    onReorderScenes={reorderScenes}
                                    isLoading={isLoading}
                                    onGenerateDetails={handleGenerateSceneDetails}
                                    onGenerateImage={handleGenerateSceneImage}
                                />
                            )}

                            {/* --- VIEW: VISUAL --- */}
                            {
                                activeView === 'visual' && (
                                    <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <VisualNovelView
                                            scenes={scenes}
                                            allCharacters={characters}
                                            onGenerateImage={handleGenerateSceneImage}
                                            onGenerateCharacterImage={handleGenerateCharacterImage}
                                        />
                                    </div>
                                )
                            }

                            {/* --- VIEW: COMIC CREATOR --- */}
                            {
                                activeView === 'comic' && (
                                    <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <ComicCreator
                                            storyPremise={storyPremise}
                                            scenes={scenes}
                                            characters={characters}
                                        />
                                    </div>
                                )
                            }

                        </div>
                    </div >

                    {/* Secondary View Panel (Split View) */}
                    {
                        secondaryView && (
                            <div className="w-1/2 flex flex-col border-l border-white/10 bg-brand-surface/50 backdrop-blur-xl animate-in slide-in-from-right duration-300 relative z-10">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                                        <LayoutDashboardIcon className="w-5 h-5 text-brand-secondary" />
                                        {secondaryView.type === 'character' ? 'Character Details' : 'Scene Editor'}
                                    </h3>
                                    <button onClick={() => setSecondaryView(null)} className="p-1.5 hover:bg-white/10 rounded-lg text-brand-text-muted hover:text-white transition">
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                                    {secondaryView.type === 'character' && (() => {
                                        const char = characters.find(c => c.id === secondaryView.id);
                                        if (!char) return <div className="text-brand-text-muted">Character not found.</div>;
                                        return (
                                            <CharacterCard
                                                character={char}
                                                isSelected={selectedCharacterIds.has(char.id)}
                                                onToggleSelect={() => handleToggleSelection(char.id, 'character')}
                                                onDelete={() => handleDeleteCharacterWrapper(char.id)}
                                                onUpdate={updateCharacter}
                                                onExport={() => { }}
                                                onGenerateImage={handleGenerateCharacterImage}
                                                onOpenVisuals={(c) => setActiveVisualCharacterId(c.id)}
                                            />
                                        );
                                    })()}

                                    {secondaryView.type === 'scene' && (() => {
                                        const scene = scenes.find(s => s.id === secondaryView.id);
                                        if (!scene) return <div className="text-brand-text-muted">Scene not found.</div>;
                                        return (
                                            <div className="space-y-6">
                                                <SceneCard
                                                    scene={scene}
                                                    isSelected={selectedSceneIds.has(scene.id)}
                                                    onToggleSelect={() => handleToggleSelection(scene.id, 'scene')}
                                                    onUpdate={updateScene}
                                                    onDelete={() => handleDeleteSceneWrapper(scene.id)}
                                                    onExport={() => { }}
                                                    allCharacters={characters}
                                                    isLoading={isLoading}
                                                    onGenerateDetails={handleGenerateSceneDetails}
                                                    onGenerateImage={handleGenerateSceneImage}
                                                    onOpenStoryboard={s => setActiveStoryboardSceneId(s.id)}
                                                    isFirst={false} isLast={false} layout="vertical"
                                                />
                                                <div className="glass-card p-4 rounded-xl border border-white/5">
                                                    <h4 className="font-bold text-brand-text mb-2">Quick Notes</h4>
                                                    <textarea className="w-full h-40 bg-brand-bg/50 border border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-brand-secondary outline-none resize-none" placeholder="Jot down ideas for this scene..." />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )
                    }
                </div >
            </main >

            {/* === RIGHT PANEL (Assistant) === */}
            {/* === RIGHT PANEL (Assistant) === */}
            <RightPanel
                isRightPanelOpen={isRightPanelOpen}
                setIsRightPanelOpen={setIsRightPanelOpen}
                onGenerate={handleGenerate}
                onGenerateWithContext={handleGenerateWithContext}
                onGenerateTimeline={handleGenerateTimeline}
                selectedCharacterIds={selectedCharacterIds}
                selectedSceneIds={selectedSceneIds}
                onBatchUpdateSelection={handleBatchUpdateSelection}
                filteredMaterials={filteredMaterials}
            />

        </div >
    );
}

export default App;
