import React from 'react';
import VideoUploader from '../VideoUploader';
import { FilmIcon } from '../icons';

interface WorldViewProps {
    isLoading: boolean;
    onAnalyzeVideo: (videoFile: File | null, videoUrl: string, prompt: string) => void;
}

const WorldView: React.FC<WorldViewProps> = ({
    isLoading, onAnalyzeVideo
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-secondary/20 rounded-lg">
                        <FilmIcon className="w-6 h-6 text-brand-secondary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-white">Visual Inspiration</h2>
                        <p className="text-xs text-brand-text-muted">Video Analysis & Mood Boards</p>
                    </div>
                </div>

                <VideoUploader onAnalyze={onAnalyzeVideo} isLoading={isLoading} />
            </div>

            {/* Future World Building Sections (Lore, Physics, etc.) can go here */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 opacity-50">
                <h3 className="text-lg font-bold text-brand-text mb-2">World Lore (Coming Soon)</h3>
                <p className="text-sm text-brand-text-muted">Define the history, laws of physics, and magic systems of your world.</p>
            </div>
        </div>
    );
};

export default WorldView;
