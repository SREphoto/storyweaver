
import React, { useState } from 'react';
import { ComicFace } from '../types';
import ComicPanel from './ComicPanel';

interface ComicBookProps {
    faces: ComicFace[];
}

const ComicBook: React.FC<ComicBookProps> = ({ faces }) => {
    const [currentPage, setCurrentPage] = useState(0); // 0 = cover closed

    // Organize faces into sheets (front + back)
    // Sheet 0: Cover (Front) + Page 1 (Back)
    // Sheet 1: Page 2 (Front) + Page 3 (Back)
    // ...
    const sheets = [];
    for (let i = 0; i < faces.length; i += 2) {
        sheets.push({
            front: faces[i],
            back: faces[i + 1]
        });
    }

    const handleFlip = () => {
        if (currentPage < sheets.length) {
            setCurrentPage(currentPage + 1);
        } else {
            // Reset for demo purposes or loop
            // setCurrentPage(0);
        }
    };
    
    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="w-full h-full flex items-center justify-center comic-scene overflow-hidden bg-slate-900 p-8">
            <div className={`book w-[300px] h-[450px] md:w-[400px] md:h-[600px] ${currentPage > 0 ? 'translate-x-[50%]' : ''}`}>
                {/* Back Cover Static */}
                <div className="absolute inset-0 bg-white border-l-4 border-gray-300 rounded-r-lg shadow-2xl" style={{ transform: 'translateZ(-2px)' }}></div>

                {sheets.map((sheet, index) => {
                    const zIndex = sheets.length - index;
                    const isFlipped = index < currentPage;
                    
                    return (
                        <div 
                            key={index}
                            className={`paper cursor-pointer ${isFlipped ? 'flipped' : ''}`}
                            style={{ zIndex: isFlipped ? index : zIndex }}
                            onClick={handleFlip}
                        >
                            {/* Front Face */}
                            <div className="front border-l border-gray-200">
                                <ComicPanel 
                                    imageUrl={sheet.front?.imageUrl} 
                                    narrative={sheet.front?.narrative} 
                                    pageIndex={sheet.front?.pageIndex || 0}
                                />
                                {sheet.front?.type === 'cover' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <h1 className="font-banger text-6xl text-brand-comic-yellow drop-shadow-[4px_4px_0px_#000] stroke-black">INFINITE</h1>
                                        <h1 className="font-banger text-6xl text-white drop-shadow-[4px_4px_0px_#000]">HEROES</h1>
                                        <div className="mt-8 bg-brand-comic-red text-white font-banger px-4 py-1 border-2 border-black transform rotate-3">TAP TO OPEN</div>
                                    </div>
                                )}
                            </div>

                            {/* Back Face */}
                            <div className="back border-r border-gray-200" onClick={handlePrev}>
                                {sheet.back ? (
                                    <ComicPanel 
                                        imageUrl={sheet.back?.imageUrl} 
                                        narrative={sheet.back?.narrative} 
                                        pageIndex={sheet.back?.pageIndex || 0}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white flex items-center justify-center font-banger text-2xl">THE END</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                 <button onClick={(e) => {e.stopPropagation(); if(currentPage > 0) setCurrentPage(currentPage-1)}} className="bg-white border-2 border-black font-banger px-4 py-2 hover:bg-gray-100 disabled:opacity-50" disabled={currentPage===0}>PREV</button>
                 <button onClick={(e) => {e.stopPropagation(); if(currentPage < sheets.length) setCurrentPage(currentPage+1)}} className="bg-brand-comic-cyan border-2 border-black font-banger px-4 py-2 hover:brightness-110 disabled:opacity-50" disabled={currentPage===sheets.length}>NEXT</button>
            </div>
        </div>
    );
};

export default ComicBook;
