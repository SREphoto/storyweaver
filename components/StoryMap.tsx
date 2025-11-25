
import React from 'react';
import { ComicFace } from '../types';

interface StoryMapProps {
    faces: ComicFace[];
}

const StoryMap: React.FC<StoryMapProps> = ({ faces }) => {
    const storyFaces = faces.filter(f => f.type === 'story');

    return (
        <div className="h-full overflow-y-auto p-4 bg-brand-surface border-l border-white/10">
            <h3 className="font-banger text-xl text-white mb-4 tracking-wider">STORY MAP</h3>
            <div className="space-y-4 relative">
                <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-white/20"></div>
                {storyFaces.map((face, idx) => (
                    <div key={face.id} className="relative pl-6">
                        <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-brand-bg ${face.isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-brand-comic-cyan'}`}></div>
                        <div className="bg-white/5 p-3 rounded border border-white/10 hover:bg-white/10 transition">
                            <div className="flex justify-between mb-1">
                                <span className="font-banger text-sm text-brand-secondary">PAGE {face.pageIndex}</span>
                                {face.isLoading && <span className="text-xs text-yellow-400 animate-pulse">GENERATING...</span>}
                            </div>
                            <p className="text-xs text-gray-300 font-comic line-clamp-3">
                                {face.narrative?.caption || face.narrative?.dialogue || 'Writing...'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoryMap;
