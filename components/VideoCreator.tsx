
import React, { useState } from 'react';
import { generateVideo } from '../services/videoService';
import { VideoIcon, WandSparklesIcon, ImportIcon, FilmIcon } from './icons'; // Assuming UploadIcon exists or use generic

const VideoCreator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setError(null);
        setVideoUrl(null);

        try {
            const url = await generateVideo(prompt, imageFile || undefined);
            setVideoUrl(url);
        } catch (err: any) {
            console.error("Video Generation Error", err);
            setError(err.message || "Failed to generate video");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
                        <VideoIcon className="w-10 h-10 text-brand-secondary" />
                        Video Creator <span className="text-sm bg-brand-secondary/20 text-brand-secondary px-2 py-1 rounded">VEO 3.1</span>
                    </h1>
                    <p className="text-gray-400">Generate cinematic videos from text prompts or images using Google's VEO 3.1 model.</p>
                </header>

                <div className="glass-panel p-6 rounded-xl space-y-6 border border-white/10">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your video scene in detail... (e.g., A cyberpunk city in rain, cinematic lighting, 4k)"
                            className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:ring-2 focus:ring-brand-secondary focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Reference Image (Optional)</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition">
                                <span className="text-gray-300">Upload Image</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                            {imageFile && (
                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {imageFile.name}
                                    <button onClick={() => setImageFile(null)} className="text-red-400 hover:text-red-300 ml-2">×</button>
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full bg-brand-secondary hover:bg-brand-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-secondary/20"
                    >
                        {isGenerating ? (
                            <>
                                <WandSparklesIcon className="w-5 h-5 animate-spin" />
                                Generating Video...
                            </>
                        ) : (
                            <>
                                <FilmIcon className="w-5 h-5" />
                                Generate Video
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-lg text-sm">
                            Error: {error}
                        </div>
                    )}
                </div>

                {videoUrl && (
                    <div className="glass-panel p-6 rounded-xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FilmIcon className="w-5 h-5 text-brand-secondary" />
                            Generated Result
                        </h2>
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                            <video
                                src={videoUrl}
                                controls
                                autoPlay
                                loop
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <a
                                href={videoUrl}
                                download={`generated-video-${Date.now()}.mp4`}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                                Download Video
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCreator;
