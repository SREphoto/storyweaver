# Image Generation in StoryWeaver

## Current Status

**Image generation IS currently supported** in StoryWeaver using the **Gemini 2.5 Flash Image** model (`gemini-2.5-flash-image`).

> [!NOTE]
> Other models like `imagen-3.0` or `imagen-4.0` may appear in lists but are currently not accessible (404 Error) for this API key/region.

## How it Works

The application uses the `gemini-2.5-flash-image` model which supports image generation directly via the `generateContent` API.

1.  **Direct Integration**: No separate Vertex AI setup is required.
2.  **Authentication**: Uses the same API Key as text generation.
3.  **Automatic Retries**: The system automatically detects if the model returns a text description instead of an image and retries (up to 3 times) with stricter instructions.

## Troubleshooting

If image generation fails, check the Browser Console (`F12`) for detailed logs:

*   **"[GeminiService] Attempt X failed: Received text instead of image..."**: The system is working intended, retrying the generation.
*   **"[GeminiService] Image generation finishReason: ..."**: Indicates why generation stopped (e.g., SAFETY, STOP).
*   **"[GeminiService] Non-negligible safety ratings: ..."**: The prompt may have triggered safety filters. Try adjusting the prompt.

## Capabilities

StoryWeaver **can generate**:

*   ✅ **Scene Images** - Cinematic visualizations of your story scenes
*   ✅ **Character Portraits** - Visual representations of your characters based on their stats and outfits
*   ✅ **Storyboard Sketches** - Rough sketches for storyboard shots
*   ✅ **Comic Panels** - Dynamic comic book panels for the Infinite Heroes mode
*   ✅ **Villain Portraits** - Generated villains for comics

## Workarounds (Legacy)

If you prefer other styles or higher resolution, you can still use:

### Option 1: Use Generated Midjourney Prompts

StoryWeaver generates detailed Midjourney prompts that you can:

1.  Copy from the app
2.  Paste into Midjourney (Discord or web interface)
3.  Download the generated images
4.  Upload them back to StoryWeaver

### Option 2: External Image Generation Services

Use the generated descriptions with:

*   **Midjourney** - Best for artistic, cinematic images
*   **DALL-E 3** - Good for quick concept art
*   **Stable Diffusion** - Free, local generation option
*   **Leonardo.ai** - Good for consistent character generation

## For Users

When you click "Generate Image" buttons:

*   ✅ The app will generate an image using Gemini 2.5 Flash.
*   ✅ If the model starts chatting instead of drawing, the app will **automatically tell it to stop talking and draw**.
*   ✅ You might see a slight delay if retries are happening, but this ensures a higher success rate.

The app is fully functional for both text and image generation.
