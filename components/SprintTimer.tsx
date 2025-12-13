
import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, RotateCcwIcon, TimerIcon } from './icons';

interface SprintTimerProps {
    onComplete?: () => void;
}

const SprintTimer: React.FC<SprintTimerProps> = ({ onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(15 * 60); // Default 15 mins
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(15);
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            setIsActive(false);
            if (interval) clearInterval(interval);
            if (onComplete) onComplete();
            // Play sound or notification here if needed
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, onComplete]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration * 60);
    };

    const handleDurationChange = (newDuration: number) => {
        setDuration(newDuration);
        setTimeLeft(newDuration * 60);
        setIsActive(false);
        setIsCustom(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-brand-surface/50 border border-brand-primary/30 rounded-lg p-3 flex items-center gap-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-brand-secondary">
                <TimerIcon className="w-5 h-5" />
                <span className="font-mono text-xl font-bold tracking-wider">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={toggleTimer}
                    className={`p-1.5 rounded-md transition ${isActive ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                    title={isActive ? "Pause Sprint" : "Start Sprint"}
                >
                    {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="p-1.5 rounded-md text-brand-text-muted hover:text-white hover:bg-white/10 transition"
                    title="Reset Timer"
                >
                    <RotateCcwIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <div className="flex items-center gap-1 text-xs">
                {[15, 30, 60].map(mins => (
                    <button
                        key={mins}
                        onClick={() => handleDurationChange(mins)}
                        className={`px-2 py-1 rounded transition ${duration === mins && !isCustom ? 'bg-brand-secondary text-white font-bold' : 'text-brand-text-muted hover:text-white hover:bg-white/5'}`}
                    >
                        {mins}m
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SprintTimer;
