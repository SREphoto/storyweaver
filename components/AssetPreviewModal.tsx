import React, { useState } from 'react';
import Modal from './ui/Modal';
import { DownloadIcon, CopyIcon, CheckIcon } from './icons';

interface AssetPreviewModalProps {
    title: string;
    content: string | object;
    type: string;
    onClose: () => void;
}

const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({ title, content, type, onClose }) => {
    const [copied, setCopied] = useState(false);

    const displayContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(displayContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([displayContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={title}
            maxWidth="3xl"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-text transition border border-white/10"
                    >
                        {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-primary/50 hover:bg-brand-primary/20 text-brand-secondary transition"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Download
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30 uppercase tracking-widest">
                        {type.replace(/_/g, ' ')}
                    </span>
                </div>
                <div className="p-4 bg-black/30 rounded-xl border border-white/10 overflow-auto max-h-[60vh] custom-scrollbar shadow-inner">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-brand-text-muted leading-relaxed">
                        {displayContent}
                    </pre>
                </div>
            </div>
        </Modal>
    );
};

export default AssetPreviewModal;
