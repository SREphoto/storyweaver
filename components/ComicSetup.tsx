import React, { useState, useRef } from 'react';
import { ComicCharacter, Character } from '../types';
import { UserIcon, CameraIcon, WandSparklesIcon, ChevronRightIcon, CheckCircleIcon, ImportIcon } from './icons';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface ComicSetupProps {
    onComplete: (hero: ComicCharacter, costar: ComicCharacter, villain: ComicCharacter, genre: string) => void;
    existingCharacters: Character[];
}

const ComicSetup: React.FC<ComicSetupProps> = ({ onComplete, existingCharacters }) => {
    const [step, setStep] = useState(1);
    const [genre, setGenre] = useState('Superhero');
    const [hero, setHero] = useState<Partial<ComicCharacter>>({ role: 'hero' });
    const [costar, setCostar] = useState<Partial<ComicCharacter>>({ role: 'co-star' });
    const [villain, setVillain] = useState<Partial<ComicCharacter>>({ role: 'villain' });
    const [isGeneratingVillain, setIsGeneratingVillain] = useState(false);

    // Refs for file inputs
    const heroInputRef = useRef<HTMLInputElement>(null);
    const costarInputRef = useRef<HTMLInputElement>(null);
    const villainInputRef = useRef<HTMLInputElement>(null);

    const fileToB64 = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                if (typeof result === 'string') {
                    // Strip prefix if present
                    resolve(result.split(',')[1] || result);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, role: 'hero' | 'co-star' | 'villain') => {
        const file = e.target.files?.[0];
        if (file) {
            const b64 = await fileToB64(file);
            const updater = role === 'hero' ? setHero : role === 'co-star' ? setCostar : setVillain;
            updater(prev => ({ ...prev, image: b64 }));
        }
    };

    const handleImportCharacter = (charId: string, role: 'hero' | 'co-star' | 'villain') => {
        const char = existingCharacters.find(c => c.id === charId);
        if (char) {
            const updater = role === 'hero' ? setHero : role === 'co-star' ? setCostar : setVillain;
            
            let imageB64 = undefined;
            if (char.headerImage && char.headerImage.startsWith('data:image')) {
                imageB64 = char.headerImage.split(',')[1];
            }

            updater({ 
                name: char.name, 
                description: `${char.initialInfo} ${char.visualStats ? `Appearance: ${char.visualStats.height}, ${char.visualStats.build}, ${char.visualStats.distinguishingFeatures}` : ''}`,
                image: imageB64,
                role: role 
            });
        }
    }

    const handleAutoGenerateVillain = async () => {
        if (!hero.description) return;
        setIsGeneratingVillain(true);
        try {
            const v = await geminiService.generateVillain(hero.description, genre);
            setVillain({ name: v.name, description: v.desc, image: v.image, role: 'villain' });
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingVillain(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return !!hero.name && !!hero.description && !!hero.image;
        if (step === 2) return !!costar.name && !!costar.description && !!costar.image;
        if (step === 3) return !!villain.name && !!villain.description && !!villain.image;
        return false;
    };

    const next = () => {
        if (step < 3) setStep(step + 1);
        else onComplete(hero as ComicCharacter, costar as ComicCharacter, villain as ComicCharacter, genre);
    };

    const renderCharInput = (role: 'hero' | 'co-star' | 'villain', data: Partial<ComicCharacter>, setData: any, inputRef: React.RefObject<HTMLInputElement>) => (
        <div className="glass-panel p-8 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-banger text-brand-secondary uppercase tracking-wider drop-shadow-md">
                    Casting The {role}
                </h3>
                
                {existingCharacters.length > 0 && (
                    <div className="relative group">
                        <select 
                            className="appearance-none bg-brand-bg/50 border border-brand-primary/50 text-brand-text-muted text-sm rounded-lg px-4 py-2 pr-8 hover:text-white hover:border-brand-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
                            onChange={(e) => handleImportCharacter(e.target.value, role)}
                            defaultValue=""
                        >
                            <option value="" disabled>Import from Story...</option>
                            {existingCharacters.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-muted">
                            <ImportIcon className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Image Upload Section */}
                <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center gap-4">
                    <div 
                        onClick={() => inputRef.current?.click()}
                        className="relative w-64 h-64 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 hover:border-brand-secondary cursor-pointer group transition-all duration-300 shadow-2xl bg-black/20"
                    >
                        {data.image ? (
                            <>
                                <img src={`data:image/png;base64,${data.image}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={role} />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                                    <CameraIcon className="w-8 h-8" />
                                    <span className="font-bold text-sm uppercase tracking-wider">Change Photo</span>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-brand-text-muted group-hover:text-brand-secondary transition-colors gap-3">
                                <div className="p-4 bg-white/5 rounded-full group-hover:bg-brand-secondary/20 transition-colors">
                                    <UserIcon className="w-12 h-12" />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wider">Upload Portrait</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => inputRef.current?.click()}
                        className="text-xs bg-brand-primary/50 hover:bg-brand-secondary hover:text-white text-brand-text-muted px-4 py-2 rounded-full transition border border-white/5"
                    >
                        {data.image ? 'Replace Image' : 'Select Image File'}
                    </button>
                    <input 
                        type="file" 
                        ref={inputRef}
                        onChange={(e) => handleUpload(e, role)} 
                        className="hidden" 
                        accept="image/*" 
                    />
                </div>

                {/* Text Inputs */}
                <div className="flex-grow w-full space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-brand-text-muted uppercase tracking-wider mb-2">Character Name</label>
                        <input 
                            value={data.name || ''} 
                            onChange={e => setData({ ...data, name: e.target.value })}
                            className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 text-brand-text focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition text-lg font-medium"
                            placeholder={`Name the ${role}...`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-brand-text-muted uppercase tracking-wider mb-2">Visual Description</label>
                        <textarea 
                            value={data.description || ''} 
                            onChange={e => setData({ ...data, description: e.target.value })}
                            className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 text-brand-text focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition resize-none"
                            placeholder="Describe features, costume, colors, and accessories..."
                            rows={4}
                        />
                    </div>
                    
                    {role === 'villain' && step === 3 && (
                         <button 
                            onClick={handleAutoGenerateVillain}
                            disabled={isGeneratingVillain || !hero.description}
                            className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingVillain ? <LoadingSpinner /> : <WandSparklesIcon className="w-5 h-5" />}
                            {isGeneratingVillain ? 'Concocting Evil...' : 'Generate Villain based on Hero'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-5xl font-banger text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-accent drop-shadow-sm mb-2">
                    Infinite Heroes
                </h1>
                <p className="text-brand-text-muted font-serif text-lg">Assemble your cast and forge a legend.</p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center gap-4 mb-10">
                {['Hero', 'Co-Star', 'Villain'].map((label, i) => {
                    const isActive = step === i + 1;
                    const isCompleted = step > i + 1;
                    return (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-banger text-xl transition-all duration-300 ${isActive ? 'bg-brand-secondary text-white scale-110 shadow-lg shadow-brand-secondary/30' : isCompleted ? 'bg-green-500 text-white' : 'bg-brand-primary/30 text-brand-text-muted'}`}>
                                {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : i + 1}
                            </div>
                            <span className={`font-bold uppercase tracking-wider text-sm hidden md:block ${isActive ? 'text-white' : 'text-brand-text-muted/50'}`}>{label}</span>
                            {i < 2 && <div className="w-12 h-0.5 bg-white/10 mx-2 hidden md:block" />}
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="min-h-[500px]">
                {step === 1 && (
                    <>
                        <div className="mb-8 max-w-xs mx-auto">
                            <label className="block text-center text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">Comic Genre</label>
                            <select 
                                value={genre} 
                                onChange={e => setGenre(e.target.value)} 
                                className="w-full bg-brand-surface border border-brand-secondary/50 text-brand-text text-center font-banger text-xl py-2 rounded-xl focus:ring-2 focus:ring-brand-secondary"
                            >
                                <option>Superhero</option>
                                <option>Sci-Fi</option>
                                <option>Fantasy</option>
                                <option>Noir</option>
                                <option>Horror</option>
                                <option>Cyberpunk</option>
                            </select>
                        </div>
                        {renderCharInput('hero', hero, setHero, heroInputRef)}
                    </>
                )}

                {step === 2 && renderCharInput('co-star', costar, setCostar, costarInputRef)}

                {step === 3 && renderCharInput('villain', villain, setVillain, villainInputRef)}
            </div>

            {/* Navigation Footer */}
            <div className="mt-10 flex justify-end">
                <button 
                    onClick={next}
                    disabled={!canProceed()}
                    className="group flex items-center gap-3 bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-banger text-2xl px-10 py-4 rounded-xl shadow-lg shadow-brand-secondary/20 hover:scale-105 hover:shadow-brand-secondary/40 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                    {step === 3 ? 'LAUNCH CREATOR' : 'NEXT STEP'}
                    <ChevronRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ComicSetup;
