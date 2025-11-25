
import React from 'react';
import { FilterSettings } from '../types';
import { SearchIcon } from './icons';

interface SearchBarProps {
    query: string;
    onQueryChange: (query: string) => void;
    filters: FilterSettings;
    onFilterChange: (filters: FilterSettings) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, filters, onFilterChange }) => {
    
    const handleFilterToggle = (key: keyof FilterSettings) => {
        onFilterChange({
            ...filters,
            [key]: !filters[key],
        });
    };

    const filterOptions: { key: keyof FilterSettings; label: string }[] = [
        { key: 'characters', label: 'Characters' },
        { key: 'scenes', label: 'Scenes' },
        { key: 'locations', label: 'Locations' },
        { key: 'materials', label: 'Materials' },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-brand-text-muted" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Search across your story..."
                    className="w-full bg-brand-bg/50 border border-brand-primary/50 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition"
                />
            </div>
            <div>
                <p className="text-xs font-bold text-brand-text-muted mb-2 uppercase tracking-wider">Filter by:</p>
                <div className="grid grid-cols-2 gap-2">
                    {filterOptions.map(({ key, label }) => (
                         <label key={key} className="flex items-center gap-2 text-sm text-brand-text-muted cursor-pointer hover:text-brand-text transition bg-brand-bg/30 p-2 rounded-lg border border-transparent hover:border-brand-primary/50">
                            <input 
                                type="checkbox"
                                checked={filters[key]}
                                onChange={() => handleFilterToggle(key)}
                                className="h-4 w-4 rounded bg-brand-surface border-brand-primary text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
