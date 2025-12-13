
import React, { useState, useEffect } from 'react';
import { EditIcon } from './icons';

interface WordCountTrackerProps {
    currentCount: number;
}

const WordCountTracker: React.FC<WordCountTrackerProps> = ({ currentCount }) => {
    const [dailyGoal, setDailyGoal] = useState(2000);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState("2000");

    // Calculate progress percentage, capped at 100%
    const progress = Math.min(100, Math.max(0, (currentCount / dailyGoal) * 100));

    const handleGoalUpdate = () => {
        const parsed = parseInt(tempGoal, 10);
        if (!isNaN(parsed) && parsed > 0) {
            setDailyGoal(parsed);
        }
        setIsEditing(false);
    };

    return (
        <div className="bg-brand-surface/50 border border-brand-primary/30 rounded-lg p-3 flex items-center gap-3 shadow-lg backdrop-blur-sm min-w-[200px]">
            <div className="flex-grow flex flex-col gap-1">
                <div className="flex justify-between items-end text-xs">
                    <span className="text-brand-text-muted font-bold uppercase tracking-wider">Daily Goal</span>
                    <div className="flex items-center gap-1">
                        <span className="text-brand-text font-mono font-medium">{currentCount}</span>
                        <span className="text-brand-text-muted">/</span>
                        {isEditing ? (
                            <input
                                type="number"
                                value={tempGoal}
                                onChange={(e) => setTempGoal(e.target.value)}
                                onBlur={handleGoalUpdate}
                                onKeyDown={(e) => e.key === 'Enter' && handleGoalUpdate()}
                                className="w-12 bg-black/30 border border-brand-primary/50 rounded px-1 text-right text-xs text-brand-text focus:outline-none focus:border-brand-secondary"
                                autoFocus
                                aria-label="Daily word count goal"
                            />
                        ) : (
                            <span
                                onClick={() => setIsEditing(true)}
                                className="text-brand-text-muted hover:text-brand-secondary cursor-pointer border-b border-transparent hover:border-brand-secondary/50 transition"
                                title="Click to edit goal"
                            >
                                {dailyGoal}
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-brand-secondary to-purple-500 transition-all duration-500 ease-out w-[var(--width)]"
                        style={{ '--width': `${progress}%` } as React.CSSProperties}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default WordCountTracker;
