
import React, { useState, useEffect } from 'react';
import { MapData, Location } from '../types';
import { MapIcon, MapPinIcon, EditIcon, SaveIcon, DownloadIcon, BookOpenIcon } from './icons';

interface MapDisplayProps {
    mapData: MapData;
    selectedLocationIds: Set<string>;
    onToggleSelectLocation: (id: string) => void;
    onUpdateLocation: (id: string, updates: Partial<Location>) => void;
    onExport: () => void;
    onViewScenes?: (locationName: string) => void;
    isAddingPin?: boolean;
    onAddPin?: (x: number, y: number) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
    mapData, selectedLocationIds, onToggleSelectLocation, onUpdateLocation, onExport, onViewScenes,
    isAddingPin, onAddPin
}) => {
    const [activeLocation, setActiveLocation] = useState<Location | null>(mapData.locations[0] || null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState('');

    useEffect(() => {
        if (activeLocation) {
            setEditedDescription(activeLocation.description);
            setIsEditing(false);
        } else if (mapData.locations.length > 0) {
            setActiveLocation(mapData.locations[0]);
        } else {
            setActiveLocation(null);
        }
    }, [activeLocation, mapData.locations]);

    const handleSave = () => {
        if (activeLocation) {
            onUpdateLocation(activeLocation.id, { description: editedDescription });
            setIsEditing(false);
        }
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isAddingPin && onAddPin) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            onAddPin(x, y);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div className="glass-card p-4 rounded-lg border border-white/10 bg-brand-surface/40 w-full">
                    <p className="text-sm text-brand-text-muted font-serif italic leading-relaxed">{mapData.worldDescription}</p>
                </div>
                <button onClick={onExport} title="Export Map Data" className="ml-4 text-brand-text-muted hover:text-white transition p-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20">
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Map Visualization */}
            <div
                className={`relative w-full aspect-video bg-[#0f172a] rounded-xl border border-brand-primary/50 overflow-hidden shadow-2xl group select-none ${isAddingPin ? 'cursor-crosshair ring-2 ring-brand-primary ring-offset-2 ring-offset-black' : ''}`}
                onClick={handleMapClick}
            >
                {/* Map Background Grid / Pattern */}
                {/* Map Background Grid / Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[size:40px_40px] bg-[image:linear-gradient(rgba(56,189,248,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.1)_1px,transparent_1px)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(15,23,42,0.8)_100%)] pointer-events-none"></div>

                {/* Topographic lines simulation */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-accent" />
                    <path d="M0,70 Q40,40 70,70 T100,30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-accent" />
                    <path d="M0,30 Q30,60 60,30 T100,80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-accent" />
                </svg>

                {/* Locations */}
                {mapData.locations.map(loc => (
                    <button
                        key={loc.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 group/pin left-[--x] top-[--y]`}
                        style={{ '--x': `${loc.x}%`, '--y': `${loc.y}%` } as React.CSSProperties}
                        onClick={(e) => { e.stopPropagation(); setActiveLocation(loc); }}
                    >
                        <div className={`relative flex flex-col items-center`}>
                            {/* Pulse Effect for Selected */}
                            {activeLocation?.id === loc.id && (
                                <span className="absolute w-8 h-8 bg-brand-secondary/30 rounded-full animate-ping"></span>
                            )}

                            {/* Pin Icon */}
                            <MapPinIcon className={`w-6 h-6 transition-transform duration-300 hover:scale-125 ${activeLocation?.id === loc.id ? 'text-brand-secondary drop-shadow-[0_0_10px_rgba(var(--color-secondary),1)]' : 'text-brand-text-muted hover:text-white'}`} />

                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover/pin:block z-20 whitespace-nowrap">
                                <div className="bg-brand-surface/90 backdrop-blur-md border border-white/10 text-brand-text text-xs px-3 py-2 rounded-lg shadow-xl max-w-[200px]">
                                    <div className="font-bold mb-1">{loc.name}</div>
                                    <div className="text-brand-text-muted text-[10px] whitespace-normal line-clamp-2 leading-tight">{loc.description}</div>
                                </div>
                                {/* Arrow */}
                                <div className="w-2 h-2 bg-brand-surface/90 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1 border-r border-b border-white/10"></div>
                            </div>

                            {/* Label always visible (small) */}
                            <span className={`mt-1 text-[10px] font-bold tracking-wider uppercase shadow-black drop-shadow-md ${activeLocation?.id === loc.id ? 'text-brand-secondary' : 'text-brand-text-muted/70 group-hover/pin:text-white'}`}>
                                {loc.name}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Location Cards Grid */}
            <div>
                <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3 pb-2 border-b border-white/10">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mapData.locations.map(loc => (
                        <div
                            key={loc.id}
                            onClick={() => setActiveLocation(loc)}
                            className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group overflow-hidden ${activeLocation?.id === loc.id ? 'bg-brand-secondary/10 border-brand-secondary ring-1 ring-brand-secondary/30' : 'bg-brand-surface/40 border-white/5 hover:border-white/20 hover:bg-brand-surface/60'}`}
                        >
                            {/* Selection Indicator */}
                            <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border ${activeLocation?.id === loc.id ? 'bg-brand-secondary border-brand-secondary' : 'border-brand-text-muted/30'}`}></div>

                            <div className="flex items-center gap-2 mb-2">
                                <MapPinIcon className={`w-4 h-4 ${activeLocation?.id === loc.id ? 'text-brand-secondary' : 'text-brand-text-muted'}`} />
                                <h4 className={`font-bold text-sm ${activeLocation?.id === loc.id ? 'text-brand-text' : 'text-brand-text-muted group-hover:text-brand-text'}`}>{loc.name}</h4>
                            </div>

                            {activeLocation?.id === loc.id && isEditing ? (
                                <textarea
                                    value={editedDescription}
                                    onChange={e => setEditedDescription(e.target.value)}
                                    rows={3}
                                    onClick={e => e.stopPropagation()}
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-xs text-brand-text focus:outline-none focus:border-brand-secondary resize-none"
                                    aria-label="Location Description"
                                />
                            ) : (
                                <p className="text-xs text-brand-text-muted font-serif leading-relaxed line-clamp-4">{loc.description}</p>
                            )}

                            {/* Action Bar (only visible on active) */}
                            {activeLocation?.id === loc.id && (
                                <div className="mt-3 pt-2 border-t border-white/5 flex justify-end gap-2">
                                    {isEditing ? (
                                        <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="text-green-400 hover:text-green-300 text-xs font-bold px-2 py-1 rounded bg-green-900/20">Save</button>
                                    ) : (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="text-brand-text-muted hover:text-white text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5"><EditIcon className="w-3 h-3" /> Edit</button>
                                            {onViewScenes && (
                                                <button onClick={(e) => { e.stopPropagation(); onViewScenes(loc.name); }} className="text-brand-secondary hover:text-white text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-brand-secondary/20">
                                                    <BookOpenIcon className="w-3 h-3" /> View Scenes
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapDisplay;