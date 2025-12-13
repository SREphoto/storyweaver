
import React from 'react';
import { useStory } from '../contexts/StoryContext';
import LoadingSpinner from './LoadingSpinner';

const GlobalLoadingIndicator: React.FC = () => {
    const { isLoading, loadingMessage } = useStory();

    if (!isLoading) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-brand-surface/90 backdrop-blur-xl border border-brand-secondary/30 shadow-2xl rounded-xl p-4 flex items-center gap-4 max-w-sm">
                <div className="relative">
                    <LoadingSpinner />
                    <div className="absolute inset-0 bg-brand-secondary/20 blur-xl rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-white">Generating...</h4>
                    <p className="text-xs text-brand-text-muted">{loadingMessage || 'Weaving your story...'}</p>
                </div>
            </div>
        </div>
    );
};

export default GlobalLoadingIndicator;
