import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Character, CharacterType, GeneratedContent, Scene, Tool, SavedMaterial, MaterialType, TimelineItem, RelationshipWebData, MapData, Location, Section, FilterSettings, StoryObject, OutlineItem, Book, ViewMode, StoryboardShot } from './types';
import * as geminiService from './services/geminiService';
import CharacterCard from './components/CharacterCard';
import { LayoutDashboardIcon, ChevronRightIcon, MaximizeIcon, MinimizeIcon } from './components/icons';
import SceneCard from './components/SceneCard';
import SprintTimer from './components/SprintTimer';
import WordCountTracker from './components/WordCountTracker';
import ImagePreviewModal from './components/ImagePreviewModal';
import SearchBar from './components/SearchBar';
import InteractiveBackground from './components/InteractiveBackground';
import OnboardingWalkthrough from './components/OnboardingWalkthrough';
import BookReader from './components/BookReader';
import VisualNovelView from './components/VisualNovelView';
import GlobalLoadingIndicator from './components/GlobalLoadingIndicator';
import { api } from './services/api';
import ComicCreator from './components/ComicCreator';
import VideoCreator from './components/VideoCreator';

// Imported Views and Modals
import Sidebar from './components/Sidebar';
import CharacterVisualModal from './components/CharacterVisualModal';
import OutputModal from './components/OutputModal';
import ThemeSettingsModal, { ThemeColor, THEMES } from './components/ThemeSettingsModal';
import StoryboardModal from './components/StoryboardModal';
import RightPanel from './components/RightPanel';

import StoryView from './components/views/StoryView';
import CharactersView from './components/views/CharactersView';
import MapView from './components/views/MapView';
import WorldView from './components/views/WorldView';
import TimelineView from './components/views/TimelineView';
import NotesView from './components/views/NotesView';
import ItemsView from './components/views/ItemsView';

import { useStory } from './contexts/StoryContext';
import { useStoryGenerators } from './hooks/useStoryGenerators';

function StoryEditor() {
    const { id } = useParams<{ id: string }>();
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
        loadProject, resetStory,
        notes, items
    } = useStory();

    // Load story data if ID is present
    useEffect(() => {
        resetStory(); // Clear previous state
        if (id) {
            // In a real app, useStory would probably handle fetching by ID, 
            // or we fetch here and populate context.
            // For now, let's assume context might be empty or we need to fetch.
            // But StoryContext currently holds ONE story.
            // We should probably fetch the story data and call loadProject-like function.
            // But loadProject takes a File. We need a loadData function.
            // Let's implement loadData in StoryContext later.
            // For now, we'll fetch and manually set state if possible, or just rely on the fact 
            // that we might have loaded it in Dashboard.
            // Actually, refreshing the page on /editor/:id needs to fetch.
            const fetchStory = async () => {
                setIsLoading(true);
                try {
                    const story = await api.get(`/stories/${id}`);
                    // We need to map this data to the context state
                    // The 'data' field in DB has the full export
                    if (story.data) {
                        // We need a way to bulk set state.
                        // loadProject does this but expects a file.
                        // Let's assume we can pass the object to a new loadStoryData function
                        // or just manually set everything here.
                        if (story.data.storyPremise) setStoryPremise(story.data.storyPremise);
                        if (story.data.characters) setCharacters(story.data.characters);
                        if (story.data.scenes) setScenes(story.data.scenes);
                        if (story.data.savedMaterials) setSavedMaterials(story.data.savedMaterials);
                        if (story.data.mapData) setMapData(story.data.mapData);
                    }
                } catch (e) {
                    console.error("Failed to load story", e);
                    setError("Failed to load story.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStory();
        }
    }, [id]);

    // Save story on change (auto-save)
    useEffect(() => {
        if (!id) return;

        const saveData = {
            storyPremise,
            characters,
            scenes,
            savedMaterials,
            mapData,
            notes,
            items
        };

        const timeout = setTimeout(async () => {
            try {
                await api.put(`/stories/${id}`, {
                    title: storyPremise.split('.')[0] || 'Untitled Story', // Update title dynamically? Maybe not always.
                    data: saveData
                });
            } catch (e) {
                console.error("Auto-save failed", e);
            }
        }, 2000); // Debounce 2s

        return () => clearTimeout(timeout);
    }, [id, storyPremise, characters, scenes, savedMaterials, mapData, notes, items]);


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
    const handleGenerateStoryboard = async (sceneId: string, options?: { stylize: number, aspectRatio: string, version: string }) => {
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
            const shots = await geminiService.generateStoryboardAnalysis(updatedScene, charactersInScene, options);
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
        if (!generatedImage || !generatedImage.source) return;
        if (generatedImage.source.type === 'scene') {
            updateScene(generatedImage.source.id, { headerImage: generatedImage.imageUrl });
        } else {
            updateCharacter(generatedImage.source.id, { headerImage: generatedImage.imageUrl });
        }
        setGeneratedImage(null);
    };

    const handleSaveImageToMaterials = (imageUrlOverride?: string) => {
        if (!generatedImage && !imageUrlOverride) return;
        const imgUrl = imageUrlOverride || generatedImage?.imageUrl;
        const title = generatedImage?.title || 'Saved Image';

        if (!imgUrl) return;

        setSavedMaterials(prev => [{
            id: `material_${Date.now()}`,
            type: 'IMAGE',
            title: `Image: ${title}`,
            content: imgUrl,
        }, ...prev]);
        setGeneratedImage(null); // Close modal
    };

    const handleViewImage = (material: SavedMaterial) => {
        if (material.type !== 'IMAGE') return;
        setGeneratedImage({
            imageUrl: material.content as string,
            title: material.title,
            // source is undefined for saved materials
        });
    };

    const handleSaveMaterial = (content: GeneratedContent) => {
        setSavedMaterials(prev => [{
            id: `material_${Date.now()}`,
            type: content.type,
            title: content.title,
            content: content.content,
        }, ...prev]);
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




    // State for Distraction Free Mode
    const [isDistractionFree, setIsDistractionFree] = useState(false);

    // Calculate current word count (simple approximation)
    // Find the currently active scene if in story view, or just sum all scenes?
    // Let's use the active scene if one is selected in StoryView context (which we don't fully track here yet easily)
    // For now, let's just sum all words in the project as a total goal
    const totalWordCount = useMemo(() => {
        return scenes.reduce((acc, scene) => acc + (scene.fullText?.split(/\s+/).length || 0), 0);
    }, [scenes]);

    // Derived states for layout
    const finalSidebarOpen = isDistractionFree ? false : isSidebarOpen;
    const finalRightPanelOpen = isDistractionFree ? false : isRightPanelOpen;


    const activeStoryboardScene = activeStoryboardSceneId ? scenes.find(s => s.id === activeStoryboardSceneId) : null;
    const activeVisualCharacter = activeVisualCharacterId ? characters.find(c => c.id === activeVisualCharacterId) : null;

    return (
        <div className="flex h-screen w-screen bg-brand-bg text-brand-text overflow-hidden font-sans transition-colors duration-300">

            {/* --- Left Sidebar (Navigation & Tools) --- */}
            <div className={`${finalSidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out border-r border-white/10 relative z-20 bg-brand-surface/95 backdrop-blur-md`}>
                <div className="w-64 h-full overflow-hidden">
                    <Sidebar
                        activeView={activeView}
                        setActiveView={setActiveView}
                        isSidebarOpen={finalSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        theme={theme}
                        setShowThemeSettings={setShowThemeSettings}
                        setShowOnboarding={setShowOnboarding}
                    />
                </div>
            </div>

            {activeVisualCharacter && (
                <CharacterVisualModal
                    character={activeVisualCharacter}
                    onSave={updateCharacter}
                    onClose={() => setActiveVisualCharacterId(null)}
                />
            )}

            {generatedContent && (
                <OutputModal
                    generatedContent={generatedContent}
                    onClose={() => setGeneratedContent(null)}
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                    error={error}
                    onGenerateTimeline={handleGenerateTimeline}
                    onUpdateScene={updateScene}
                    onSave={handleSaveMaterial}
                />
            )}

            {/* --- Main Content Area --- */}
            <main className="flex-grow flex flex-col relative transition-all duration-300">

                {/* Top Header / Toolbar (Enhanced for Distraction Free) */}
                <header className={`h-16 px-6 flex items-center justify-between border-b border-white/10 transition-all duration-300 ${isDistractionFree ? 'bg-transparent border-transparent hover:bg-brand-surface/30 hover:backdrop-blur-md hover:border-white/10' : 'bg-brand-surface/50 backdrop-blur-md'}`}>

                    <div className="flex items-center gap-4">
                        {/* Sidebar Toggle (Only show if not distraction free, OR if we want to allow opening it temporarily?) */}
                        {/* Let's hide it in distraction free to force focus, rely on the exit button */}
                        {!isDistractionFree && !isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 hover:bg-white/10 rounded-md text-brand-text-muted transition"
                                aria-label="Open Sidebar"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        )}

                        <h1 className={`text-lg font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-purple-400 ${isDistractionFree ? 'opacity-50 hover:opacity-100 transition-opacity' : ''}`}>
                            {storyPremise ? (storyPremise.split('.')[0].length > 40 ? storyPremise.split('.')[0].substring(0, 40) + '...' : storyPremise.split('.')[0]) : 'StoryWeaver'}
                        </h1>

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        {/* Writer Tools */}
                        <div className="flex items-center gap-3">
                            <SprintTimer />
                            <WordCountTracker currentCount={totalWordCount} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDistractionFree(!isDistractionFree)}
                            className={`p-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${isDistractionFree ? 'bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20 hover:scale-105' : 'text-brand-text-muted hover:text-white hover:bg-white/5'}`}
                            title={isDistractionFree ? "Exit Focus Mode" : "Enter Focus Mode"}
                        >
                            {isDistractionFree ? (
                                <>
                                    <MinimizeIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">Exit Focus</span>
                                </>
                            ) : (
                                <MaximizeIcon className="w-5 h-5" />
                            )}
                        </button>

                        {!isDistractionFree && (
                            <button
                                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                                className={`p-2 rounded-lg transition ${isRightPanelOpen ? 'text-brand-secondary bg-brand-secondary/10' : 'text-brand-text-muted hover:text-white hover:bg-white/5'}`}
                                aria-label="Toggle Right Panel"
                            >
                                <LayoutDashboardIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </header>

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
                        onSetHeader={generatedImage.source ? handleSetHeaderImage : undefined}
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

                <div className="flex flex-grow overflow-hidden relative">
                    {/* Primary Content Area */}
                    <div className={`flex-grow overflow-y-auto custom-scrollbar transition-all duration-300 ${isDistractionFree ? 'p-0' : 'p-6 lg:p-10'} ${secondaryView ? 'w-1/2 border-r border-white/10' : 'w-full'}`}>

                        <div className={`mx-auto h-full transition-all duration-500 ${isDistractionFree ? 'max-w-4xl py-12 px-12 bg-brand-surface/30 backdrop-blur-sm rounded-xl border border-white/5 shadow-2xl my-6' : 'max-w-6xl space-y-8 pb-24'}`}>

                            {/* Search Bar Global */}
                            {activeView !== 'book' && activeView !== 'visual' && activeView !== 'comic' && !isDistractionFree && (
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
                                    items={items}
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

                            {/* ... other views ... */}
                            {/* For brevity, I'm assuming the other views logic is valid and just wrapping the container */}
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
                            {activeView === 'map' && (
                                <div className="h-full">
                                    <MapView
                                        onGenerate={handleGenerate}
                                        isLoading={isLoading}
                                        mapData={mapData}
                                        selectedLocationIds={selectedLocationIds}
                                        onToggleSelectLocation={handleToggleSelection}
                                        onUpdateLocation={updateLocation}
                                        onExportData={handleExportData}
                                        onViewLocationScenes={handleViewLocationScenes}
                                    />
                                </div>
                            )}
                            {activeView === 'world' && (
                                <div className="h-full">
                                    <WorldView
                                        isLoading={isLoading}
                                        onAnalyzeVideo={handleAnalyzeVideo}
                                    />
                                </div>
                            )}
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
                            {activeView === 'visual' && (
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
                            {activeView === 'comic' && (
                                <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <ComicCreator
                                        storyPremise={storyPremise}
                                        scenes={scenes}
                                        characters={characters}
                                    />
                                </div>
                            )
                            }
                            {activeView === 'notes' && (
                                <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <NotesView />
                                </div>
                            )
                            }
                            {activeView === 'items' && (
                                <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <ItemsView />
                                </div>
                            )}
                            {activeView === 'video' && (
                                <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {secondaryView && !isDistractionFree && (
                                        <div className="w-1/2 flex flex-col border-l border-white/10 bg-brand-surface/50 backdrop-blur-xl animate-in slide-in-from-right duration-300 relative z-10">
                                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                                                    <LayoutDashboardIcon className="w-5 h-5 text-brand-secondary" />
                                                    {secondaryView.type === 'character' ? 'Character Details' : 'Scene Editor'}
                                                </h3>
                                                <button onClick={() => setSecondaryView(null)} aria-label="Close Split View" className="p-1.5 hover:bg-white/10 rounded-lg text-brand-text-muted hover:text-white transition">
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
                                                                allItems={items}
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* === RIGHT PANEL (Assistant) === */}
            <div className={`${finalRightPanelOpen ? 'w-80' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out border-l border-white/10 relative z-20 bg-brand-surface/90 backdrop-blur-md`}>
                <div className="w-80 h-full overflow-hidden">
                    <RightPanel
                        isRightPanelOpen={finalRightPanelOpen}
                        setIsRightPanelOpen={setIsRightPanelOpen}
                        onGenerate={handleGenerate}
                        onGenerateWithContext={handleGenerateWithContext}
                        onViewImage={handleViewImage}
                        onGenerateTimeline={handleGenerateTimeline}
                        selectedCharacterIds={selectedCharacterIds}
                        selectedSceneIds={selectedSceneIds}
                        onBatchUpdateSelection={handleBatchUpdateSelection}
                        filteredMaterials={filteredMaterials}
                        onSaveMaterial={handleSaveMaterial}
                    />
                </div>
            </div>

        </div >
    );
}

export default StoryEditor;
