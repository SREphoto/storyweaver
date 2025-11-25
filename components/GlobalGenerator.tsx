
import React, { useState } from 'react';
import { WandSparklesIcon } from './icons';

interface GlobalGeneratorProps {
    onGenerate: (prompt: string, contextSource: 'all' | 'selection') => void;
    isLoading: boolean;
}

const GlobalGenerator: React.FC<GlobalGeneratorProps> = ({ onGenerate, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleGenerate = (contextSource: 'all' | 'selection') => {
        if (!prompt.trim()) return;
        onGenerate(prompt, contextSource);
    };

    return (
        <div className="flex flex-col gap-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Ask the AI to do anything with your story context... e.g., 'Write a scene where Kaelen confronts the Baron' or 'Suggest a new title for the story'."
                className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition resize-none"
                disabled={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                    onClick={() => handleGenerate('selection')}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 text-white font-bold py-2.5 px-4 rounded-xl transition duration-300 bg-blue-600/80 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md border border-white/5"
                    title="Uses selected characters, scenes, and materials as context."
                >
                    Generate from Selection
                </button>
                <button
                    onClick={() => handleGenerate('all')}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 text-white font-bold py-2.5 px-4 rounded-xl transition duration-300 bg-purple-600/80 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md border border-white/5"
                    title="Uses your story premise and ALL characters, scenes, and materials as context."
                >
                    Generate from All
                </button>
            </div>
        </div>
    );
};

export default GlobalGenerator;
