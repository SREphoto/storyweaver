# StoryWeaver (AI Story Architect)

**StoryWeaver** is a comprehensive **AI-Powered Story Bible & Visual Novel Creator**. It helps authors build complex narratives by tracking characters, timelines, and scenes, while using Generative AI to visualize them.

### 🎯 Key Product Essence

The app is a "Creative Operating System" for writers. It goes beyond simple text editing by integrating **Google Gemini** to act as a co-author. It can analyze draft text to extract character traits, generate "What If" scenarios for plot points, and even turn written scenes into **Storyboards** or **Visual Novel** sequences.

### 🛠️ Technical Stack

* **Framework**: React (Vite) with a complex context-based state management (`StoryContext`).
* **AI Engine**: Deep integration with Google Gemini for text analysis, image generation (via Imagen), and script-to-storyboard conversion.
* **Visualization**: Specialized views for `Timeline`, `Map`, `Visual Novel`, and `Comic Creator`.
* **Architecture**: Modular "View" system (`StoryView`, `CharactersView`, `WorldView`) managed by a central `StoryEditor` controller.

### ✨ Core Features

* **Story Bible 📖**: Centralized tracking for Characters, Items, Locations, and Lore.
* **AI Co-Pilot 🤖**:
  * **Text Analysis**: Extracts data from raw text.
  * **Image Generation**: Creates portraits for characters and concept art for locations.
  * **Storyboarder**: Converts scene text into a visual shot list with sketches.
* **Multi-View Editor**:
  * **Timeline View**: KanBan-style board for dragging and reordering scenes.
  * **Map View**: Spatial management of locations.
  * **Visual Novel Mode**: Plays back the story with characters and backgrounds.
* **Distraction-Free Mode**: A dedicated writing interface that hides UI clutter.
* **Sprint Timer & Tracker**: Tools for writing productivity.

### 📂 Directory Insights

* `/storyweaver/StoryEditor.tsx`: The massive central controller for the editor interface.
* `/components/views/`: Contains the logic for specific modules like `TimelineView` and `MapView`.
* `/services/geminiService.ts`: The AI logic layer.
* `/types.ts`: extensive type definitions for the Story Object Model.
