
import React from 'react';

interface StoryInputsProps {
  storyPremise: string;
  setStoryPremise: (value: string) => void;
  storyTextToAnalyze: string;
  setStoryTextToAnalyze: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const premiseTemplates = [
    { name: 'Sci-Fi', premise: 'In a future where humanity has colonized Mars, a lone scientist discovers an ancient alien artifact that threatens to unravel the fabric of reality.' },
    { name: 'Fantasy', premise: 'A young elf, exiled from her forest home, must team up with a grizzled dwarf warrior to stop a blight that corrupts everything it touches.' },
    { name: 'Mystery', premise: 'In the rain-soaked streets of a 1940s city, a cynical private detective takes on a case of a missing heiress that leads him into a web of conspiracy and betrayal.' },
];

const StoryInputs: React.FC<StoryInputsProps> = ({
  storyPremise,
  setStoryPremise,
  storyTextToAnalyze,
  setStoryTextToAnalyze,
  onAnalyze,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <label htmlFor="story-premise" className="block text-sm font-semibold text-brand-text-muted mb-2 uppercase tracking-wider">
          Story Premise
        </label>
        <textarea
          id="story-premise"
          value={storyPremise}
          onChange={(e) => setStoryPremise(e.target.value)}
          rows={3}
          placeholder="A world where memories can be traded as currency..."
          className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 text-brand-text focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition resize-none"
        />
        <div className="flex flex-wrap gap-2 mt-3">
            {premiseTemplates.map(template => (
                <button
                    key={template.name}
                    type="button"
                    onClick={() => setStoryPremise(template.premise)}
                    className="text-xs bg-brand-primary/40 border border-brand-primary/50 text-brand-text-muted px-3 py-1.5 rounded-full hover:bg-brand-secondary hover:text-white hover:border-brand-secondary transition"
                >
                    {template.name} Idea
                </button>
            ))}
        </div>
      </div>
      <div className="flex-grow flex flex-col">
        <label htmlFor="story-importer" className="block text-sm font-semibold text-brand-text-muted mb-2 uppercase tracking-wider">
          Story Importer
        </label>
        <textarea
          id="story-importer"
          value={storyTextToAnalyze}
          onChange={(e) => setStoryTextToAnalyze(e.target.value)}
          placeholder="Paste your existing story, chapters, or notes here..."
          className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-3 text-brand-text focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition flex-grow resize-none min-h-[120px]"
        />
      </div>
      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-brand-secondary/20"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Story'}
      </button>
    </div>
  );
};

export default StoryInputs;
