import React from 'react';
import { MapData, Tool, SavedMaterial } from '../../types';
import MapDisplay from '../MapDisplay';
import VideoUploader from '../VideoUploader';
import { MapIcon } from '../icons';

interface WorldViewProps {
    onGenerate: (tool: Tool) => void;
    isLoading: boolean;
    mapData: MapData | null;
    selectedLocationIds: Set<string>;
    onToggleSelectLocation: (id: string, type: 'location') => void;
    onUpdateLocation: (id: string, updates: any) => void;
    onExportData: (format: 'json' | 'txt') => void;
    onViewLocationScenes: (locationName: string) => void;
    onAnalyzeVideo: (videoFile: File | null, videoUrl: string, prompt: string) => void;
}

const WorldView: React.FC<WorldViewProps> = ({
    onGenerate, isLoading, mapData, selectedLocationIds, onToggleSelectLocation,
    onUpdateLocation, onExportData, onViewLocationScenes, onAnalyzeVideo
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-serif font-bold">World Map</h2>
                    <button onClick={() => onGenerate(Tool.MAP_GENERATOR)} disabled={isLoading} className="flex items-center gap-2 bg-brand-secondary text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20">
                        <MapIcon className="w-4 h-4" /> Generate Map
                    </button>
                </div>
                {mapData ? (
                    <MapDisplay
                        mapData={mapData}
                        selectedLocationIds={selectedLocationIds}
                        onToggleSelectLocation={(id) => onToggleSelectLocation(id, 'location')}
                        onUpdateLocation={onUpdateLocation}
                        onExport={() => onExportData('json')}
                        onViewScenes={onViewLocationScenes}
                    />
                ) : (
                    <div className="h-64 flex items-center justify-center text-brand-text-muted italic">
                        No map generated yet. Use the tool to create one based on your story.
                    </div>
                )}
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h2 className="text-xl font-serif font-bold mb-4">Visual Inspiration</h2>
                <VideoUploader onAnalyze={onAnalyzeVideo} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default WorldView;
