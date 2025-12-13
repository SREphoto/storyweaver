import { useState, useCallback } from 'react';
import { useStory } from '../contexts/StoryContext';
import * as geminiService from '../services/geminiService';
import { Character, CharacterType, Scene, GeneratedContent, Tool, ImageStyle, GeneratedImageData, SavedMaterial, MapData } from '../types';

interface UseStoryGeneratorsProps {
    selectedCharacterIds: Set<string>;
    selectedSceneIds: Set<string>;
    selectedMaterialIds: Set<string>;
}

export const useStoryGenerators = ({ selectedCharacterIds, selectedSceneIds, selectedMaterialIds }: UseStoryGeneratorsProps) => {
    const {
        storyPremise, storyTextToAnalyze, characters, scenes, mapData, savedMaterials,
        setCharacters, setScenes, setMapData, setSavedMaterials, setGeneratedContent,
        setIsLoading, setLoadingMessage, setError,
        createCharacter, updateScene
    } = useStory();

    const [generatedImage, setGeneratedImage] = useState<GeneratedImageData | null>(null);

    const clearOutput = useCallback(() => {
        setError(null);
        setGeneratedContent(null);
    }, [setError, setGeneratedContent]);

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
            createCharacter(newCharacter);

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
    }, [createCharacter, setGeneratedContent, setSavedMaterials, setIsLoading, setLoadingMessage, setError, clearOutput]);

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
                    history: charInfo.history || charInfo.description,
                    arc: charInfo.arc || 'Not yet defined.'
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
    }, [storyPremise, storyTextToAnalyze, setCharacters, setScenes, setGeneratedContent, setSavedMaterials, setIsLoading, setLoadingMessage, setError, clearOutput]);

    const handleGenerate = useCallback(async (tool: Tool, overrideSelections?: { characterIds?: Set<string>, sceneIds?: Set<string> }) => {
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
    }, [selectedCharacterIds, selectedSceneIds, selectedMaterialIds, characters, scenes, savedMaterials, storyPremise, clearOutput, setError, setIsLoading, setLoadingMessage, setScenes, setMapData, setGeneratedContent, setSavedMaterials]);

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
            setError('Failed to generate text.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [storyPremise, characters, scenes, mapData, selectedCharacterIds, selectedSceneIds, setIsLoading, setLoadingMessage, setError, clearOutput, setGeneratedContent, setSavedMaterials]);

    const handleGenerateSceneImage = useCallback(async (scene: Scene, style?: ImageStyle) => {
        setIsLoading(true);
        setLoadingMessage(`Generating image for "${scene.title}"...`);
        clearOutput();
        try {
            const charactersInScene = characters.filter(c => scene.characterIds?.includes(c.id));
            const base64Image = await geminiService.generateImageForScene(scene, charactersInScene, style);
            setGeneratedImage({
                imageUrl: base64Image,
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
    }, [characters, setIsLoading, setLoadingMessage, setError, clearOutput, setGeneratedImage]);

    const handleGenerateCharacterImage = useCallback(async (character: Character, style?: ImageStyle) => {
        setIsLoading(true);
        setLoadingMessage(`Generating portrait for ${character.name}...`);
        clearOutput();
        try {
            const base64Image = await geminiService.generateCharacterImage(character, style);
            setGeneratedImage({
                imageUrl: base64Image,
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
    }, [setIsLoading, setLoadingMessage, setError, clearOutput, setGeneratedImage]);

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
    }, [setIsLoading, setLoadingMessage, setError, clearOutput, setGeneratedContent, setSavedMaterials]);

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
    }, [setIsLoading, setLoadingMessage, setError, setScenes, setGeneratedContent]);

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
            updateScene(sceneId, { fullText: generatedText });

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
    }, [scenes, characters, storyPremise, setIsLoading, setLoadingMessage, setError, clearOutput, updateScene, setGeneratedContent, setSavedMaterials]);

    return {
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
    };
};
