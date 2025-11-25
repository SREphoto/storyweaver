
import React, { useMemo } from 'react';
import { CheckCircleIcon } from './icons';

interface ArcVisualizerProps {
  arcText: string;
}

const arcStages = [
  { name: 'The Beginning', keywords: ['begin', 'start', 'introduce', 'ordinary world', 'inciting incident', 'status quo'], color: 'from-sky-400 to-blue-500' },
  { name: 'Rising Action', keywords: ['struggle', 'challenge', 'conflict', 'rising stakes', 'faces', 'learns', 'trials'], color: 'from-yellow-400 to-orange-500' },
  { name: 'The Climax', keywords: ['climax', 'confrontation', 'peak', 'turning point', 'overcomes', 'battle', 'choice'], color: 'from-red-500 to-rose-600' },
  { name: 'Falling Action', keywords: ['aftermath', 'consequences', 'fallout', 'resolves', 'return'], color: 'from-orange-400 to-amber-500' },
  { name: 'Resolution', keywords: ['resolution', 'end', 'new beginning', 'changes', 'lesson', 'changed'], color: 'from-emerald-400 to-green-600' },
];

const ArcVisualizer: React.FC<ArcVisualizerProps> = ({ arcText }) => {
  const detectedStages = useMemo(() => {
    const lowerCaseText = arcText.toLowerCase();
    const found = new Set<string>();
    arcStages.forEach(stage => {
      if (stage.keywords.some(kw => lowerCaseText.includes(kw))) {
        found.add(stage.name);
      }
    });
    return found;
  }, [arcText]);

  if (detectedStages.size === 0) {
    return (
        <div className="mt-2 text-xs text-brand-text-muted italic bg-brand-bg/50 p-2 rounded-md border border-white/5">
            Add more detail to the character's arc (e.g., mention their "struggle," "climax," or "resolution") to visualize their journey.
        </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">Journey Arc</h4>
      
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-white/10 rounded-full -z-10"></div>
        
        <div className="flex justify-between items-start">
            {arcStages.map((stage, index) => {
                const isActive = detectedStages.has(stage.name);
                return (
                    <div key={stage.name} className="flex flex-col items-center group w-1/5">
                        {/* Dot/Node */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-lg ${isActive ? `border-transparent bg-gradient-to-br ${stage.color} scale-110` : 'border-white/20 bg-brand-bg'}`}>
                            {isActive && <CheckCircleIcon className="w-3 h-3 text-white" />}
                        </div>
                        
                        {/* Label */}
                        <span className={`text-[10px] mt-2 text-center transition-colors duration-300 px-1 ${isActive ? 'font-bold text-brand-text' : 'text-brand-text-muted/50'}`}>
                            {stage.name}
                        </span>
                        
                        {/* Progress Bar Segment (Visual connection) */}
                        {isActive && (
                            <div className={`absolute top-3 left-0 h-0.5 -z-10 bg-gradient-to-r ${stage.color} opacity-50`} style={{
                                width: `${(index / (arcStages.length - 1)) * 100}%`
                            }}></div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ArcVisualizer;