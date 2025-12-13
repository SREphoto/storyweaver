import React from 'react';
import Modal from './ui/Modal';
import OutputDisplay from './OutputDisplay';
import { GeneratedContent, Scene } from '../types';

interface OutputModalProps {
    generatedContent: GeneratedContent;
    onClose: () => void;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    onGenerateTimeline: (plotIdeas: string) => Promise<void>;
    onUpdateScene: (id: string, updates: Partial<Scene>) => void;
    onSave: (content: GeneratedContent) => void;
}

const OutputModal: React.FC<OutputModalProps> = ({
    generatedContent, onClose, isLoading, loadingMessage, error,
    onGenerateTimeline, onUpdateScene, onSave
}) => {
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={generatedContent.title || 'Generated Output'}
            maxWidth="4xl"
        >
            <div className="max-h-[70vh] flex flex-col">
                <OutputDisplay
                    generatedContent={generatedContent}
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                    error={error}
                    onGenerateTimeline={onGenerateTimeline}
                    onUpdateScene={onUpdateScene}
                    onSave={(content) => {
                        onSave(content);
                        onClose(); // Close modal after saving? Or let user choose? Let's keep it open or provide feedback.
                        // Actually, OutputDisplay usually has specific save buttons.
                        // If generic save is triggered, we can close or show success.
                    }}
                />
            </div>
        </Modal>
    );
};

export default OutputModal;
