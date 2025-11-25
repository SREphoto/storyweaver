import React from 'react';
import { XIcon, CheckIcon, SunIcon, MoonIcon } from './icons';

export interface ThemeColor {
    name: string;
    primary: string; // RGB triplet
    secondary: string; // RGB triplet
    accent: string; // RGB triplet
    hex: string; // For display
}

export const THEMES: ThemeColor[] = [
    {
        name: 'Cosmic (Default)',
        primary: '99 102 241', // Indigo 500
        secondary: '139 92 246', // Violet 500
        accent: '56 189 248', // Sky 400
        hex: '#8B5CF6'
    },
    {
        name: 'Nature',
        primary: '16 185 129', // Emerald 500
        secondary: '5 150 105', // Emerald 600
        accent: '132 204 22', // Lime 500
        hex: '#10B981'
    },
    {
        name: 'Sunset',
        primary: '249 115 22', // Orange 500
        secondary: '234 88 12', // Orange 600
        accent: '251 113 133', // Rose 400
        hex: '#F97316'
    },
    {
        name: 'Ocean',
        primary: '59 130 246', // Blue 500
        secondary: '37 99 235', // Blue 600
        accent: '34 211 238', // Cyan 400
        hex: '#3B82F6'
    },
    {
        name: 'Berry',
        primary: '219 39 119', // Pink 600
        secondary: '190 24 93', // Pink 700
        accent: '244 114 182', // Pink 400
        hex: '#DB2777'
    },
];

interface ThemeSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: 'dark' | 'light';
    onToggleTheme: () => void;
    currentThemeColorName: string;
    onSelectThemeColor: (theme: ThemeColor) => void;
}

const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
    isOpen,
    onClose,
    currentTheme,
    onToggleTheme,
    currentThemeColorName,
    onSelectThemeColor
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-brand-surface border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-brand-text-muted hover:text-white transition"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-serif font-bold text-brand-text mb-6">Appearance</h2>

                <div className="space-y-8">
                    {/* Mode Toggle */}
                    <div>
                        <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider mb-3">Display Mode</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => currentTheme !== 'light' && onToggleTheme()}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${currentTheme === 'light' ? 'bg-brand-secondary/10 border-brand-secondary text-brand-secondary' : 'bg-white/5 border-transparent text-brand-text-muted hover:bg-white/10'}`}
                            >
                                <SunIcon className="w-6 h-6" />
                                <span className="font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => currentTheme !== 'dark' && onToggleTheme()}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${currentTheme === 'dark' ? 'bg-brand-secondary/10 border-brand-secondary text-brand-secondary' : 'bg-white/5 border-transparent text-brand-text-muted hover:bg-white/10'}`}
                            >
                                <MoonIcon className="w-6 h-6" />
                                <span className="font-medium">Dark</span>
                            </button>
                        </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                        <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider mb-3">Accent Color</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => onSelectThemeColor(theme)}
                                    className={`group relative w-full aspect-square rounded-full flex items-center justify-center transition-transform hover:scale-110 ${currentThemeColorName === theme.name ? 'ring-2 ring-white ring-offset-2 ring-offset-brand-bg' : ''}`}
                                    style={{ backgroundColor: theme.hex }}
                                    title={theme.name}
                                >
                                    {currentThemeColorName === theme.name && (
                                        <CheckIcon className="w-5 h-5 text-white drop-shadow-md" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettingsModal;
