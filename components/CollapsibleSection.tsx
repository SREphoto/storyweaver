
import React from 'react';
import { ChevronDownIcon } from './icons';

interface CollapsibleSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, isCollapsed, onToggle, children, icon }) => {
  return (
    <div className="glass-panel rounded-2xl flex flex-col transition-all duration-500 hover:shadow-2xl overflow-hidden group border border-white/5">
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full p-5 text-left bg-gradient-to-r from-white/5 via-white/0 to-transparent hover:from-brand-primary/20 hover:via-brand-secondary/5 transition-all duration-300 relative overflow-hidden"
        aria-expanded={!isCollapsed}
        aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
      >
        {/* Decorative glow line on left */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex items-center gap-4 relative z-10">
             {icon && (
                 <div className="p-2 rounded-lg bg-white/5 text-brand-secondary group-hover:bg-brand-secondary/20 group-hover:text-brand-secondary-light transition-all duration-300 shadow-sm ring-1 ring-white/10 group-hover:ring-brand-secondary/30 backdrop-blur-md">
                    {icon}
                 </div>
             )}
             <h2 className="text-lg font-bold font-serif text-brand-text group-hover:text-brand-secondary transition-colors duration-300 tracking-wide drop-shadow-sm">{title}</h2>
        </div>
        
        <div className={`text-brand-text-muted transition-transform duration-500 ease-in-out ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
            <ChevronDownIcon className="w-5 h-5" />
        </div>
      </button>
      <div
        id={`section-content-${title.replace(/\s+/g, '-')}`}
        className={`transition-[max-height,padding,opacity] duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}
      >
        <div className={`pb-6 px-6 pt-2 ${isCollapsed ? 'invisible' : 'visible'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
