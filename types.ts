


export enum CharacterType {
    PROTAGONIST = 'Protagonist',
    ANTAGONIST = 'Antagonist',
    DEUTERAGONIST = 'Deuteragonist',
    MENTOR = 'Mentor',
    LOVE_INTEREST = 'Love Interest',
    FOIL = 'Foil',
    SUPPORTING_CHARACTER = 'Supporting Character',
    MINOR_CHARACTER = 'Minor Character',
}

export enum ImageStyle {
    CINEMATIC = 'Cinematic',
    ANIME = 'Anime',
    WATERCOLOR = 'Watercolor',
    OIL_PAINTING = 'Oil Painting',
    CYBERPUNK = 'Cyberpunk',
    NOIR = 'Noir',
    PIXEL_ART = 'Pixel Art',
    CONCEPT_ART = 'Concept Art',
}

export interface CharacterProfile {
    history: string;
    arc: string;
}

export interface CharacterVisualStats {
    height: string;
    build: string; // e.g. muscular, slender
    hairColor: string;
    eyeColor: string;
    distinguishingFeatures: string; // e.g. scars, tattoos, glasses
}

export interface CharacterOutfit {
    id: string;
    name: string; // e.g. "Battle Armor", "Casual Wear"
    description: string;
    referenceImage?: string;
}

export interface Character extends CharacterProfile {
    id: string;
    name: string;
    type: CharacterType;
    initialInfo: string;
    traits: string;
    headerImage?: string;
    // New Visual Fields
    visualStats?: CharacterVisualStats;
    outfits?: CharacterOutfit[];
    activeOutfitId?: string;
}

export interface StoryboardShot {
    id: string;
    shotType: string;
    visualDescription: string;
    midjourneyPrompt: string;
    sketchImage?: string; // Base64 of AI sketch
    finalImage?: string; // User uploaded Midjourney image
}

export interface Scene {
    id: string;
    title: string;
    summary: string;
    fullText: string;
    characterIds?: string[];
    isTransition?: boolean;
    headerImage?: string;
    settingDescription?: string;
    script?: string;
    storyboard?: StoryboardShot[];
}

export interface TimelineItem {
    title: string;
    summary: string;
}

export interface OutlineItem {
    act: string;
    title: string;
    summary: string;
}

export interface RelationshipWebData {
    nodes: { id: string; name: string; type: CharacterType }[];
    links: {
        source: string;
        target: string;
        dynamic: string;
        strength: 'Strong' | 'Developing' | 'Weak';
    }[];
}

export interface Location {
    id: string;
    name: string;
    description: string;
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
}

export interface MapData {
    worldDescription: string;
    locations: Location[];
}

export interface StoryObject {
    id: string;
    name: string;
    appearance: string;
    history: string;
    significance: string;
    image?: string; // base64
    notes?: string;
}

export interface Scene {
    id: string;
    title: string;
    summary: string;
    fullText: string;
    characterIds?: string[];
    itemIds?: string[]; // Links to StoryObjects
    isTransition?: boolean;
    headerImage?: string;
    settingDescription?: string;
    script?: string;
    storyboard?: StoryboardShot[];
}

export interface Book {
    title: string;
    chapters: { title: string; content: string }[];
}

export type MaterialType = Tool | 'CHARACTER_PROFILE' | 'ANALYSIS_SUMMARY' | 'VIDEO_ANALYSIS' | 'TIMELINE' | 'RELATIONSHIP_WEB_VISUAL' | 'MAP_DATA' | 'OBJECT_DATA' | 'OUTLINE' | 'IMAGE' | 'NOTE';

export interface GeneratedContent {
    title: string;
    content: string | TimelineItem[] | RelationshipWebData | MapData | StoryObject | OutlineItem[];
    type: MaterialType;
    sourceId?: string; // ID of the scene or character this content is derived from
}

export enum Tool {
    CHAPTER = 'CHAPTER',
    RELATIONSHIP_WEB = 'RELATIONSHIP_WEB',
    PLOT_IDEAS = 'PLOT_IDEAS',
    TRANSITION = 'TRANSITION',
    SCENE_WRITER = 'SCENE_WRITER',
    MAP_GENERATOR = 'MAP_GENERATOR',
    REASSESS_FLOW = 'REASSESS_FLOW',
    DIALOGUE_GENERATOR = 'DIALOGUE_GENERATOR',
    OBJECT_GENERATOR = 'OBJECT_GENERATOR',
    SETTING_GENERATOR = 'SETTING_GENERATOR',
    OUTLINE_GENERATOR = 'OUTLINE_GENERATOR',
    MIDJOURNEY_PROMPTS = 'MIDJOURNEY_PROMPTS',
}

export interface SavedMaterial {
    id: string;
    type: MaterialType;
    title: string;
    content: string | TimelineItem[] | RelationshipWebData | MapData | StoryObject | OutlineItem[];
}

export interface Section {
    id: string;
    title: string;
    column: 1 | 2 | 3 | 'full';
    isCollapsed: boolean;
    isVisible: boolean;
}

export interface FilterSettings {
    characters: boolean;
    scenes: boolean;
    locations: boolean;
    materials: boolean;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    relatedId?: string; // Link to a scene or character
    relatedType?: 'scene' | 'character' | 'location';
}

export type ViewMode = 'story' | 'characters' | 'world' | 'map' | 'timeline' | 'book' | 'visual' | 'comic' | 'notes' | 'video' | 'assets' | 'items';

// --- Infinite Heroes Comic Types ---

export interface Beat {
    caption?: string;
    dialogue?: string;
    scene: string; // Visual description for image gen
    focus_char: 'hero' | 'co-star' | 'villain' | 'other';
    hero_emotion?: string;
    costar_emotion?: string;
    villain_emotion?: string;
}

export interface ComicFace {
    id: string;
    type: 'cover' | 'story' | 'back_cover';
    imageUrl?: string;
    narrative?: Beat;
    choices: string[];
    resolvedChoice?: string;
    isLoading: boolean;
    pageIndex?: number;
}

export interface ComicCharacter {
    name: string;
    description: string;
    image: string; // Base64
    role: 'hero' | 'co-star' | 'villain';
}

export type GeneratedImageData = {
    imageUrl: string;
    source?: {
        type: 'scene' | 'character';
        id: string;
    };
    title: string;
}
