import React, { useState } from 'react';
import { type ImpactLevel } from '../store/goalsStore';

interface ImpactBadgeProps {
  impact: ImpactLevel;
  onChange: (impact: ImpactLevel) => void;
}

const ImpactBadge: React.FC<ImpactBadgeProps> = ({ impact, onChange }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  
  const colors = {
    High: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    Low: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  };

  const handleSelect = (newImpact: ImpactLevel) => {
    onChange(newImpact);
    setIsSelecting(false);
  };

  if (isSelecting) {
    return (
      <div className="relative">
        <div className="absolute top-0 left-0 mt-6 bg-zinc-900 rounded-lg shadow-lg border border-zinc-800 py-1 min-w-[100px] z-50">
          {(['High', 'Medium', 'Low'] as ImpactLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => handleSelect(level)}
              className={`w-full px-3 py-1 text-left text-xs hover:bg-zinc-800 ${colors[level]}`}
            >
              {level}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsSelecting(false)}
          className="fixed inset-0 z-40"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsSelecting(true)}
      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${colors[impact]}`}
    >
      {impact}
    </button>
  );
};

export default ImpactBadge;