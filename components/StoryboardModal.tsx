
import React, { useState, useRef } from 'react';
import { StoryboardShot, Scene } from '../types';
import { XIcon, CameraIcon, ImageIcon, WandSparklesIcon, DownloadIcon, LayoutDashboardIcon, SaveIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface StoryboardModalProps {
    scene: Scene;
    onGenerateStoryboard: (options: { stylize: number, aspectRatio: string, version: string }) => void;
    onGenerateSketch: (shotId: string, description: string) => void;
    onUpdateShot: (shotId: string, updates: Partial<StoryboardShot>) => void;
    onClose: () => void;
    isGenerating: boolean;
}

const STYLIZE_OPTIONS = Array.from({ length: 21 }, (_, i) => i * 50);
const ASPECT_RATIOS = ['1:2', '9:16', '2:3', '3:4', '5:6', '1:1', '6:5', '4:3', '3:2', '16:9', '2:1'];
const VERSIONS = ['5', '6', '6.1', '7'];

const StoryboardModal: React.FC<StoryboardModalProps> = ({ scene, onGenerateStoryboard, onGenerateSketch, onUpdateShot, onClose, isGenerating }) => {
    const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTargetShotId, setUploadTargetShotId] = useState<string | null>(null);

    const [stylize, setStylize] = useState(100);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [version, setVersion] = useState('6');

    const handleCopyPrompt = (prompt: string, id: string) => {
        navigator.clipboard.writeText(prompt);
        setCopySuccessId(id);
        setTimeout(() => setCopySuccessId(null), 2000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && uploadTargetShotId) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateShot(uploadTargetShotId, { finalImage: reader.result as string });
                setUploadTargetShotId(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerUpload = (shotId: string) => {
        setUploadTargetShotId(shotId);
        fileInputRef.current?.click();
    };

    const shots = scene.storyboard || [];
    const hasScript = !!scene.script;
    const hasSetting = !!scene.settingDescription;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-brand-bg w-full h-full max-w-[95vw] max-h-[95vh] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-brand-surface">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-secondary/20 rounded-lg text-brand-secondary">
                            <LayoutDashboardIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-brand-text font-serif">Storyboard: {scene.title}</h2>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                                <span className={`px-2 py-0.5 rounded ${hasScript ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{hasScript ? 'Script Ready' : 'No Script'}</span>
                                <span className={`px-2 py-0.5 rounded ${hasSetting ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{hasSetting ? 'Setting Ready' : 'No Setting'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 mr-2">
                            <select
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-brand-text focus:outline-none focus:border-brand-secondary"
                                title="Midjourney Version"
                            >
                                {VERSIONS.map(v => <option key={v} value={v}>v{v}</option>)}
                            </select>
                            <select
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-brand-text focus:outline-none focus:border-brand-secondary"
                                title="Aspect Ratio"
                            >
                                {ASPECT_RATIOS.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                            </select>
                            <select
                                value={stylize}
                                onChange={(e) => setStylize(Number(e.target.value))}
                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-brand-text focus:outline-none focus:border-brand-secondary"
                                title="Stylize"
                            >
                                {STYLIZE_OPTIONS.map(s => <option key={s} value={s}>s{s}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => onGenerateStoryboard({ stylize, aspectRatio, version })}
                            disabled={isGenerating}
                            className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2 px-6 rounded-xl hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <LoadingSpinner /> : <WandSparklesIcon className="w-5 h-5" />}
                            {shots.length > 0 ? 'Regenerate Shots' : 'Generate Storyboard'}
                        </button>
                        <button onClick={onClose} className="p-2 text-brand-text-muted hover:text-white transition rounded-lg hover:bg-white/5" title="Close" aria-label="Close">
                            <XIcon className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-grow overflow-y-auto p-6 bg-brand-bg/50 custom-scrollbar">
                    {shots.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-brand-text-muted opacity-50">
                            <LayoutDashboardIcon className="w-24 h-24 mb-4" />
                            <p className="text-lg">No shots generated yet.</p>
                            <p className="text-sm max-w-md text-center mt-2">The AI will analyze the script, setting, and characters to create a cinematic shot list with sketches.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {shots.map((shot, index) => (
                                <div key={shot.id} className="bg-brand-surface rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-lg group hover:border-brand-secondary/30 transition-all duration-300">
                                    {/* Header */}
                                    <div className="p-3 bg-black/20 border-b border-white/5 flex justify-between items-center">
                                        <span className="text-xs font-mono text-brand-text-muted bg-white/5 px-2 py-1 rounded">Shot {index + 1}</span>
                                        <span className="font-bold text-sm text-brand-secondary">{shot.shotType}</span>
                                    </div>

                                    {/* Image Area */}
                                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                                        {shot.finalImage ? (
                                            <img src={shot.finalImage} alt="Final" className="w-full h-full object-cover" />
                                        ) : shot.sketchImage ? (
                                            <img src={shot.sketchImage.startsWith('data:') ? shot.sketchImage : `data:image/jpeg;base64,${shot.sketchImage}`} alt="Sketch" className="w-full h-full object-cover opacity-80 grayscale contrast-125" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <p className="text-xs text-brand-text-muted mb-2 italic">"{shot.visualDescription}"</p>
                                                <button
                                                    onClick={() => onGenerateSketch(shot.id, shot.visualDescription)}
                                                    className="text-xs bg-brand-primary/50 hover:bg-brand-secondary text-white px-3 py-1.5 rounded-full transition"
                                                >
                                                    Generate Sketch
                                                </button>
                                            </div>
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => triggerUpload(shot.id)}
                                                className="p-2 bg-white/10 hover:bg-brand-secondary rounded-full text-white transition"
                                                title="Upload Midjourney Image"
                                            >
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                            {!shot.sketchImage && !shot.finalImage && (
                                                <button
                                                    onClick={() => onGenerateSketch(shot.id, shot.visualDescription)}
                                                    className="p-2 bg-white/10 hover:bg-brand-secondary rounded-full text-white transition"
                                                    title="Generate Pencil Sketch"
                                                >
                                                    <WandSparklesIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prompt Area */}
                                    <div className="p-4 flex-grow flex flex-col gap-2 bg-brand-bg/30">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Midjourney Prompt</span>
                                            <button
                                                onClick={() => handleCopyPrompt(shot.midjourneyPrompt, shot.id)}
                                                className={`text-xs flex items-center gap-1 ${copySuccessId === shot.id ? 'text-green-400' : 'text-brand-text-muted hover:text-white'}`}
                                            >
                                                {copySuccessId === shot.id ? 'Copied!' : <><DownloadIcon className="w-3 h-3 rotate-180" /> Copy</>}
                                            </button>
                                        </div>
                                        <p className="text-xs text-brand-text-muted font-mono bg-black/30 p-2 rounded border border-white/5 line-clamp-3 hover:line-clamp-none transition-all cursor-text select-all">
                                            {shot.midjourneyPrompt}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Hidden Input for Upload */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    aria-label="Upload Image"
                    title="Upload Image"
                />
            </div>
        </div>
    );
};

export default StoryboardModal;
