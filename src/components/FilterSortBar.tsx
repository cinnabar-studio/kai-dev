import React, { useState } from 'react';
import { Search, X, ArrowDownUp, SlidersHorizontal } from 'lucide-react';

export type SortOption = {
  id: string;
  label: string;
};

interface FilterSortBarProps {
  searchPlaceholder?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  
  showSort?: boolean;
  sortOptions?: SortOption[];
  currentSortOption?: string;
  onSortChange?: (sortOption: string) => void;
  
  showFilters?: boolean;
  isFilterActive?: boolean;
  onToggleFilters: () => void;
  
  children?: React.ReactNode;
}

const FilterSortBar: React.FC<FilterSortBarProps> = ({
  searchPlaceholder = 'Search...',
  searchTerm,
  onSearchChange,
  
  showSort = true,
  sortOptions = [],
  currentSortOption = '',
  onSortChange,
  
  showFilters = true,
  isFilterActive = false,
  onToggleFilters,
  
  children
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search field */}
        <div className="relative flex-1">
          <Search size={18} className="text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          {/* Sort Button & Dropdown */}
          {showSort && sortOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={`p-2 rounded-lg transition-colors ${
                  showSortDropdown ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Sort options"
              >
                <ArrowDownUp size={20} />
              </button>
              
              {showSortDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSortDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2 bg-zinc-800 rounded-lg border border-zinc-700 shadow-lg z-20 min-w-[180px]">
                    <div className="p-2">
                      {sortOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            if (onSortChange) onSortChange(option.id);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded ${
                            currentSortOption === option.id 
                              ? 'bg-zinc-700 text-white' 
                              : 'hover:bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Filter Button */}
          {showFilters && (
            <button
              onClick={onToggleFilters}
              className={`p-2 rounded-lg transition-colors ${
                isFilterActive
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Filter options"
            >
              <SlidersHorizontal size={20} />
            </button>
          )}
          
          {/* Additional children (like add button) */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default FilterSortBar;