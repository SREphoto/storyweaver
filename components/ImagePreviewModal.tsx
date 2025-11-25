
import React from 'react';
import { DownloadIcon, SaveIcon, ImageIcon } from './icons';

interface ImagePreviewModalProps {
    imageUrl: string;
    title: string;
    onClose: () => void;
    onSetHeader: () => void;
    onSave: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, title, onClose, onSetHeader, onSave }) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `storyweaver_image_${safeTitle}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-brand-surface rounded-lg shadow-xl p-4 max-w-3xl w-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-serif text-brand-secondary truncate pr-4">Generated Image: {title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-2xl text-brand-text-muted hover:text-white transition"
                        aria-label="Close image preview"
                    >
                        &times;
                    </button>
                </div>
                <div className="bg-brand-bg rounded-md p-2">
                    <img 
                        src={imageUrl} 
                        alt={`AI-generated image for: ${title}`}
                        className="max-w-full max-h-[70vh] mx-auto rounded" 
                    />
                </div>
                <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t border-brand-primary">
                    <button 
                        onClick={onSetHeader}
                        className="flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-500 transition"
                    >
                        <ImageIcon className="w-5 h-5" />
                        Set as Header
                    </button>
                     <button
                        onClick={onSave}
                        className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition"
                    >
                        <SaveIcon className="w-5 h-5" />
                        Save to Materials
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal;