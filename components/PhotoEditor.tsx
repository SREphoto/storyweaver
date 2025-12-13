
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    SaveIcon, XIcon, RotateCcwIcon, SunIcon,
    RefreshIcon, ArrowLeftIcon, ArrowRightIcon,
    ArrowUpIcon, ArrowDownIcon
} from './icons';

interface PhotoEditorProps {
    imageUrl: string;
    onSave: (editedImageUrl: string) => void;
    onCancel: () => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ imageUrl, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [loading, setLoading] = useState(true);

    const applyFilters = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            // Set canvas size based on rotation
            if (rotation % 180 === 0) {
                canvas.width = img.width;
                canvas.height = img.height;
            } else {
                canvas.width = img.height;
                canvas.height = img.width;
            }

            // Clear and prepare context
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

            ctx.save();

            // Translate to center for rotation/flip
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // Rotate
            ctx.rotate((rotation * Math.PI) / 180);

            // Flip
            ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

            // Draw image centered
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            ctx.restore();
            setLoading(false);
        };
    }, [imageUrl, brightness, contrast, saturation, rotation, flipH, flipV]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    const handleReset = () => {
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
            {/* Toolbar Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
                <h3 className="text-white font-bold text-lg">Photo Editor</h3>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="p-2 text-slate-400 hover:text-white transition" title="Reset" aria-label="Reset Filters">
                        <RefreshIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onCancel} className="p-2 text-slate-400 hover:text-red-400 transition" title="Cancel" aria-label="Close Editor">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Canvas Preview */}
                <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-slate-950">
                    <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full object-contain shadow-lg border border-slate-800"
                    />
                    {loading && <div className="text-white absolute">Loading Image...</div>}
                </div>

                {/* Controls Sidebar */}
                <div className="w-80 bg-slate-800 border-l border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto">

                    {/* Filters Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-600 pb-2">
                            <SunIcon className="w-4 h-4" />
                            <span>Adjustments</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <label>Brightness</label>
                                <span>{brightness}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                                className="w-full accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Brightness"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <label>Contrast</label>
                                <span>{contrast}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={contrast}
                                onChange={(e) => setContrast(Number(e.target.value))}
                                className="w-full accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Contrast"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <label>Saturation</label>
                                <span>{saturation}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={saturation}
                                onChange={(e) => setSaturation(Number(e.target.value))}
                                className="w-full accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Saturation"
                            />
                        </div>
                    </div>

                    {/* Transform Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-600 pb-2">
                            <RotateCcwIcon className="w-4 h-4" />
                            <span>Transform</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setRotation((r) => (r - 90) % 360)}
                                className="flex flex-col items-center justify-center p-3 bg-slate-700 rounded hover:bg-slate-600 text-slate-300 text-xs transition"
                            >
                                <RotateCcwIcon className="w-5 h-5 mb-1" />
                                Rotate Left
                            </button>
                            <button
                                onClick={() => setRotation((r) => (r + 90) % 360)}
                                className="flex flex-col items-center justify-center p-3 bg-slate-700 rounded hover:bg-slate-600 text-slate-300 text-xs transition scale-x-[-1]"
                            >
                                <RotateCcwIcon className="w-5 h-5 mb-1" />
                                <span className="scale-x-[-1]">Rotate Right</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFlipH(!flipH)}
                                className={`flex flex-col items-center justify-center p-3 rounded text-slate-300 text-xs transition ${flipH ? 'bg-purple-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                            >
                                <div className="flex gap-1 mb-1">
                                    <ArrowLeftIcon className="w-4 h-4" />
                                    <ArrowRightIcon className="w-4 h-4" />
                                </div>
                                Flip H
                            </button>
                            <button
                                onClick={() => setFlipV(!flipV)}
                                className={`flex flex-col items-center justify-center p-3 rounded text-slate-300 text-xs transition ${flipV ? 'bg-purple-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                            >
                                <div className="flex gap-1 mb-1">
                                    <ArrowUpIcon className="w-4 h-4" />
                                    <ArrowDownIcon className="w-4 h-4" />
                                </div>
                                Flip V
                            </button>
                        </div>
                    </div>

                    <div className="flex-1"></div>

                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-500 hover:to-blue-500 transition shadow-lg"
                    >
                        <SaveIcon className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhotoEditor;
