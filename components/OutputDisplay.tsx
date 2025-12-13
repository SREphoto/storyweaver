
import React, { useMemo, useState } from 'react';
import { GeneratedContent, TimelineItem, Tool, RelationshipWebData, CharacterType, StoryObject, OutlineItem, Scene } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { BookOpenIcon, TimelineIcon, ClipboardIcon, DownloadIcon, MapIcon, ClipboardListIcon } from './icons';

const getCharacterColor = (type: CharacterType) => {
    // ... (previous code remains unchanged)
    switch (type) {
        case CharacterType.PROTAGONIST: return '#fbbF24'; // amber-400
        case CharacterType.ANTAGONIST: return '#f87171'; // red-400
        case CharacterType.DEUTERAGONIST: return '#6ee7b7'; // emerald-300
        case CharacterType.MENTOR: return '#60a5fa'; // blue-400
        case CharacterType.LOVE_INTEREST: return '#f472b6'; // pink-400
        case CharacterType.FOIL: return '#c084fc'; // purple-400
        default: return '#9ca3af'; // gray-400
    }
}

// ... (RelationshipVisualizer code remains unchanged)
const RelationshipVisualizer: React.FC<{ data: RelationshipWebData }> = ({ data }) => {
    const width = 400;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    const nodePositions = useMemo(() => {
        const positions = new Map<string, { x: number; y: number }>();
        const angleStep = (2 * Math.PI) / data.nodes.length;
        data.nodes.forEach((node, index) => {
            const x = centerX + radius * Math.cos(index * angleStep - Math.PI / 2);
            const y = centerY + radius * Math.sin(index * angleStep - Math.PI / 2);
            positions.set(node.id, { x, y });
        });
        return positions;
    }, [data.nodes, centerX, centerY, radius]);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Links */}
            {data.links.map((link, index) => {
                const sourcePos = nodePositions.get(link.source);
                const targetPos = nodePositions.get(link.target);
                if (!sourcePos || !targetPos) return null;

                const midX = (sourcePos.x + targetPos.x) / 2;
                const midY = (sourcePos.y + targetPos.y) / 2;

                const lineStyle = {
                    stroke: "#4b5563", // gray-600
                    strokeWidth: link.strength === 'Strong' ? 2 : 1,
                    strokeDasharray: link.strength === 'Weak' ? "4 2" : "none",
                };

                return (
                    <g key={`${link.source}-${link.target}-${index}`}>
                        <line
                            x1={sourcePos.x}
                            y1={sourcePos.y}
                            x2={targetPos.x}
                            y2={targetPos.y}
                            style={lineStyle}
                        />
                        <text
                            x={midX}
                            y={midY}
                            fill="#d1d5db" // gray-300
                            fontSize="8"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="font-sans"
                            paintOrder="stroke"
                            stroke="#16213e"
                            strokeWidth="2px"
                            strokeLinecap="butt"
                            strokeLinejoin="miter"
                        >
                            {link.dynamic}
                        </text>
                    </g>
                );
            })}

            {/* Nodes */}
            {data.nodes.map(node => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                const color = getCharacterColor(node.type);
                return (
                    <g key={node.id}>
                        <circle cx={pos.x} cy={pos.y} r="15" fill={color} stroke="#16213e" strokeWidth="2" />
                        <text
                            x={pos.x}
                            y={pos.y + 25}
                            fill="#f3f4f6" // gray-100
                            fontSize="10"
                            textAnchor="middle"
                            className="font-bold font-serif"
                        >
                            {node.name}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

interface OutputDisplayProps {
    generatedContent: GeneratedContent | null;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    onGenerateTimeline: (plotIdeas: string) => void;
    onUpdateScene?: (sceneId: string, updates: Partial<Scene>) => void;
    onSave?: (content: GeneratedContent) => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({
    generatedContent,
    isLoading,
    loadingMessage,
    error,
    onGenerateTimeline,
    onUpdateScene,
    onSave
}) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const [isApplied, setIsApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const getContentAsText = () => {
        if (!generatedContent?.content) return '';
        const { content, type } = generatedContent;
        if (typeof content === 'string') {
            return content;
        }
        if (Array.isArray(content)) {
            if (type === 'OUTLINE') {
                const outlineItems = content as OutlineItem[];
                let text = '';
                let currentAct = '';
                outlineItems.forEach(item => {
                    if (item.act !== currentAct) {
                        currentAct = item.act;
                        text += `\n## ${currentAct} ##\n\n`;
                    }
                    text += `Title: ${item.title}\nSummary: ${item.summary}\n\n`;
                });
                return text;
            }
            return content.map((item: any) => `Title: ${item.title}\nSummary: ${item.summary}`).join('\n\n');
        }
        if (typeof content === 'object') {
            if ('name' in content && 'appearance' in content) {
                const obj = content as StoryObject;
                return `Name: ${obj.name}\n\nAppearance: ${obj.appearance}\n\nHistory: ${obj.history}\n\nSignificance: ${obj.significance}`;
            }
            return JSON.stringify(content, null, 2);
        }
        return '';
    };

    const handleCopy = () => {
        const textToCopy = getContentAsText();
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        }
    };

    const handleDownload = () => {
        const textToDownload = getContentAsText();
        if (textToDownload) {
            const blob = new Blob([textToDownload], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeTitle = generatedContent?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated_content';
            a.download = `${safeTitle}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };


    const handleGenerateTimelineClick = () => {
        if (typeof generatedContent?.content === 'string') {
            onGenerateTimeline(generatedContent.content);
        }
    };

    const handleApplyToScene = () => {
        if (generatedContent && generatedContent.type === Tool.SETTING_GENERATOR && generatedContent.sourceId && onUpdateScene && typeof generatedContent.content === 'string') {
            onUpdateScene(generatedContent.sourceId, { settingDescription: generatedContent.content });
            setIsApplied(true);
            setTimeout(() => setIsApplied(false), 3000);
        }
    };

    const renderContent = () => {
        if (!generatedContent) return null;

        if (generatedContent.type === 'RELATIONSHIP_WEB_VISUAL' && typeof generatedContent.content === 'object' && 'nodes' in generatedContent.content) {
            return <RelationshipVisualizer data={generatedContent.content as RelationshipWebData} />;
        }

        if (generatedContent.type === Tool.OUTLINE_GENERATOR && Array.isArray(generatedContent.content)) {
            // ... (Outline Logic)
            const outlineItems = generatedContent.content as OutlineItem[];
            const groupedByAct = outlineItems.reduce((acc, item) => {
                (acc[item.act] = acc[item.act] || []).push(item);
                return acc;
            }, {} as Record<string, OutlineItem[]>);

            return (
                <div className="space-y-4">
                    {Object.entries(groupedByAct).map(([act, items]) => (
                        <div key={act}>
                            <h4 className="text-lg font-bold text-brand-secondary font-serif mb-2 border-b border-brand-primary/50 pb-1">{act}</h4>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="bg-brand-bg/40 p-3 rounded-lg border-l-4 border-brand-primary hover:bg-brand-bg/60 transition">
                                        <h5 className="font-bold text-brand-text">{item.title}</h5>
                                        <p className="text-sm text-brand-text-muted font-serif mt-1">{item.summary}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (generatedContent.type === 'OBJECT_DATA' && typeof generatedContent.content === 'object' && 'name' in generatedContent.content) {
            // ... (Object Logic)
            const objectData = generatedContent.content as StoryObject;
            return (
                <div className="space-y-4 text-brand-text-muted font-serif">
                    <div className="bg-brand-bg/30 p-3 rounded-lg border border-brand-primary/20">
                        <h4 className="font-bold text-brand-text text-sm uppercase tracking-wider mb-1">Appearance</h4>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{objectData.appearance}</p>
                    </div>
                    <div className="bg-brand-bg/30 p-3 rounded-lg border border-brand-primary/20">
                        <h4 className="font-bold text-brand-text text-sm uppercase tracking-wider mb-1">History</h4>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{objectData.history}</p>
                    </div>
                    <div className="bg-brand-bg/30 p-3 rounded-lg border border-brand-primary/20">
                        <h4 className="font-bold text-brand-text text-sm uppercase tracking-wider mb-1">Significance</h4>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{objectData.significance}</p>
                    </div>
                </div>
            );
        }

        if (generatedContent.type === 'TIMELINE' && typeof generatedContent.content === 'string') {
            return (
                <p className="whitespace-pre-wrap font-serif leading-relaxed text-brand-secondary/90">
                    {generatedContent.content}
                </p>
            );
        }

        if (Array.isArray(generatedContent.content)) {
            return (
                <div className="space-y-3">
                    {(generatedContent.content as TimelineItem[]).map((item, index) => (
                        <div key={index} className="bg-brand-bg/40 p-3 rounded-lg border-l-4 border-brand-secondary hover:bg-brand-bg/60 transition">
                            <h4 className="font-bold text-brand-text">{item.title}</h4>
                            <p className="text-sm text-brand-text-muted font-serif mt-1">{item.summary}</p>
                        </div>
                    ))}
                </div>
            );
        }

        // Default to rendering as Markdown-like text
        let formattedContent = (generatedContent.content as string)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br />');

        return (
            <div
                className="prose prose-invert max-w-none prose-p:text-brand-text prose-strong:text-brand-text-muted whitespace-pre-wrap font-serif leading-relaxed text-base"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    {generatedContent && !isLoading && (
                        <>
                            <button onClick={handleCopy} title="Copy to Clipboard" className="text-brand-text-muted hover:text-white transition bg-brand-bg/40 p-2 rounded-full hover:bg-brand-bg/60">
                                {copyStatus === 'copied' ? <span className="text-xs text-green-400 font-bold px-1">Copied!</span> : <ClipboardIcon className="w-4 h-4" />}
                            </button>
                            <button onClick={handleDownload} title="Download as Text" className="text-brand-text-muted hover:text-white transition bg-brand-bg/40 p-2 rounded-full hover:bg-brand-bg/60">
                                <DownloadIcon className="w-4 h-4" />
                            </button>
                            {onSave && (
                                <button
                                    onClick={() => {
                                        if (generatedContent) {
                                            onSave(generatedContent);
                                            setIsSaved(true);
                                            setTimeout(() => setIsSaved(false), 2000);
                                        }
                                    }}
                                    title="Save to Materials"
                                    className={`text-brand-text-muted hover:text-white transition bg-brand-bg/40 p-2 rounded-full hover:bg-brand-bg/60 ${isSaved ? 'text-green-400' : ''}`}
                                >
                                    {isSaved ? <span className="text-xs font-bold px-1">Saved!</span> : <ClipboardListIcon className="w-4 h-4" />}
                                </button>
                            )}
                            {/* ADD TO SCENE BUTTON */}
                            {generatedContent.type === Tool.SETTING_GENERATOR && generatedContent.sourceId && (
                                <button
                                    onClick={handleApplyToScene}
                                    disabled={isApplied}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${isApplied ? 'bg-green-500/20 text-green-400' : 'bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary hover:text-white'}`}
                                >
                                    <MapIcon className="w-3 h-3" />
                                    {isApplied ? 'Updated Scene!' : 'Update Scene Setting'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="bg-brand-primary/30 rounded-xl border border-brand-primary/40 flex-grow p-6 overflow-y-auto relative min-h-[200px] custom-scrollbar shadow-inner">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-surface/80 backdrop-blur-sm z-10 rounded-xl">
                        <LoadingSpinner />
                        <p className="mt-3 text-brand-text-muted font-medium animate-pulse">{loadingMessage || 'Weaving magic...'}</p>
                    </div>
                )}
                {error && <div className="text-red-400 p-4 bg-red-900/30 border border-red-500/30 rounded-xl whitespace-pre-wrap">{error}</div>}

                {!isLoading && !error && !generatedContent && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-muted/50">
                        <BookOpenIcon className="w-20 h-20 mb-4 opacity-20" />
                        <p className="text-lg font-semibold">Your story awaits.</p>
                        <p className="text-sm opacity-70">Select a tool to start generating content.</p>
                    </div>
                )}

                {generatedContent && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-brand-secondary font-serif border-b border-white/10 pb-2">{generatedContent.title}</h3>
                        {renderContent()}

                        {generatedContent.type === Tool.PLOT_IDEAS && !isLoading && (
                            <div className="pt-6 text-center">
                                <button
                                    onClick={handleGenerateTimelineClick}
                                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-full transition duration-300 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    <TimelineIcon className="w-5 h-5" />
                                    Generate Story Timeline
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputDisplay;