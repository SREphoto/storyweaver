import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
    Character, Scene, MapData, SavedMaterial, Book, GeneratedContent,
    CharacterType, Tool, StoryboardShot, Location, MaterialType
} from '../types';
import * as geminiService from '../services/geminiService';
import JSZip from 'jszip';

interface StoryContextType {
    // State
    storyPremise: string;
    setStoryPremise: (premise: string) => void;
    storyTextToAnalyze: string;
    setStoryTextToAnalyze: (text: string) => void;
    characters: Character[];
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
    scenes: Scene[];
    setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
    mapData: MapData | null;
    setMapData: React.Dispatch<React.SetStateAction<MapData | null>>;
    savedMaterials: SavedMaterial[];
    setSavedMaterials: React.Dispatch<React.SetStateAction<SavedMaterial[]>>;
    compiledBook: Book | null;
    setCompiledBook: React.Dispatch<React.SetStateAction<Book | null>>;

    // UI State (Global)
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    loadingMessage: string;
    setLoadingMessage: (msg: string) => void;
    error: string | null;
    setError: (error: string | null) => void;
    generatedContent: GeneratedContent | null;
    setGeneratedContent: React.Dispatch<React.SetStateAction<GeneratedContent | null>>;

    // Actions
    saveProject: () => Promise<void>;
    loadProject: (file: File) => Promise<void>;
    saveStatus: 'idle' | 'saving' | 'saved';

    // CRUD Helpers
    updateCharacter: (id: string, updates: Partial<Character>) => void;
    createCharacter: (character: Character) => void;
    deleteCharacter: (id: string) => void;
    addScene: () => void;
    updateScene: (id: string, updates: Partial<Scene>) => void;
    deleteScene: (id: string) => void;
    reorderScenes: (scenes: Scene[]) => void;
    updateLocation: (id: string, updates: Partial<Location>) => void;
    deleteSavedMaterial: (id: string) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const useStory = () => {
    const context = useContext(StoryContext);
    if (!context) {
        throw new Error('useStory must be used within a StoryProvider');
    }
    return context;
};

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Data State
    const [storyPremise, setStoryPremise] = useState<string>(() => localStorage.getItem('storyPremise') || '');
    const [storyTextToAnalyze, setStoryTextToAnalyze] = useState<string>(() => localStorage.getItem('storyTextToAnalyze') || '');
    const [characters, setCharacters] = useState<Character[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [savedMaterials, setSavedMaterials] = useState<SavedMaterial[]>([]);
    const [compiledBook, setCompiledBook] = useState<Book | null>(null);

    // UI State
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // --- Persistence Effects ---
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
    }, []);

    useEffect(() => {
        localStorage.setItem('storyPremise', storyPremise);
    }, [storyPremise]);

    useEffect(() => {
        localStorage.setItem('storyTextToAnalyze', storyTextToAnalyze);
    }, [storyTextToAnalyze]);

    // --- Actions ---

    const saveProject = async () => {
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

    const loadProject = async (file: File) => {
        setIsLoading(true);
        setLoadingMessage("Loading project...");

        try {
            if (file.name.endsWith('.json')) {
                const text = await file.text();
                const data = JSON.parse(text);
                if (data.storyPremise) setStoryPremise(data.storyPremise);
                if (data.storyTextToAnalyze) setStoryTextToAnalyze(data.storyTextToAnalyze);
                if (data.characters) setCharacters(data.characters);
                if (data.scenes) setScenes(data.scenes);
                if (data.mapData) setMapData(data.mapData);
                if (data.savedMaterials) setSavedMaterials(data.savedMaterials);
            } else if (file.name.endsWith('.zip')) {
                const zip = new JSZip();
                const contents = await zip.loadAsync(file);

                if (contents.file("project.json")) {
                    const infoText = await contents.file("project.json")!.async("string");
                    const info = JSON.parse(infoText);
                    if (info.storyPremise) setStoryPremise(info.storyPremise);
                    if (info.storyTextToAnalyze) setStoryTextToAnalyze(info.storyTextToAnalyze);
                }

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

                const sceneFolder = contents.folder("scenes");
                const newScenes: Scene[] = [];
                if (sceneFolder) {
                    const sceneFiles = Object.keys(sceneFolder.files).filter(name => !sceneFolder.files[name].dir);
                    for (const filename of sceneFiles) {
                        const text = await sceneFolder.file(filename)!.async("string");
                        newScenes.push(JSON.parse(text));
                    }
                }
                newScenes.sort((a, b) => (a.id > b.id) ? 1 : -1);
                setScenes(newScenes);

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

                if (contents.file("world_map.json")) {
                    const mapText = await contents.file("world_map.json")!.async("string");
                    setMapData(JSON.parse(mapText));
                }

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
        }
    };

    // --- CRUD Helpers ---

    const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
        setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    const createCharacter = useCallback((character: Character) => {
        setCharacters(prev => [...prev, character]);
    }, []);

    const deleteCharacter = useCallback((id: string) => {
        setCharacters(prev => prev.filter(c => c.id !== id));
    }, []);

    const addScene = useCallback(() => {
        setScenes(prev => [...prev, {
            id: `scene_manual_${Date.now()}`,
            title: 'New Scene',
            summary: 'A brief summary...',
            fullText: 'The full text...',
            characterIds: [],
        }]);
    }, []);

    const updateScene = useCallback((id: string, updates: Partial<Scene>) => {
        setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, []);

    const deleteScene = useCallback((id: string) => {
        setScenes(prev => prev.filter(s => s.id !== id));
    }, []);

    const reorderScenes = useCallback((newScenes: Scene[]) => {
        setScenes(newScenes);
    }, []);

    const updateLocation = useCallback((id: string, updates: Partial<Location>) => {
        setMapData(prev => prev ? { ...prev, locations: prev.locations.map(l => l.id === id ? { ...l, ...updates } : l) } : null);
    }, []);

    const deleteSavedMaterial = useCallback((id: string) => {
        setSavedMaterials(prev => prev.filter(m => m.id !== id));
    }, []);

    return (
        <StoryContext.Provider value={{
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
            saveProject, loadProject, saveStatus,
            updateCharacter, createCharacter, deleteCharacter,
            addScene, updateScene, deleteScene, reorderScenes,
            updateLocation, deleteSavedMaterial
        }}>
            {children}
        </StoryContext.Provider>
    );
};
