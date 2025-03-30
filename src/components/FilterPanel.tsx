import React from 'react';
import { X } from 'lucide-react';

export type FilterTag = {
  id: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
};

interface FilterPanelProps {
  title?: string;
  activeTags: FilterTag[];
  onRemoveTag: (id: string) => void;
  onClearAll: () => void;
  children?: React.ReactNode;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  title = "Filter",
  activeTags,
  onRemoveTag,
  onClearAll,
  children
}) => {
  return (
    <div className="bg-zinc-800 rounded-lg p-4 border border-blue-500 mb-4">
      <h3 className="text-md font-semibold mb-4 text-white">{title}</h3>
      
      {/* Filter options */}
      <div className="flex flex-col space-y-6">
        {children}
      </div>
      
      {/* Active filters display if present */}
      {activeTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-zinc-700">
          <span className="text-sm text-zinc-400">Active:</span>
          
          {activeTags.map(tag => (
            <span 
              key={tag.id} 
              className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${tag.color || 'bg-blue-600/20 text-blue-400'}`}
            >
              {tag.icon}
              <span>{tag.label}</span>
              <button 
                onClick={() => onRemoveTag(tag.id)}
                className="hover:text-white"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          
          <button
            onClick={onClearAll}
            className="ml-auto text-sm text-zinc-400 hover:text-white"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;