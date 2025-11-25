
import React from 'react';
import { Beat } from '../types';
import { RefreshIcon, EditIcon, WandSparklesIcon } from './icons';

interface ComicPanelProps {
    imageUrl: string | undefined;
    narrative: Beat | undefined;
    pageIndex: number;
}

const ComicPanel: React.FC<ComicPanelProps> = ({ imageUrl, narrative, pageIndex }) => {
    
    // Ensure we have a valid base64 string to prevent broken image icons
    const validImage = imageUrl && imageUrl.length > 100;

    if (!validImage) {
        return (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center border-4 border-black p-4 text-center relative overflow-hidden">
                 {/* Comic halftone effect background */}
                 <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                 }}></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 mb-4 text-black animate-pulse">
                        <WandSparklesIcon className="w-full h-full" />
                    </div>
                    <p className="font-banger text-2xl text-black tracking-widest mb-2">INKING PAGE {pageIndex}...</p>
                    <p className="font-comic text-sm text-gray-600">The AI artist is drawing this panel.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative overflow-hidden border-4 border-black bg-white group">
            {/* Image Layer */}
            <img src={`data:image/jpeg;base64,${imageUrl}`} className="w-full h-full object-cover" alt={`Page ${pageIndex}`} />
            
            {/* Gloss Overlay */}
            <div className="gloss-overlay"></div>

            {/* Text Layer */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                
                {/* Caption Box */}
                {narrative?.caption && (
                    <div className="bg-brand-comic-yellow border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[80%] self-start transform -rotate-1">
                        <p className="font-comic font-bold text-sm uppercase text-black leading-snug">{narrative.caption}</p>
                    </div>
                )}

                {/* Speech Bubble */}
                {narrative?.dialogue && (
                    <div className="bg-white border-2 border-black p-4 rounded-[50%] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] self-end max-w-[70%] speech-bubble text-center mt-auto mb-12 mr-4">
                        <p className="font-comic font-bold text-base text-black leading-tight">{narrative.dialogue}</p>
                    </div>
                )}
            </div>

            {/* Page Number */}
            <div className="absolute bottom-2 right-2 font-banger text-black bg-white border border-black px-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20">
                {pageIndex}
            </div>

            {/* Edit Controls (Hover) */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-30">
                 <button className="bg-white border-2 border-black p-1.5 hover:bg-brand-comic-cyan hover:text-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none" title="Regenerate Image">
                    <RefreshIcon className="w-4 h-4" />
                 </button>
                 <button className="bg-white border-2 border-black p-1.5 hover:bg-brand-comic-yellow hover:text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none" title="Edit Text">
                    <EditIcon className="w-4 h-4" />
                 </button>
            </div>
        </div>
    );
};

export default ComicPanel;
