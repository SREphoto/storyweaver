
import React, { useState } from 'react';
import { VideoIcon } from './icons';

interface VideoUploaderProps {
  onAnalyze: (videoFile: File | null, videoUrl: string, prompt: string) => void;
  isLoading: boolean;
}

const videoTemplates = [
    { name: 'Story Ideas', prompt: 'Generate some potential story ideas, themes, and character concepts based on this video.' },
    { name: 'Scene Description', prompt: 'Analyze the cinematography, color palette, and setting in this video to create a rich, descriptive scene for a story.' },
    { name: 'Character Study', prompt: 'Based on the main figure in this video, create a character profile, including their likely motivations, flaws, and backstory.' },
];

const VideoUploader: React.FC<VideoUploaderProps> = ({ onAnalyze, isLoading }) => {
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('Generate some potential story ideas, themes, and character concepts based on this video.');
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setError('');
    }
  };

  const handleSubmit = () => {
    if (uploadType === 'file' && !videoFile) {
      setError('Please select a video file to upload.');
      return;
    }
    if (uploadType === 'url' && !videoUrl.trim()) {
      setError('Please enter a YouTube URL.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please provide a prompt for the analysis.');
      return;
    }
    setError('');
    onAnalyze(uploadType === 'file' ? videoFile : null, uploadType === 'url' ? videoUrl : '', prompt);
  };
  
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex bg-brand-bg/40 rounded-lg p-1 border border-white/5">
        <button 
          onClick={() => setUploadType('file')}
          className={`w-1/2 py-1.5 rounded-md text-sm font-semibold transition ${uploadType === 'file' ? 'bg-brand-secondary text-white shadow-sm' : 'text-brand-text-muted hover:text-white'}`}
        >
          Upload Video
        </button>
        <button 
          onClick={() => setUploadType('url')}
          className={`w-1/2 py-1.5 rounded-md text-sm font-semibold transition ${uploadType === 'url' ? 'bg-brand-secondary text-white shadow-sm' : 'text-brand-text-muted hover:text-white'}`}
        >
          YouTube URL
        </button>
      </div>
      
      {uploadType === 'file' ? (
        <div>
          <label htmlFor="video-upload" className="block text-xs font-bold text-brand-text-muted mb-2 uppercase tracking-wider">Video File</label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full text-sm text-brand-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/50 file:text-brand-secondary hover:file:bg-brand-primary transition cursor-pointer"
          />
          {videoFile && <p className="text-xs text-brand-text-muted mt-2 pl-1">Selected: <span className="text-brand-text">{videoFile.name}</span></p>}
        </div>
      ) : (
        <div>
          <label htmlFor="video-url" className="block text-xs font-bold text-brand-text-muted mb-2 uppercase tracking-wider">YouTube Video URL</label>
          <input
            id="video-url"
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
          />
        </div>
      )}

      <div>
        <label htmlFor="video-prompt" className="block text-xs font-bold text-brand-text-muted mb-2 uppercase tracking-wider">Analysis Prompt</label>
        <textarea
          id="video-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
        />
        <div className="flex flex-wrap gap-2 mt-3">
            {videoTemplates.map(template => (
                <button
                    key={template.name}
                    type="button"
                    onClick={() => setPrompt(template.prompt)}
                    className="text-xs bg-brand-primary/40 border border-brand-primary/50 text-brand-text-muted px-2.5 py-1 rounded-full hover:bg-brand-secondary hover:text-white hover:border-brand-secondary transition"
                >
                    {template.name}
                </button>
            ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-500/20">{error}</p>}
      
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-purple-600/90 text-white font-bold py-3 px-4 rounded-xl hover:bg-purple-500 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
      >
        <VideoIcon className="w-5 h-5" />
        {isLoading ? 'Analyzing...' : 'Analyze for Inspiration'}
      </button>
    </div>
  );
};

export default VideoUploader;
