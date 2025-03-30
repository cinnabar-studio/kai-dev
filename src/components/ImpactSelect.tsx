import React from 'react';
import { type ImpactLevel } from '../store/goalsStore';

interface ImpactSelectProps {
  value: ImpactLevel;
  onChange: (impact: ImpactLevel) => void;
}

const ImpactSelect: React.FC<ImpactSelectProps> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ImpactLevel)}
      className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="High">High Impact</option>
      <option value="Medium">Medium Impact</option>
      <option value="Low">Low Impact</option>
    </select>
  );
};

export default ImpactSelect;