
import React, { useState } from 'react';
import { WandSparklesIcon, BookOpenIcon, UserPlusIcon, WriteIcon, LightbulbIcon, ImageIcon, ArrowRightIcon, CheckCircleIcon, XIcon } from './icons';

interface OnboardingWalkthroughProps {
    onComplete: () => void;
}

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Story Weaver",
            description: "Your AI-powered creative writing partner. Designed to help you flesh out ideas, build deep characters, and weave compelling narratives from scratch or existing drafts.",
            icon: <WandSparklesIcon className="w-12 h-12 text-brand-secondary" />,
            color: "from-brand-secondary/20 to-purple-500/20"
        },
        {
            title: "Step 1: The Seed",
            description: "Start by entering your 'Story Premise' in the top left. This core idea guides the AI in every subsequent generation, ensuring consistency across your project.",
            icon: <BookOpenIcon className="w-12 h-12 text-sky-400" />,
            color: "from-sky-500/20 to-blue-600/20"
        },
        {
            title: "Step 2: The Cast",
            description: "Use the 'Character Builder' to create detailed profiles. Give them traits, backstories, and even analyze uploaded images to generate personality descriptions.",
            icon: <UserPlusIcon className="w-12 h-12 text-amber-400" />,
            color: "from-amber-400/20 to-orange-500/20"
        },
        {
            title: "Step 3: The Plot",
            description: "Structure your narrative in the 'Scenes' section. Organize them in the visual 'Timeline' at the bottom to perfect your pacing and flow.",
            icon: <WriteIcon className="w-12 h-12 text-teal-400" />,
            color: "from-teal-400/20 to-emerald-500/20"
        },
        {
            title: "Step 4: The Toolkit",
            description: "Stuck? Use the 'Writer's Toolkit' to generate chapters, write dialogue between characters, brainstorm plot twists, or connect scenes with transitions.",
            icon: <LightbulbIcon className="w-12 h-12 text-violet-400" />,
            color: "from-violet-400/20 to-purple-600/20"
        },
        {
            title: "Step 5: Visuals & World",
            description: "Bring your story to life. Generate evocative images for scenes and characters, and create a 'World Map' to ground your setting physically.",
            icon: <ImageIcon className="w-12 h-12 text-pink-400" />,
            color: "from-pink-400/20 to-rose-500/20"
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const current = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="glass-panel bg-brand-surface/90 rounded-2xl shadow-2xl w-full max-w-lg border border-white/10 overflow-hidden flex flex-col relative">
                {/* Background Glow based on step */}
                <div className={`absolute inset-0 bg-gradient-to-br ${current.color} opacity-50 transition-colors duration-500 pointer-events-none`} />

                <button 
                    onClick={onComplete} 
                    className="absolute top-4 right-4 text-brand-text-muted hover:text-white transition z-10"
                    title="Skip Tour"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="p-8 flex flex-col items-center text-center relative z-10 h-full">
                    <div className="mb-6 p-4 rounded-full bg-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/20 transition-all duration-300 transform hover:scale-110">
                        {current.icon}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-3 font-serif tracking-wide">{current.title}</h2>
                    <p className="text-brand-text-muted text-base leading-relaxed mb-8">{current.description}</p>

                    <div className="flex gap-2 mb-8">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-brand-secondary' : 'w-2 bg-white/20'}`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-between w-full mt-auto">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`px-4 py-2 text-sm font-medium text-brand-text-muted hover:text-white transition ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-opacity-90 transition shadow-lg shadow-brand-secondary/20"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>
                                    Get Started <CheckCircleIcon className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    Next <ArrowRightIcon className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWalkthrough;
