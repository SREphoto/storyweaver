
import React from 'react';
import { DownloadIcon, SaveIcon, ImageIcon, EditIcon } from './icons';
import Modal from './ui/Modal';
import PhotoEditor from './PhotoEditor';

interface ImagePreviewModalProps {
    imageUrl: string;
    title: string;
    onClose: () => void;
    onSetHeader?: () => void;
    onSave?: (editedUrl?: string) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, title, onClose, onSetHeader, onSave }) => {


    const [isEditing, setIsEditing] = React.useState(false);
    const [currentImageUrl, setCurrentImageUrl] = React.useState(imageUrl);

    // Reset currentImageUrl if the prop changes
    React.useEffect(() => {
        setCurrentImageUrl(imageUrl);
    }, [imageUrl]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentImageUrl;
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `storyweaver_image_${safeTitle}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveEdit = (newImageUrl: string) => {
        setCurrentImageUrl(newImageUrl);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Modal isOpen={true} onClose={onClose} title={`Edit Image: ${title}`} maxWidth="8xl">
                <div className="h-[80vh] w-full">
                    <PhotoEditor
                        imageUrl={currentImageUrl}
                        onSave={handleSaveEdit}
                        onCancel={() => setIsEditing(false)}
                    />
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={`Generated Image: ${title}`} maxWidth="3xl">
            <div className="overflow-hidden flex flex-col">
                <div className="bg-brand-bg rounded-md p-2 m-4 shrink-0">
                    <img
                        src={currentImageUrl}
                        alt={`AI-generated image for: ${title}`}
                        className="max-w-full max-h-[60vh] mx-auto rounded object-contain"
                    />
                </div>
                <div className="flex justify-center items-center gap-4 p-4 border-t border-white/10 bg-brand-bg/20 shrink-0 flex-wrap">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition"
                    >
                        <EditIcon className="w-5 h-5" />
                        Edit
                    </button>
                    {onSetHeader && (
                        <button
                            onClick={onSetHeader}
                            className="flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-500 transition"
                        >
                            <ImageIcon className="w-5 h-5" />
                            Set as Header
                        </button>
                    )}
                    {onSave && (
                        <button
                            onClick={() => onSave(currentImageUrl)}
                            className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition"
                        >
                            <SaveIcon className="w-5 h-5" />
                            Save to Materials
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImagePreviewModal;