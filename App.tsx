import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import JSZip from 'jszip';

import { Character, CharacterType, GeneratedContent, Scene, Tool, SavedMaterial, MaterialType, TimelineItem, RelationshipWebData, MapData, Location, Section, FilterSettings, StoryObject, OutlineItem, Book, ViewMode, StoryboardShot } from './types';
import * as geminiService from './services/geminiService';
import CharacterBuilder from './components/CharacterBuilder';
import CharacterCard from './components/CharacterCard';
import StoryInputs from './components/StoryInputs';
import OutputDisplay from './components/OutputDisplay';
import { WandSparklesIcon, BookOpenIcon, LightbulbIcon, NetworkIcon, UserPlusIcon, TrashIcon, ClipboardListIcon, VideoIcon, TimelineIcon, DownloadIcon, LinkIcon, ImportIcon, WriteIcon, ImageIcon, MapIcon, RefreshCwIcon, LayoutDashboardIcon, MessageSquareIcon, GemIcon, MountainIcon, ListOrderedIcon, SunIcon, MoonIcon, UsersIcon, InfoIcon, SearchIcon, TargetIcon, ChevronDownIcon, HelpCircleIcon, ChevronRightIcon, ChevronLeftIcon, SaveIcon, FilmIcon, PlusIcon, ZapIcon } from './components/icons';
import SceneCard from './components/SceneCard';
import WriterTools from './components/WriterTools';
import VideoUploader from './components/VideoUploader';
import Timeline from './components/Timeline';
import CharacterLegend from './components/CharacterLegend';
import GlobalGenerator from './components/GlobalGenerator';
import ImagePreviewModal from './components/ImagePreviewModal';
import MapDisplay from './components/MapDisplay';
import SearchBar from './components/SearchBar';
import InteractiveBackground from './components/InteractiveBackground';
import OnboardingWalkthrough from './components/OnboardingWalkthrough';
import BookReader from './components/BookReader';
import VisualNovelView from './components/VisualNovelView';
import StoryboardModal from './components/StoryboardModal';
import CharacterVisualModal from './components/CharacterVisualModal';
import ComicCreator from './components/ComicCreator';
import ThemeSettingsModal, { THEMES, ThemeColor } from './components/ThemeSettingsModal';

type GeneratedImageData = {
    imageUrl: string;
    source: {
        type: 'scene' | 'character';
        id: string;
    };
    title: string;
}

function App() {
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // New Sidebar State
    const [activeStoryboardSceneId, setActiveStoryboardSceneId] = useState<string | null>(null);

    const [activeVisualCharacterId, setActiveVisualCharacterId] = useState<string | null>(null);
    const [secondaryView, setSecondaryView] = useState<{ type: 'character' | 'scene', id: string } | null>(null);

    // Data State
    const [storyPremise, setStoryPremise] = useState<string>(() => localStorage.getItem('storyPremise') || '');
    const [storyTextToAnalyze, setStoryTextToAnalyze] = useState<string>(() => localStorage.getItem('storyTextToAnalyze') || '');
    const [characters, setCharacters] = useState<Character[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [savedMaterials, setSavedMaterials] = useState<SavedMaterial[]>([]);
    const [compiledBook, setCompiledBook] = useState<Book | null>(null);

    // Selection State
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<Set<string>>(new Set());
    const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
    const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
    const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string>>(new Set());

    // Generation State
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<GeneratedImageData | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSettings, setFilterSettings] = useState<FilterSettings>({
        characters: true,
        scenes: true,
        locations: true,
        materials: true,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const projectLoadRef = useRef<HTMLInputElement>(null);

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

    // Load initial data from localStorage if available (Backwards compatibility fallback)
    useEffect(() => {
        const savedData = localStorage.getItem('storyWeaver_project');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.storyPremise) setStoryPremise(data.storyPremise);
                if (data.storyTextToAnalyze) setStoryTextToAnalyze(data.storyTextToAnalyze);
                if (data.characters) setCharacters(data.characters);
                if (data.scenes) setScenes(data.scenes);
                if (data.mapData) setMapData(data.mapData);
                if (data.savedMaterials) setSavedMaterials(data.savedMaterials);
            } catch (e) {
                console.error("Failed to load saved project data from local storage", e);
            }
        }

        const hasSeenOnboarding = localStorage.getItem('storyWeaver_onboarding_complete');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('storyPremise', storyPremise);
    }, [storyPremise]);

    useEffect(() => {
        localStorage.setItem('storyTextToAnalyze', storyTextToAnalyze);
    }, [storyTextToAnalyze]);


    // --- Handlers ---

    const handleSaveProgress = async () => {
        setSaveStatus('saving');
        try {
            const zip = new JSZip();

            // 1. Project Info
            const projectInfo = {
                storyPremise,
                storyTextToAnalyze,
                timestamp: Date.now(),
                version: "1.0"
            };
            zip.file("project.json", JSON.stringify(projectInfo, null, 2));

            // 2. Characters Folder
            const charFolder = zip.folder("characters");
            characters.forEach(char => {
                const safeName = char.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                charFolder?.file(`${safeName}_${char.id}.json`, JSON.stringify(char, null, 2));
            });

            // 3. Scenes Folder
            const scenesFolder = zip.folder("scenes");
            scenes.forEach(scene => {
                const safeTitle = scene.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                scenesFolder?.file(`${safeTitle}_${scene.id}.json`, JSON.stringify(scene, null, 2));
            });

            // 4. Materials Folder
            const materialsFolder = zip.folder("materials");
            savedMaterials.forEach(mat => {
                const safeTitle = mat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                materialsFolder?.file(`${safeTitle}_${mat.id}.json`, JSON.stringify(mat, null, 2));
            });

            // 5. World Map
            if (mapData) {
                zip.file("world_map.json", JSON.stringify(mapData, null, 2));
            }

            // 6. Compiled Book
            if (compiledBook) {
                zip.file("compiled_book.json", JSON.stringify(compiledBook, null, 2));
            }

            // Generate Zip
            const blob = await zip.generateAsync({ type: "blob" });

            // Save locally for redundancy
            // Note: We can't easily save a zip to localStorage efficiently, so we'll just save the JSON rep there for session restore
            const sessionData = { storyPremise, storyTextToAnalyze, characters, scenes, mapData, savedMaterials };
            localStorage.setItem('storyWeaver_project', JSON.stringify(sessionData));

            // Trigger Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().slice(0, 10);
            const projectName = storyPremise.split(' ')[0] || 'Story';
            a.download = `${projectName}_Project_${dateStr}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSaveStatus('saved');
        } catch (err) {
            console.error("Error saving zip:", err);
            setError("Failed to create save file.");
            setSaveStatus('idle');
        }

        setTimeout(() => setSaveStatus('idle'), 3000);
    };

    const handleLoadProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setLoadingMessage("Loading project...");

        try {
            // Check if it's a ZIP or JSON
            if (file.name.endsWith('.json')) {
                // Legacy JSON support
                const text = await file.text();
                const data = JSON.parse(text);
                if (data.storyPremise) setStoryPremise(data.storyPremise);
                if (data.storyTextToAnalyze) setStoryTextToAnalyze(data.storyTextToAnalyze);
                if (data.characters) setCharacters(data.characters);
                if (data.scenes) setScenes(data.scenes);
                if (data.mapData) setMapData(data.mapData);
                if (data.savedMaterials) setSavedMaterials(data.savedMaterials);
            } else if (file.name.endsWith('.zip')) {
                // ZIP support
                const zip = new JSZip();
                const contents = await zip.loadAsync(file);

                // 1. Project Info
                if (contents.file("project.json")) {
                    const infoText = await contents.file("project.json")!.async("string");
                    const info = JSON.parse(infoText);
                    if (info.storyPremise) setStoryPremise(info.storyPremise);
                    if (info.storyTextToAnalyze) setStoryTextToAnalyze(info.storyTextToAnalyze);
                }

                // 2. Characters
                const charFolder = contents.folder("characters");
                const newCharacters: Character[] = [];
                if (charFolder) {
                    const charFiles = Object.keys(charFolder.files).filter(name => !charFolder.files[name].dir);
                    for (const filename of charFiles) {
                        const text = await charFolder.file(filename)!.async("string");
                        newCharacters.push(JSON.parse(text));
                    }
                }
                setCharacters(newCharacters);

                // 3. Scenes
                const sceneFolder = contents.folder("scenes");
                const newScenes: Scene[] = [];
                if (sceneFolder) {
                    const sceneFiles = Object.keys(sceneFolder.files).filter(name => !sceneFolder.files[name].dir);
                    for (const filename of sceneFiles) {
                        const text = await sceneFolder.file(filename)!.async("string");
                        newScenes.push(JSON.parse(text));
                    }
                }
                // Sort scenes by ID timestamp if possible, otherwise preserve order vaguely
                newScenes.sort((a, b) => (a.id > b.id) ? 1 : -1);
                setScenes(newScenes);

                // 4. Materials
                const matFolder = contents.folder("materials");
                const newMaterials: SavedMaterial[] = [];
                if (matFolder) {
                    const matFiles = Object.keys(matFolder.files).filter(name => !matFolder.files[name].dir);
                    for (const filename of matFiles) {
                        const text = await matFolder.file(filename)!.async("string");
                        newMaterials.push(JSON.parse(text));
                    }
                }
                setSavedMaterials(newMaterials);

                // 5. Map
                if (contents.file("world_map.json")) {
                    const mapText = await contents.file("world_map.json")!.async("string");
                    setMapData(JSON.parse(mapText));
                }

                // 6. Book
                if (contents.file("compiled_book.json")) {
                    const bookText = await contents.file("compiled_book.json")!.async("string");
                    setCompiledBook(JSON.parse(bookText));
                }
            } else {
                throw new Error("Unsupported file type");
            }

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);

        } catch (err) {
            console.error("Failed to load project file", err);
            setError("Failed to load project file. Invalid format.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            if (projectLoadRef.current) projectLoadRef.current.value = '';
        }
    };

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
        setIsRightPanelOpen(true); // Auto open panel on generation
    }

    const handleCreateCharacter = useCallback(async (name: string, type: CharacterType, initialInfo: string, traits: string, backstory: string, imageUrl?: string) => {
        setIsLoading(true);
        setLoadingMessage('Creating character profile...');
        clearOutput();
        try {
            const newCharacterProfile = await geminiService.generateCharacterProfile(name, type, initialInfo, traits, backstory);
            const newCharacter: Character = {
                id: `char_${Date.now()}`,
                name,
                type,
                initialInfo,
                traits,
                headerImage: imageUrl,
                ...newCharacterProfile
            };
            setCharacters(prev => [...prev, newCharacter]);

            const generatedProfileContent: GeneratedContent = {
                title: `Character Profile: ${name}`,
                content: `**Traits:** ${traits}\n\n**History:**\n${newCharacterProfile.history}\n\n**Character Arc:**\n${newCharacterProfile.arc}`,
                type: 'CHARACTER_PROFILE',
                sourceId: newCharacter.id
            };
            setGeneratedContent(generatedProfileContent);
            setSavedMaterials(prev => [{
                id: `material_${Date.now()}`,
                type: 'CHARACTER_PROFILE',
                title: generatedProfileContent.title,
                content: generatedProfileContent.content
            }, ...prev]);

        } catch (e) {
            console.error(e);
            setError('Failed to generate character profile. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleAnalyzeStory = useCallback(async () => {
        if (!storyTextToAnalyze.trim()) {
            setError("Please paste some story text to analyze.");
            return;
        }
        setIsLoading(true);
        clearOutput();
        setCharacters([]);
        setScenes([]);

        try {
            setLoadingMessage('Analyzing: Sending story to AI...');
            const analysis = await geminiService.analyzeStoryText(storyPremise, storyTextToAnalyze);

            setLoadingMessage('Analyzing: Processing results...');

            // 1. Create Characters first to get IDs
            const newCharacters: Character[] = [];
            const characterNameMap: Record<string, string> = {};

            for (let i = 0; i < analysis.characters.length; i++) {
                const charInfo = analysis.characters[i];
                const charId = `char_${Date.now()}_${i}`;
                characterNameMap[charInfo.name] = charId;

                newCharacters.push({
                    id: charId,
                    name: charInfo.name,
                    type: charInfo.type,
                    initialInfo: charInfo.description,
                    traits: charInfo.traits,
                    history: charInfo.history || charInfo.description, // Use generated history or fallback to description
                    arc: charInfo.arc || 'Not yet defined.' // Use generated arc or placeholder
                });
            }
            setCharacters(newCharacters);

            // 2. Create Scenes and link characters
            const newScenes = analysis.scenes.map((s, i) => {
                const presentIds: string[] = [];
                if (s.characters_present && Array.isArray(s.characters_present)) {
                    s.characters_present.forEach(name => {
                        if (characterNameMap[name]) {
                            presentIds.push(characterNameMap[name]);
                        } else {
                            const foundKey = Object.keys(characterNameMap).find(key => key.includes(name) || name.includes(key));
                            if (foundKey) presentIds.push(characterNameMap[foundKey]);
                        }
                    });
                }

                return {
                    id: `scene_${Date.now()}_${i}`,
                    title: s.title,
                    summary: s.summary,
                    fullText: s.fullText,
                    characterIds: [...new Set(presentIds)],
                    isTransition: false
                };
            });
            setScenes(newScenes);

            const analysisSummary: GeneratedContent = {
                title: "Analysis Complete",
                content: `Identified ${analysis.characters.length} characters and ${analysis.scenes.length} scenes. Characters have been automatically linked to scenes where they appear.`,
                type: 'ANALYSIS_SUMMARY'
            };
            setGeneratedContent(analysisSummary);
            setSavedMaterials(prev => [{
                id: `material_${Date.now()}`,
                type: 'ANALYSIS_SUMMARY',
                title: analysisSummary.title,
                content: analysisSummary.content,
            }, ...prev]);

        } catch (e) {
            console.error(e);
            setError('Failed to analyze the story. The structure might be complex or an API error occurred.');
            setGeneratedContent(null);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [storyPremise, storyTextToAnalyze]);


    const handleGenerate = async (tool: Tool, overrideSelections?: { characterIds?: Set<string>, sceneIds?: Set<string> }) => {
        const activeCharacterIds = overrideSelections?.characterIds || selectedCharacterIds;
        const activeSceneIds = overrideSelections?.sceneIds || selectedSceneIds;

        const selectedCharacters = characters.filter(c => activeCharacterIds.has(c.id));
        const selectedScenes = scenes.filter(s => activeSceneIds.has(s.id));
        const selectedMaterials = savedMaterials.filter(m => selectedMaterialIds.has(m.id));
        clearOutput();

        if (tool === Tool.RELATIONSHIP_WEB && selectedCharacters.length < 2) {
            setError("Please select at least two characters."); return;
        }
        if (tool === Tool.TRANSITION && selectedScenes.length !== 2) {
            setError("Please select exactly two scenes."); return;
        }
        if (tool === Tool.DIALOGUE_GENERATOR && selectedCharacters.length !== 2) {
            setError("Please select exactly two characters."); return;
        }
        if ((tool === Tool.OBJECT_GENERATOR || tool === Tool.OUTLINE_GENERATOR) && !storyPremise.trim()) {
            setError("Please provide a story premise."); return;
        }
        if (tool === Tool.MIDJOURNEY_PROMPTS && selectedScenes.length !== 1) {
            setError("Please select exactly one scene for prompt generation."); return;
        }
        if (tool === Tool.SETTING_GENERATOR && selectedScenes.length !== 1 && overrideSelections) {
            // If triggered via modal (overrideSelections present) but count is wrong
            setError("Please select exactly one scene for setting description."); return;
        }

        setIsLoading(true);

        try {
            let result: GeneratedContent | null = null;
            const existingStory = scenes.map(s => s.fullText).join('\n\n');

            switch (tool) {
                case Tool.CHAPTER:
                    setLoadingMessage('Weaving the next chapter...');
                    const chapterText = await geminiService.generateNextChapter(storyPremise, existingStory, selectedCharacters, selectedScenes);
                    result = { title: "Generated Chapter", content: chapterText, type: Tool.CHAPTER };
                    break;
                case Tool.RELATIONSHIP_WEB:
                    setLoadingMessage('Mapping character relationships...');
                    const webData = await geminiService.generateRelationshipWeb(selectedCharacters);
                    result = { title: "Character Relationship Web", content: webData, type: 'RELATIONSHIP_WEB_VISUAL' };
                    break;
                case Tool.PLOT_IDEAS:
                    setLoadingMessage('Brainstorming plot ideas...');
                    const ideasText = await geminiService.generatePlotIdeas(storyPremise, existingStory, selectedCharacters);
                    result = { title: "Plot Ideas & Twists", content: ideasText, type: Tool.PLOT_IDEAS };
                    break;
                case Tool.TRANSITION: {
                    setLoadingMessage('Crafting a transition...');
                    const transitionText = await geminiService.generateSceneTransition(selectedScenes);
                    result = { title: "Scene Transition", content: transitionText, type: Tool.TRANSITION };

                    const selectedIndicesInTimeline: number[] = [];
                    scenes.forEach((scene, index) => {
                        if (activeSceneIds.has(scene.id)) selectedIndicesInTimeline.push(index);
                    });
                    const firstSelectedIndex = Math.min(...selectedIndicesInTimeline);
                    const newTransitionScene: Scene = {
                        id: `transition_${Date.now()}`,
                        title: "Transition",
                        summary: transitionText,
                        fullText: transitionText,
                        characterIds: [],
                        isTransition: true,
                    };
                    const newScenes = [...scenes];
                    newScenes.splice(firstSelectedIndex + 1, 0, newTransitionScene);
                    setScenes(newScenes);
                    break;
                }
                case Tool.MAP_GENERATOR:
                    setLoadingMessage('Generating world map...');
                    const allContent = `Premise: ${storyPremise}\n\nScenes:\n${scenes.map(s => `Title: ${s.title}\nSummary: ${s.summary}`).join('\n---\n')}\n\nCharacters:\n${characters.map(c => `Name: ${c.name}\nHistory: ${c.history}`).join('\n---\n')}`;
                    const generatedMapData = await geminiService.generateMapData(allContent);
                    setMapData(generatedMapData);
                    result = { title: "World Map Generated", content: `Successfully generated a map with ${generatedMapData.locations.length} locations.`, type: 'MAP_DATA' };
                    break;
                case Tool.REASSESS_FLOW:
                    setLoadingMessage('Reassessing narrative flow...');
                    const analysis = await geminiService.reassessNarrativeFlow(storyPremise, scenes);
                    result = { title: "Narrative Flow Analysis", content: analysis, type: Tool.REASSESS_FLOW };
                    break;
                case Tool.DIALOGUE_GENERATOR: {
                    setLoadingMessage('Generating dialogue...');
                    const dialogue = await geminiService.generateDialogue(selectedCharacters[0], selectedCharacters[1]);
                    result = { title: `Dialogue: ${selectedCharacters[0].name} & ${selectedCharacters[1].name}`, content: dialogue, type: Tool.DIALOGUE_GENERATOR };
                    break;
                }
                case Tool.OBJECT_GENERATOR: {
                    setLoadingMessage('Inventing an object...');
                    const objectData = await geminiService.generateObject(storyPremise);
                    result = { title: `Invented Object: ${objectData.name}`, content: objectData, type: 'OBJECT_DATA' };
                    break;
                }
                case Tool.SETTING_GENERATOR: {
                    setLoadingMessage('Describing a setting...');
                    // If a scene is selected, use it for context
                    const sceneContext = selectedScenes.length === 1 ? { title: selectedScenes[0].title, summary: selectedScenes[0].summary } : undefined;
                    const settingText = await geminiService.generateSetting(storyPremise, sceneContext);
                    result = {
                        title: sceneContext ? `Setting: ${sceneContext.title}` : "Generated Setting",
                        content: settingText,
                        type: Tool.SETTING_GENERATOR,
                        sourceId: selectedScenes.length === 1 ? selectedScenes[0].id : undefined
                    };
                    break;
                }
                case Tool.OUTLINE_GENERATOR: {
                    setLoadingMessage('Generating story outline...');
                    const plotIdeasMaterial = selectedMaterials.find(m => m.type === Tool.PLOT_IDEAS);
                    const plotIdeasText = plotIdeasMaterial ? String(plotIdeasMaterial.content) : undefined;
                    const outline = await geminiService.generateOutline(storyPremise, selectedCharacters, plotIdeasText);
                    result = { title: "Generated Story Outline", content: outline, type: Tool.OUTLINE_GENERATOR };
                    break;
                }
                case Tool.MIDJOURNEY_PROMPTS: {
                    setLoadingMessage('Crafting Midjourney shot list...');
                    const promptsText = await geminiService.generateMidjourneyPrompts(selectedScenes[0], selectedCharacters);
                    result = { title: `Midjourney Prompts: ${selectedScenes[0].title}`, content: promptsText, type: Tool.MIDJOURNEY_PROMPTS };
                    break;
                }
            }

            if (result) {
                setGeneratedContent(result);
                setSavedMaterials(prev => [{
                    id: `material_${Date.now()}`,
                    type: result!.type,
                    title: result!.title,
                    content: result!.content
                }, ...prev]);
            }

        } catch (e) {
            console.error(e);
            setError(`Failed to perform action: ${tool}. Please try again.`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleGenerateWithContext = useCallback(async (prompt: string, contextSource: 'all' | 'selection') => {
        if (!prompt.trim()) { setError("Please enter a prompt."); return; }
        setIsLoading(true);
        setLoadingMessage(`Generating with ${contextSource} context...`);
        clearOutput();

        try {
            let contextString = `STORY PREMISE:\n${storyPremise || 'Not set.'}\n\n`;

            if (contextSource === 'all') {
                characters.forEach(c => { contextString += `Name: ${c.name} (${c.type})\nTraits: ${c.traits}\n---\n`; });
                scenes.forEach(s => { contextString += `Title: ${s.title}\nSummary: ${s.summary}\n---\n`; });
                if (mapData) mapData.locations.forEach(l => { contextString += `Name: ${l.name}\nDescription: ${l.description}\n---\n`; });
            } else {
                const selectedCharacters = characters.filter(c => selectedCharacterIds.has(c.id));
                const selectedScenes = scenes.filter(s => selectedSceneIds.has(s.id));
                if (selectedCharacters.length > 0) selectedCharacters.forEach(c => { contextString += `Name: ${c.name}\nTraits: ${c.traits}\n---\n`; });
                if (selectedScenes.length > 0) selectedScenes.forEach(s => { contextString += `Title: ${s.title}\nSummary: ${s.summary}\n---\n`; });
            }

            const generatedText = await geminiService.generateWithContext(prompt, contextString);
            const result: GeneratedContent = {
                title: `Generated from: "${prompt}"`,
                content: generatedText,
                type: Tool.CHAPTER
            };
            setGeneratedContent(result);
            setSavedMaterials(prev => [{
                id: `material_${Date.now()}`,
                type: result.type,
                title: result.title,
                content: result.content
            }, ...prev]);

        } catch (e) {
            console.error(e);
            setError('Failed to generate content with context.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [storyPremise, characters, scenes, savedMaterials, mapData, selectedCharacterIds, selectedSceneIds]);

    const handleGenerateSceneImage = useCallback(async (scene: Scene) => {
        setIsLoading(true);
        setLoadingMessage(`Generating image for "${scene.title}"...`);
        clearOutput();
        try {
            const charactersInScene = characters.filter(c => scene.characterIds?.includes(c.id));
            const base64Image = await geminiService.generateImageForScene(scene, charactersInScene);
            setGeneratedImage({
                imageUrl: `data:image/png;base64,${base64Image}`,
                source: { type: 'scene', id: scene.id },
                title: scene.title
            });
        } catch (e) {
            console.error(e);
            setError('Failed to generate image.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [characters]);

    const handleGenerateCharacterImage = useCallback(async (character: Character) => {
        setIsLoading(true);
        setLoadingMessage(`Generating image for "${character.name}"...`);
        clearOutput();
        try {
            const base64Image = await geminiService.generateCharacterImage(character);
            setGeneratedImage({
                imageUrl: `data:image/png;base64,${base64Image}`,
                source: { type: 'character', id: character.id },
                title: character.name
            });
        } catch (e) {
            console.error(e);
            setError('Failed to generate image.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleAnalyzeVideo = useCallback(async (videoFile: File | null, videoUrl: string, prompt: string) => {
        setIsLoading(true);
        setLoadingMessage('Analyzing video for inspiration...');
        clearOutput();
        try {
            const analysisText = await geminiService.analyzeVideo(videoFile, videoUrl, prompt);
            const result: GeneratedContent = { title: "Video Analysis", content: analysisText, type: 'VIDEO_ANALYSIS' };
            setGeneratedContent(result);
            setSavedMaterials(prev => [{
                id: `material_${Date.now()}`,
                type: 'VIDEO_ANALYSIS',
                title: result.title,
                content: result.content
            }, ...prev]);
        } catch (e) {
            console.error(e);
            setError('Failed to analyze video.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleGenerateTimeline = useCallback(async (plotIdeas: string) => {
        setIsLoading(true);
        setLoadingMessage('Generating story timeline...');
        setError(null);
        try {
            const timelineItems = await geminiService.generateTimeline(plotIdeas);
            const newScenesFromTimeline: Scene[] = timelineItems.map((item, index) => ({
                id: `scene_timeline_${Date.now()}_${index}`,
                title: item.title,
                summary: item.summary,
                fullText: `Plot Point: ${item.title}\n\n${item.summary}`,
                characterIds: [],
            }));
            setScenes(prev => [...prev, ...newScenesFromTimeline]);
            setGeneratedContent({
                title: "Timeline Generated",
                content: `Successfully generated ${timelineItems.length} timeline points.`,
                type: 'TIMELINE'
            });
        } catch (e) {
            console.error(e);
            setError('Failed to generate timeline.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleGenerateSceneDetails = useCallback(async (sceneId: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene || !scene.characterIds || scene.characterIds.length === 0) {
            setError("This scene needs characters assigned to it before it can be written."); return;
        }
        setIsLoading(true);
        setLoadingMessage(`Writing scene: "${scene.title}"...`);
        clearOutput();

        try {
            const charactersInScene = characters.filter(c => scene.characterIds!.includes(c.id));
            const sceneIndex = scenes.findIndex(s => s.id === sceneId);
            const previousScenes = scenes.slice(0, sceneIndex);
            const previousScenesText = previousScenes.map(s => `Title: ${s.title}\nSummary: ${s.summary}`).join('\n\n');

            const generatedText = await geminiService.generateSceneDetails(storyPremise, previousScenesText, scene, charactersInScene);
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, fullText: generatedText } : s));

            const result: GeneratedContent = { title: `Generated Scene: ${scene.title}`, content: generatedText, type: Tool.SCENE_WRITER };
            setGeneratedContent(result);
            setSavedMaterials(prev => [{
                id: `material_${Date.now()}`,
                type: result.type,
                title: result.title,
                content: result.content
            }, ...prev]);
        } catch (e) {
            console.error(e);
            setError(`Failed to generate scene details.`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [scenes, characters, storyPremise]);

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
            const shots = await geminiService.generateStoryboardShots(updatedScene);
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

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("text/plain", index.toString());
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const sourceIndexStr = e.dataTransfer.getData("text/plain");
        if (!sourceIndexStr) return;

        const sourceIndex = parseInt(sourceIndexStr, 10);
        if (sourceIndex === targetIndex) return;

        const newScenes = [...scenes];
        const [movedScene] = newScenes.splice(sourceIndex, 1);
        newScenes.splice(targetIndex, 0, movedScene);

        setScenes(newScenes);
    };

    const handleGenerateSketch = async (sceneId: string, shotId: string, description: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;

        try {
            const base64Sketch = await geminiService.generateStoryboardSketch(description);

            setScenes(prev => prev.map(s => {
                if (s.id !== sceneId) return s;
                const newStoryboard = s.storyboard?.map(shot =>
                    shot.id === shotId ? { ...shot, sketchImage: base64Sketch } : shot
                );
                return { ...s, storyboard: newStoryboard };
            }));
        } catch (e) {
            console.error("Sketch failed", e);
        }
    };

    const handleUpdateShot = (sceneId: string, shotId: string, updates: Partial<StoryboardShot>) => {
        setScenes(prev => prev.map(s => {
            if (s.id !== sceneId) return s;
            const newStoryboard = s.storyboard?.map(shot =>
                shot.id === shotId ? { ...shot, ...updates } : shot
            );
            return { ...s, storyboard: newStoryboard };
        }));
    };

    // Data Update Helpers
    const handleSetHeaderImage = () => {
        if (!generatedImage) return;
        if (generatedImage.source.type === 'scene') {
            setScenes(prev => prev.map(s => s.id === generatedImage.source.id ? { ...s, headerImage: generatedImage.imageUrl } : s));
        } else {
            setCharacters(prev => prev.map(c => c.id === generatedImage.source.id ? { ...c, headerImage: generatedImage.imageUrl } : c));
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

    const handleDeleteCharacter = (id: string) => {
        setCharacters(prev => prev.filter(c => c.id !== id));
        setSelectedCharacterIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    };

    const handleUpdateCharacter = (id: string, updates: Partial<Character>) => {
        setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const handleAddScene = () => {
        setScenes(prev => [...prev, {
            id: `scene_manual_${Date.now()}`,
            title: 'New Scene',
            summary: 'A brief summary...',
            fullText: 'The full text...',
            characterIds: [],
        }]);
    };

    const handleDeleteScene = (id: string) => {
        setScenes(prev => prev.filter(s => s.id !== id));
        setSelectedSceneIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    };

    const handleUpdateScene = (id: string, updates: Partial<Scene>) => {
        setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleReorderScenes = (newScenes: Scene[]) => setScenes(newScenes);

    const handleViewSavedMaterial = (m: SavedMaterial) => {
        clearOutput();
        setGeneratedContent({ title: m.title, content: m.content, type: m.type });
    };

    const handleDeleteSavedMaterial = (id: string) => setSavedMaterials(prev => prev.filter(m => m.id !== id));

    const handleUpdateLocation = (id: string, updates: Partial<Location>) => {
        if (mapData) setMapData({ ...mapData, locations: mapData.locations.map(l => l.id === id ? { ...l, ...updates } : l) });
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


    const getMaterialIcon = (type: MaterialType) => {
        const props = { className: "w-4 h-4 text-brand-text-muted" };
        switch (type) {
            case Tool.CHAPTER: return <BookOpenIcon {...props} />;
            case 'CHARACTER_PROFILE': return <UserPlusIcon {...props} />;
            case 'TIMELINE': return <TimelineIcon {...props} />;
            case Tool.SCENE_WRITER: return <WriteIcon {...props} />;
            case 'IMAGE': return <ImageIcon {...props} />;
            default: return <ClipboardListIcon {...props} />;
        }
    }

    const activeStoryboardScene = activeStoryboardSceneId ? scenes.find(s => s.id === activeStoryboardSceneId) : null;
    const activeVisualCharacter = activeVisualCharacterId ? characters.find(c => c.id === activeVisualCharacterId) : null;

    return (
        <div className="flex h-screen w-screen bg-brand-bg text-brand-text overflow-hidden font-sans transition-colors duration-300">

            {/* --- Left Sidebar (Navigation & Tools) --- */}
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
                            onClick={handleSaveProgress}
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

            {activeVisualCharacter && (
                <CharacterVisualModal
                    character={activeVisualCharacter}
                    onSave={handleUpdateCharacter}
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
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                                            <StoryInputs storyPremise={storyPremise} setStoryPremise={setStoryPremise} storyTextToAnalyze={storyTextToAnalyze} setStoryTextToAnalyze={setStoryTextToAnalyze} onAnalyze={handleAnalyzeStory} isLoading={isLoading} />
                                        </div>
                                        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center space-y-4">
                                            <h3 className="text-xl font-serif font-bold text-brand-text">Story Statistics</h3>
                                            <div className="flex gap-6">
                                                <div className="text-center">
                                                    <p className="text-3xl font-bold text-brand-secondary">{characters.length}</p>
                                                    <p className="text-xs text-brand-text-muted uppercase tracking-wider">Characters</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-3xl font-bold text-brand-accent">{scenes.length}</p>
                                                    <p className="text-xs text-brand-text-muted uppercase tracking-wider">Scenes</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-3xl font-bold text-emerald-400">{savedMaterials.length}</p>
                                                    <p className="text-xs text-brand-text-muted uppercase tracking-wider">Saved Items</p>
                                                </div>
                                            </div>
                                            {scenes.length > 0 && (
                                                <button
                                                    onClick={handleCompileBook}
                                                    className="mt-4 flex items-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition shadow-lg transform hover:scale-105"
                                                >
                                                    <BookOpenIcon className="w-5 h-5" />
                                                    Read Story
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <h2 className="text-2xl font-serif font-bold text-brand-text">Scene List</h2>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleGenerate(Tool.REASSESS_FLOW)} disabled={isLoading || scenes.length < 2} className="flex items-center gap-2 text-xs bg-brand-primary/50 hover:bg-brand-primary text-white px-3 py-1.5 rounded-full transition border border-white/10">
                                                    <RefreshCwIcon className="w-3 h-3" /> Reassess Flow
                                                </button>
                                                <input type="file" ref={fileInputRef} onChange={(e) => { }} accept=".json" className="hidden" />
                                                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs bg-brand-primary/50 hover:bg-brand-primary text-white px-3 py-1.5 rounded-full transition border border-white/10">
                                                    <ImportIcon className="w-3 h-3" /> Import
                                                </button>
                                            </div>
                                        </div>
                                        {/* Story View Scene Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredScenes.map((scene, index) => (
                                                <SceneCard key={scene.id} scene={scene} isSelected={selectedSceneIds.has(scene.id)} onToggleSelect={() => handleToggleSelection(scene.id, 'scene')} onUpdate={handleUpdateScene} onDelete={() => handleDeleteScene(scene.id)} onExport={() => { }} allCharacters={characters} isLoading={isLoading} onGenerateDetails={handleGenerateSceneDetails} onGenerateImage={handleGenerateSceneImage} onOpenStoryboard={s => setActiveStoryboardSceneId(s.id)} isFirst={index === 0} isLast={index === scenes.length - 1} layout="vertical" onMove={(dir) => {
                                                    if (dir === 'up' && index > 0) {
                                                        const newScenes = [...scenes];
                                                        [newScenes[index], newScenes[index - 1]] = [newScenes[index - 1], newScenes[index]];
                                                        handleReorderScenes(newScenes);
                                                    } else if (dir === 'down' && index < scenes.length - 1) {
                                                        const newScenes = [...scenes];
                                                        [newScenes[index], newScenes[index + 1]] = [newScenes[index + 1], newScenes[index]];
                                                        handleReorderScenes(newScenes);
                                                    }
                                                }} onOpenSplitView={() => setSecondaryView({ type: 'scene', id: scene.id })} />
                                            ))}
                                            <button onClick={handleAddScene} className="h-full min-h-[200px] border-2 border-dashed border-white/10 rounded-xl text-brand-text-muted hover:text-white hover:border-brand-secondary/50 hover:bg-brand-secondary/5 transition flex flex-col justify-center items-center gap-3 group">
                                                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition"><PlusIcon className="w-6 h-6" /></div>
                                                <span className="font-medium">Add New Scene</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- VIEW: CHARACTERS --- */}
                            {activeView === 'characters' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                        <div className="xl:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
                                            <h2 className="text-xl font-serif font-bold mb-4">Character Builder</h2>
                                            <CharacterBuilder onCreateCharacter={handleCreateCharacter} isLoading={isLoading} />
                                        </div>
                                        <div className="xl:col-span-1 glass-card p-6 rounded-2xl border border-white/5">
                                            <h2 className="text-xl font-serif font-bold mb-4">Archetypes</h2>
                                            <CharacterLegend />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-serif font-bold mb-4">Cast of Characters</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredCharacters.map(char => (
                                                <CharacterCard key={char.id} character={char} isSelected={selectedCharacterIds.has(char.id)} onToggleSelect={() => handleToggleSelection(char.id, 'character')} onDelete={() => handleDeleteCharacter(char.id)} onUpdate={handleUpdateCharacter} onExport={() => { }} onGenerateImage={handleGenerateCharacterImage} onOpenVisuals={(c) => setActiveVisualCharacterId(c.id)} onOpenSplitView={() => setSecondaryView({ type: 'character', id: char.id })} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- VIEW: WORLD --- */}
                            {activeView === 'world' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-2xl font-serif font-bold">World Map</h2>
                                            <button onClick={() => handleGenerate(Tool.MAP_GENERATOR)} disabled={isLoading} className="flex items-center gap-2 bg-brand-secondary text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20">
                                                <MapIcon className="w-4 h-4" /> Generate Map
                                            </button>
                                        </div>
                                        {mapData ? <MapDisplay mapData={mapData} selectedLocationIds={selectedLocationIds} onToggleSelectLocation={(id) => handleToggleSelection(id, 'location')} onUpdateLocation={handleUpdateLocation} onExport={() => handleExportData('json')} onViewScenes={handleViewLocationScenes} /> : <div className="h-64 flex items-center justify-center text-brand-text-muted italic">No map generated yet. Use the tool to create one based on your story.</div>}
                                    </div>

                                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                                        <h2 className="text-xl font-serif font-bold mb-4">Visual Inspiration</h2>
                                        <VideoUploader onAnalyze={handleAnalyzeVideo} isLoading={isLoading} />
                                    </div>
                                </div>
                            )}

                            {/* --- VIEW: TIMELINE --- */}
                            {activeView === 'timeline' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-serif font-bold">Story Timeline</h2>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleGenerate(Tool.PLOT_IDEAS)} className="flex items-center gap-2 text-xs bg-brand-primary/50 hover:bg-brand-primary text-white px-3 py-2 rounded-lg transition">
                                                    <LightbulbIcon className="w-3 h-3" /> Brainstorm Plots
                                                </button>
                                            </div>
                                        </div>
                                        {scenes.length > 0 ? (
                                            <Timeline scenes={scenes} allCharacters={characters} selectedSceneIds={selectedSceneIds} onToggleSelect={(id) => handleToggleSelection(id, 'scene')} onUpdateScene={handleUpdateScene} onDeleteScene={handleDeleteScene} onAddScene={handleAddScene} onReorderScenes={handleReorderScenes} onExportScene={() => { }} isLoading={isLoading} onGenerateDetails={handleGenerateSceneDetails} onGenerateImage={handleGenerateSceneImage} onMoveScene={(id, dir) => { }} />
                                        ) : (
                                            <div className="text-center py-20 text-brand-text-muted">
                                                <TimelineIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>Add scenes to visualize your timeline.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- VIEW: CHARACTERS --- */}
                            {
                                activeView === 'characters' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                            <div className="xl:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
                                                <h2 className="text-xl font-serif font-bold mb-4">Character Builder</h2>
                                                <CharacterBuilder onCreateCharacter={handleCreateCharacter} isLoading={isLoading} />
                                            </div>
                                            <div className="xl:col-span-1 glass-card p-6 rounded-2xl border border-white/5">
                                                <h2 className="text-xl font-serif font-bold mb-4">Archetypes</h2>
                                                <CharacterLegend />
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-serif font-bold mb-4">Cast of Characters</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {filteredCharacters.length > 0 ? (
                                                    filteredCharacters.map(char => (
                                                        <CharacterCard key={char.id} character={char} isSelected={selectedCharacterIds.has(char.id)} onToggleSelect={() => handleToggleSelection(char.id, 'character')} onDelete={() => handleDeleteCharacter(char.id)} onUpdate={handleUpdateCharacter} onExport={() => { }} onGenerateImage={handleGenerateCharacterImage} onOpenVisuals={(c) => setActiveVisualCharacterId(c.id)} />
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
                                )
                            }

                            {/* --- VIEW: WORLD --- */}
                            {
                                activeView === 'world' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-2xl font-serif font-bold">World Map</h2>
                                                <button onClick={() => handleGenerate(Tool.MAP_GENERATOR)} disabled={isLoading} className="flex items-center gap-2 bg-brand-secondary text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20">
                                                    <MapIcon className="w-4 h-4" /> Generate Map
                                                </button>
                                            </div>
                                            {mapData ? <MapDisplay mapData={mapData} selectedLocationIds={selectedLocationIds} onToggleSelectLocation={(id) => handleToggleSelection(id, 'location')} onUpdateLocation={handleUpdateLocation} onExport={() => handleExportData('json')} onViewScenes={handleViewLocationScenes} /> : <div className="h-64 flex items-center justify-center text-brand-text-muted italic">No map generated yet. Use the tool to create one based on your story.</div>}
                                        </div>

                                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                                            <h2 className="text-xl font-serif font-bold mb-4">Visual Inspiration</h2>
                                            <VideoUploader onAnalyze={handleAnalyzeVideo} isLoading={isLoading} />
                                        </div>
                                    </div>
                                )
                            }

                            {/* --- VIEW: TIMELINE --- */}
                            {
                                activeView === 'timeline' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-serif font-bold">Story Timeline</h2>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleGenerate(Tool.PLOT_IDEAS)} className="flex items-center gap-2 text-xs bg-brand-primary/50 hover:bg-brand-primary text-white px-3 py-2 rounded-lg transition">
                                                        <LightbulbIcon className="w-3 h-3" /> Brainstorm Plots
                                                    </button>
                                                </div>
                                            </div>
                                            {scenes.length > 0 ? (
                                                <Timeline scenes={scenes} allCharacters={characters} selectedSceneIds={selectedSceneIds} onToggleSelect={(id) => handleToggleSelection(id, 'scene')} onUpdateScene={handleUpdateScene} onDeleteScene={handleDeleteScene} onAddScene={handleAddScene} onReorderScenes={handleReorderScenes} onExportScene={() => { }} isLoading={isLoading} onGenerateDetails={handleGenerateSceneDetails} onGenerateImage={handleGenerateSceneImage} onMoveScene={(id, dir) => { }} />
                                            ) : (
                                                <div className="text-center py-20 text-brand-text-muted">
                                                    <TimelineIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                    <p>Add scenes to visualize your timeline.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }

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
                                                onDelete={() => handleDeleteCharacter(char.id)}
                                                onUpdate={handleUpdateCharacter}
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
                                                    onUpdate={handleUpdateScene}
                                                    onDelete={() => handleDeleteScene(scene.id)}
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
            < aside className={`fixed inset-y-0 right-0 z-40 w-80 lg:w-96 glass-panel border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`
            }>
                <button
                    onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                    className="absolute top-1/2 -left-3 w-6 h-12 bg-brand-surface border border-white/10 rounded-l-lg flex items-center justify-center text-brand-text-muted hover:text-white cursor-pointer z-50 shadow-md"
                    title="Toggle Assistant"
                >
                    {isRightPanelOpen ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                </button>

                <div className="p-5 border-b border-white/5 bg-brand-surface/50 backdrop-blur-xl">
                    <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
                        <WandSparklesIcon className="w-5 h-5 text-brand-secondary" />
                        AI Assistant
                    </h2>
                </div>

                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-6">

                    {/* Writer Tools */}
                    <div>
                        <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Toolkit</h3>
                        <WriterTools
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                            characters={characters}
                            scenes={scenes}
                            selectedCharacterIds={selectedCharacterIds}
                            selectedSceneIds={selectedSceneIds}
                            onBatchUpdateSelection={handleBatchUpdateSelection}
                            hasContent={scenes.length > 0}
                        />
                    </div>

                    {/* Global Chat */}
                    <div>
                        <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Chat / Command</h3>
                        <GlobalGenerator onGenerate={handleGenerateWithContext} isLoading={isLoading} />
                    </div>

                    {/* Saved Materials List (Mini) */}
                    <div>
                        <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Recent Generations</h3>
                        <div className="space-y-2">
                            {filteredMaterials.slice(0, 5).map(m => (
                                <div key={m.id} onClick={() => { setGeneratedContent({ title: m.title, content: m.content, type: m.type, sourceId: undefined }); setIsRightPanelOpen(true); }} className="p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer flex items-center gap-2 transition group">
                                    {getMaterialIcon(m.type)}
                                    <span className="text-xs font-medium text-brand-text truncate flex-grow">{m.title}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSavedMaterial(m.id); }} className="opacity-0 group-hover:opacity-100 text-brand-text-muted hover:text-red-400"><TrashIcon className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Output Area (Bottom of Right Panel) */}
                <div className={`border-t border-white/10 bg-brand-surface/80 backdrop-blur-xl flex flex-col transition-all duration-300 ${generatedContent ? 'h-1/2' : 'h-12'}`}>
                    <div className="p-3 flex justify-between items-center cursor-pointer border-b border-white/5" onClick={() => generatedContent ? setGeneratedContent(null) : null}>
                        <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Active Output</h3>
                        {generatedContent && <ChevronDownIcon className="w-4 h-4 text-brand-text-muted" />}
                    </div>
                    {generatedContent && (
                        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                            <OutputDisplay
                                generatedContent={generatedContent}
                                isLoading={isLoading}
                                loadingMessage={loadingMessage}
                                error={error}
                                onGenerateTimeline={handleGenerateTimeline}
                                onUpdateScene={handleUpdateScene}
                            />
                        </div>
                    )}
                </div>
            </aside >

        </div >
    );
}

export default App;
