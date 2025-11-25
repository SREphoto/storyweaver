
import React, { useState, useRef } from 'react';
import { CharacterType } from '../types';
import { UserPlusIcon, ImageIcon, GemIcon } from './icons';
import { characterTypeDescriptions } from './characterTypeDescriptions';
import CollapsibleSubSection from './CollapsibleSubSection';
import * as geminiService from '../services/geminiService';

interface CharacterBuilderProps {
  onCreateCharacter: (name: string, type: CharacterType, initialInfo: string, traits: string, backstory: string, imageUrl?: string) => void;
  isLoading: boolean;
}

const characterTemplates = [
    {
        name: 'Reluctant Hero',
        info: 'A simple farmhand who discovers they are the chosen one destined to defeat a great evil, but they would rather live a quiet life.',
        traits: 'Humble, Brave, Stubborn'
    },
    {
        name: 'Charismatic Villain',
        info: 'A charming and intelligent leader who believes their ruthless methods are a necessary evil to bring order to a chaotic world.',
        traits: 'Cunning, Eloquent, Ruthless'
    },
    {
        name: 'Quirky Mentor',
        info: 'An eccentric old wizard who has forgotten more about magic than most will ever know, offering cryptic but profound advice.',
        traits: 'Wise, Eccentric, Forgetful'
    }
];

const suggestedTraitsMap: Record<CharacterType, string[]> = {
  [CharacterType.PROTAGONIST]: ['Brave', 'Determined', 'Reluctant', 'Idealistic', 'Resilient', 'Empathetic'],
  [CharacterType.ANTAGONIST]: ['Ruthless', 'Cunning', 'Ambitious', 'Vengeful', 'Manipulative', 'Obsessive'],
  [CharacterType.DEUTERAGONIST]: ['Loyal', 'Supportive', 'Pragmatic', 'Protective', 'Reliable', 'Grounded'],
  [CharacterType.MENTOR]: ['Wise', 'Patient', 'Mysterious', 'Strict', 'Encouraging', 'World-weary'],
  [CharacterType.LOVE_INTEREST]: ['Charming', 'Compassionate', 'Independent', 'Witty', 'Devoted', 'Gentle'],
  [CharacterType.FOIL]: ['Reckless', 'Cynical', 'Arrogant', 'Cowardly', 'Chaotic', 'Optimistic'],
  [CharacterType.SUPPORTING_CHARACTER]: ['Friendly', 'Helpful', 'Observant', 'Funny', 'Resourceful', 'Dependable'],
  [CharacterType.MINOR_CHARACTER]: ['Talkative', 'Grumpy', 'Nervous', 'Suspicious', 'Clumsy', 'Forgettable'],
};

const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ onCreateCharacter, isLoading }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CharacterType>(CharacterType.PROTAGONIST);
  const [initialInfo, setInitialInfo] = useState('');
  const [traits, setTraits] = useState('');
  const [backstory, setBackstory] = useState('');
  const [error, setError] = useState('');
  
  // Image Upload State
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !initialInfo.trim()) {
      setError('Name and initial info cannot be empty.');
      return;
    }
    setError('');
    onCreateCharacter(name, type, initialInfo, traits, backstory, imagePreview || undefined);
    setName('');
    setInitialInfo('');
    setTraits('');
    setBackstory('');
    setUploadedImage(null);
    setImagePreview(null);
  };
  
  const handleUseTemplate = (template: typeof characterTemplates[0]) => {
      setName(template.name);
      setInitialInfo(template.info);
      setTraits(template.traits);
      setBackstory('');
  };

  const handleAddTrait = (trait: string) => {
      if (!traits) {
          setTraits(trait);
      } else if (!traits.toLowerCase().includes(trait.toLowerCase())) {
          setTraits(prev => `${prev}, ${trait}`);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setUploadedImage(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAnalyzeImage = async () => {
      if (!uploadedImage) return;
      setIsAnalyzingImage(true);
      setError('');
      try {
          const analysis = await geminiService.analyzeCharacterVisuals(uploadedImage);
          
          if (analysis.description) {
              setInitialInfo(prev => prev ? `${prev}\n\n[Visuals]: ${analysis.description}` : `[Visuals]: ${analysis.description}`);
          }
          if (analysis.traits) {
              setTraits(prev => prev ? `${prev}, ${analysis.traits}` : analysis.traits);
          }
      } catch (e) {
          console.error(e);
          setError("Failed to analyze image.");
      } finally {
          setIsAnalyzingImage(false);
      }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="char-name" className="block text-sm font-semibold text-brand-text-muted mb-1.5">Character Name</label>
          <input
            id="char-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Kaelen the Shadowmancer"
            className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
          />
        </div>
        <div>
            <label htmlFor="char-type" className="block text-sm font-semibold text-brand-text-muted mb-1.5">Character Type</label>
            <select
                id="char-type"
                value={type}
                onChange={(e) => setType(e.target.value as CharacterType)}
                className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
            >
                {Object.values(CharacterType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
             <p className="text-xs text-brand-text-muted mt-2 p-3 bg-brand-primary/30 rounded-lg border border-brand-primary/30">
                {characterTypeDescriptions[type]}
            </p>
        </div>

        {/* Image Upload Section */}
        <div className="bg-brand-primary/30 p-4 rounded-xl border border-brand-primary/40">
             <label className="block text-sm font-semibold text-brand-text-muted mb-3">Character Portrait (Optional)</label>
             <div className="flex gap-4 items-start">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 flex-shrink-0 bg-brand-bg/50 border-2 border-dashed border-brand-text-muted/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-brand-secondary hover:bg-brand-primary/50 transition overflow-hidden"
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-brand-text-muted" />
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                />
                <div className="flex-grow pt-1">
                    <p className="text-xs text-brand-text-muted mb-3 leading-relaxed">Upload an image to generate traits or use as the profile header.</p>
                    <button
                        type="button"
                        onClick={handleAnalyzeImage}
                        disabled={!uploadedImage || isAnalyzingImage}
                        className="text-xs flex items-center gap-2 bg-brand-secondary/90 text-white px-3 py-2 rounded-lg hover:bg-brand-secondary transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                         <GemIcon className="w-3 h-3" />
                         {isAnalyzingImage ? 'Analyzing Visuals...' : 'Analyze Image for Traits'}
                    </button>
                </div>
             </div>
        </div>

        <div>
          <label htmlFor="char-traits" className="block text-sm font-semibold text-brand-text-muted mb-1.5">Key Traits</label>
          <input
            id="char-traits"
            type="text"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            placeholder="e.g., Brave, Cunning, Loyal"
            className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
          />
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            <span className="text-xs text-brand-text-muted font-semibold mr-1">Quick Traits:</span>
            {suggestedTraitsMap[type]?.map(trait => (
                <button
                    key={trait}
                    type="button"
                    onClick={() => handleAddTrait(trait)}
                    className="text-xs bg-brand-primary/40 border border-brand-primary/50 text-brand-text-muted hover:text-white hover:border-brand-secondary hover:bg-brand-secondary/80 px-2.5 py-1 rounded-full transition duration-200"
                >
                    {trait}
                </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="char-info" className="block text-sm font-semibold text-brand-text-muted mb-1.5">Initial Info & Core Idea</label>
          <textarea
            id="char-info"
            value={initialInfo}
            onChange={(e) => setInitialInfo(e.target.value)}
            rows={3}
            placeholder="A disgraced knight seeking redemption, haunted by the ghost of the king he failed to protect."
            className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
          />
        </div>
        
        <div>
          <label htmlFor="char-backstory" className="block text-sm font-semibold text-brand-text-muted mb-1.5">Character Backstory (Optional)</label>
          <textarea
            id="char-backstory"
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            rows={3}
            placeholder="Detailed history, childhood, or key past events..."
            className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
          />
        </div>

        <CollapsibleSubSection title="Use a Template" defaultCollapsed={true}>
            <div className="flex flex-wrap gap-2 pt-2">
                {characterTemplates.map(template => (
                    <button
                        key={template.name}
                        type="button"
                        onClick={() => handleUseTemplate(template)}
                        className="text-xs bg-brand-primary/40 text-brand-text-muted px-2 py-1 rounded-md hover:bg-brand-primary hover:text-white transition border border-transparent hover:border-brand-primary"
                    >
                        {template.name}
                    </button>
                ))}
            </div>
        </CollapsibleSubSection>

        {error && <p className="text-red-400 text-sm p-2 bg-red-900/20 border border-red-900/30 rounded-md">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || isAnalyzingImage}
          className="w-full flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-brand-secondary/20"
        >
          <UserPlusIcon className="w-5 h-5" />
          {isLoading ? 'Generating...' : 'Create Character Profile'}
        </button>
      </form>
    </div>
  );
};

export default CharacterBuilder;
