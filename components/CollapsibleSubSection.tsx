
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from './icons';

interface CollapsibleSubSectionProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

const CollapsibleSubSection: React.FC<CollapsibleSubSectionProps> = ({ title, children, defaultCollapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center w-full text-left text-sm font-semibold text-brand-text-muted hover:text-white transition"
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <ChevronRightIcon className="w-4 h-4 mr-1" /> : <ChevronDownIcon className="w-4 h-4 mr-1" />}
        {title}
      </button>
      {!isCollapsed && (
        <div className="pl-5 border-l border-brand-primary ml-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSubSection;
