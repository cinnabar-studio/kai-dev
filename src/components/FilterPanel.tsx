import React from 'react';
import type { FilterTag } from './FilterBar';

interface FilterPanelProps {
  title: string;
  children: React.ReactNode;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  title,
  children
}) => {
  return (
    <div className="bg-zinc-900 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium">{title}</h2>
      </div>

      {/* Filter Options */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export { FilterPanel };
export default FilterPanel;