
import React, { useEffect, useRef } from 'react';

interface SoundManagerProps {
    pageIndex: number;
    genre: string;
}

const SoundManager: React.FC<SoundManagerProps> = ({ pageIndex, genre }) => {
    const audioCtx = useRef<AudioContext | null>(null);

    useEffect(() => {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            audioCtx.current?.close();
        };
    }, []);

    const playSwoosh = () => {
        if (!audioCtx.current) return;
        const ctx = audioCtx.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    };

    const playMood = () => {
        if (!audioCtx.current) return;
        const ctx = audioCtx.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        if (genre.toLowerCase().includes('horror')) {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(50, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        } else if (genre.toLowerCase().includes('comedy')) {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        } else {
             // Action / Default
             osc.type = 'square';
             osc.frequency.setValueAtTime(100, ctx.currentTime);
             gain.gain.setValueAtTime(0.05, ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2);
    };

    useEffect(() => {
        if (pageIndex > 0) {
            playSwoosh();
            if (Math.random() > 0.7) playMood(); // Occasional mood sound
        }
    }, [pageIndex]);

    return null;
};

export default SoundManager;
