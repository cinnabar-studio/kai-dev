import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  ArrowDownUp,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Target,
  Tag,
  CheckSquare,
  Pin,
  Archive,
  BookMarked,
  SlidersHorizontal
} from 'lucide-react';

export interface FilterTag {
  id: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

export interface SortOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOptions: SortOption[];
  currentSortOption: string;
  onSortChange: (option: string) => void;
  filterTags: FilterTag[];
  onRemoveTag: (id: string) => void;
  onClearAll: () => void;
  showFilters?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  onToggleFilters: () => void;
  isFiltersOpen?: boolean;
  children?: React.ReactNode;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = "Search...",
  searchTerm,
  onSearchChange,
  sortOptions,
  currentSortOption,
  onSortChange,
  filterTags,
  onRemoveTag,
  onClearAll,
  showFilters = true,
  showSort = true,
  showSearch = true,
  onToggleFilters,
  isFiltersOpen = false,
  children
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  return (
    <div className="flex items-center space-x-3">
      {showSearch && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
          />
        </div>
      )}
      
      {showSort && (
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center space-x-2 px-3 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
          >
            <ArrowDownUp size={16} />
            <span className="text-zinc-400">
              {sortOptions.find(option => option.id === currentSortOption)?.label || 'Sort'}
            </span>
            <ChevronDown size={16} />
          </button>
          {showSortDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSortDropdown(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-lg py-1 z-20">
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onSortChange(option.id);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center justify-between ${
                      currentSortOption === option.id ? 'text-blue-400' : 'text-zinc-400'
                    }`}
                  >
                    <span>{option.label}</span>
                    {currentSortOption === option.id && (
                      <CheckCircle2 size={14} />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {showFilters && (
        <button
          onClick={onToggleFilters}
          className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors relative ${
            isFiltersOpen
              ? 'bg-blue-600 text-white'
              : filterTags.length > 0
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          <Filter size={16} />
          {filterTags.length > 0 && (
            <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-xs ${
              isFiltersOpen
                ? 'bg-white text-blue-600'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {filterTags.length}
            </span>
          )}
        </button>
      )}
      
      {children}
    </div>
  );
};

export { FilterBar };
export default FilterBar; 