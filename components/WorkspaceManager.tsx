

import React, { useState, useRef, useEffect } from 'react';
import { Section } from '../types';
import { LayoutDashboardIcon, GripVerticalIcon, EyeIcon, EyeOffIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface WorkspaceManagerProps {
  sections: Section[];
  onToggleVisibility: (id: string) => void;
  onReorder: (reorderedSections: Section[]) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ sections, onToggleVisibility, onReorder, onMove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleDragStart = (id: string) => {
    dragItem.current = id;
  };

  const handleDragEnter = (id: string) => {
    dragOverItem.current = id;
  };

  const handleDragEnd = () => {
    if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
        const reordered = [...sections];
        const dragItemIndex = sections.findIndex(s => s.id === dragItem.current);
        const dragOverItemIndex = sections.findIndex(s => s.id === dragOverItem.current);
        
        const [removed] = reordered.splice(dragItemIndex, 1);
        reordered.splice(dragOverItemIndex, 0, removed);
        
        onReorder(reordered);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-brand-primary text-sm text-brand-text-muted font-semibold py-2 px-3 rounded-md hover:bg-opacity-80 hover:text-white transition"
        title="Manage Workspace Layout"
      >
        <LayoutDashboardIcon className="w-4 h-4" />
        Manage Workspace
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-brand-primary rounded-lg shadow-xl z-20 border border-brand-surface">
          <div className="p-3 border-b border-brand-surface">
            <h3 className="font-bold text-white">Customize Your Workspace</h3>
            <p className="text-xs text-brand-text-muted">Drag or use arrows to reorder. Click eye to toggle.</p>
          </div>
          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section.id)}
                onDragEnter={() => handleDragEnter(section.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center justify-between p-2 rounded-md bg-brand-surface hover:bg-brand-bg group"
              >
                <div className="flex items-center gap-2 cursor-grab">
                    <GripVerticalIcon className="w-5 h-5 text-brand-text-muted" />
                    <span className="text-sm text-brand-text">{section.title}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        <button onClick={() => onMove(section.id, 'up')} disabled={index === 0} className="p-1 text-brand-text-muted hover:text-white disabled:opacity-25" title="Move Up">
                            <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => onMove(section.id, 'down')} disabled={index === sections.length - 1} className="p-1 text-brand-text-muted hover:text-white disabled:opacity-25" title="Move Down">
                            <ArrowDownIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => onToggleVisibility(section.id)}
                        title={section.isVisible ? 'Hide' : 'Show'}
                        className="text-brand-text-muted hover:text-white"
                    >
                        {section.isVisible ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5 text-red-400" />}
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManager;