import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use dynamic imports to ensure env is loaded first
async function testStyles() {
    const { generateImageForScene, generateCharacterImage } = await import('./services/geminiService.ts');
    const { CharacterType, ImageStyle } = await import('./types.ts');

    console.log("Testing Image Style Generation...");

    const mockScene = {
        id: 's1',
        title: 'The Neon Marketplace',
        summary: 'A bustling market in a futuristic city, illuminated by holographic signs.',
        fullText: '',
        characterIds: [],
        settingDescription: 'Cyberpunk city street, wet pavement, neon lights.',
        isTransition: false
    };

    const mockCharacter = {
        id: 'c1',
        name: 'Kael',
        type: CharacterType.PROTAGONIST,
        initialInfo: 'A rogue hacker',
        traits: 'Smart, cynical',
        history: '',
        arc: '',
        visualStats: {
            height: '6ft',
            build: 'Slim',
            hairColor: 'Silver',
            eyeColor: 'Blue',
            distinguishingFeatures: 'Cybernetic eye'
        }
    };

    // Test Cinematic
    console.log("\n--- Testing CINEMATIC Style ---");
    try {
        const img1 = await generateImageForScene(mockScene as any, [mockCharacter as any], ImageStyle.CINEMATIC);
        console.log("Cinematic Image Generated (Length):", img1.length);
    } catch (e: any) {
        console.error("Cinematic Failed:", e.message);
    }

    // Test Anime
    console.log("\n--- Testing ANIME Style ---");
    try {
        const img2 = await generateImageForScene(mockScene as any, [mockCharacter as any], ImageStyle.ANIME);
        console.log("Anime Image Generated (Length):", img2.length);
    } catch (e: any) {
        console.error("Anime Failed:", e.message);
    }

    // Test Pixel Art (Character)
    console.log("\n--- Testing PIXEL ART Style (Character) ---");
    try {
        const img3 = await generateCharacterImage(mockCharacter as any, ImageStyle.PIXEL_ART);
        console.log("Pixel Art Image Generated (Length):", img3.length);
    } catch (e: any) {
        console.error("Pixel Art Failed:", e.message);
    }
}

testStyles();
