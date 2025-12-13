
import React, { useState } from 'react';
import { MapData, Tool } from '../../types';
import MapDisplay from '../MapDisplay';
import { MapIcon, PlusIcon, SettingsIcon } from '../icons';

interface MapViewProps {
    onGenerate: (tool: Tool) => void;
    isLoading: boolean;
    mapData: MapData | null;
    selectedLocationIds: Set<string>;
    onToggleSelectLocation: (id: string, type: 'location') => void;
    onUpdateLocation: (id: string, updates: any) => void;
    onExportData: (format: 'json' | 'txt') => void;
    onViewLocationScenes: (locationName: string) => void;
}

const MapView: React.FC<MapViewProps> = ({
    onGenerate, isLoading, mapData, selectedLocationIds, onToggleSelectLocation,
    onUpdateLocation, onExportData, onViewLocationScenes
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [isAddingPin, setIsAddingPin] = useState(false);

    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            {/* Toolbar */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-secondary/20 rounded-lg">
                        <MapIcon className="w-6 h-6 text-brand-secondary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif font-bold text-white">Story Map</h2>
                        <p className="text-xs text-brand-text-muted">Geography & Locations</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAddingPin(!isAddingPin)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isAddingPin ? 'bg-brand-primary text-white' : 'bg-white/5 text-brand-text-muted hover:text-white hover:bg-white/10'}`}
                        title="Add Manual Location"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Pin</span>
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${showSettings ? 'bg-white/10 text-white' : 'bg-white/5 text-brand-text-muted hover:text-white hover:bg-white/10'}`}
                        title="Map Settings"
                    >
                        <SettingsIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Settings</span>
                    </button>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <button
                        onClick={() => onGenerate(Tool.MAP_GENERATOR)}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-brand-secondary text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MapIcon className="w-4 h-4" />
                        {isLoading ? 'Generating...' : 'Generate Map'}
                    </button>
                </div>
            </div>

            {/* Settings Panel (Conditional) */}
            {showSettings && (
                <div className="glass-panel p-4 rounded-xl border border-white/10 animate-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-brand-text mb-3">Generation Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-brand-text-muted mb-1">Terrain Type</label>
                            <select title="Terrain Type" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-brand-secondary outline-none">
                                <option>Fantasy (Forests, Mountains)</option>
                                <option>Sci-Fi (Planets, Space Stations)</option>
                                <option>Modern (Cities, Roads)</option>
                                <option>Post-Apocalyptic (Ruins, Wastelands)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-brand-text-muted mb-1">Climate</label>
                            <select title="Climate" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-brand-secondary outline-none">
                                <option>Temperate</option>
                                <option>Tropical</option>
                                <option>Arid / Desert</option>
                                <option>Arctic / Tundra</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-brand-text-muted mb-1">Map Style</label>
                            <select title="Map Style" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-brand-secondary outline-none">
                                <option>Parchment / Hand Drawn</option>
                                <option>Satellite / Realistic</option>
                                <option>Blueprint / Schematic</option>
                                <option>Holographic</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Display Area */}
            <div className="flex-grow glass-card rounded-2xl border border-white/5 overflow-hidden relative flex flex-col">
                {mapData ? (
                    <MapDisplay
                        mapData={mapData}
                        selectedLocationIds={selectedLocationIds}
                        onToggleSelectLocation={(id) => onToggleSelectLocation(id, 'location')}
                        onUpdateLocation={onUpdateLocation}
                        onExport={() => onExportData('json')}
                        onViewScenes={onViewLocationScenes}
                        isAddingPin={isAddingPin}
                        onAddPin={(x, y) => {
                            // Placeholder for adding pin logic
                            console.log(`Add pin at ${x}, ${y}`);
                            setIsAddingPin(false);
                            // In a real implementation, this would trigger a modal to name the location
                        }}
                    />
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-brand-text-muted">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MapIcon className="w-10 h-10 opacity-50" />
                        </div>
                        <p className="text-lg font-medium mb-2">No Map Generated</p>
                        <p className="text-sm opacity-70 max-w-md text-center">
                            Use the "Generate Map" button to create a world based on your story's context, or check your settings above.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapView;
