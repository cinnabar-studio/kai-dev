import React, { useState } from 'react';
import { Target, Briefcase, GraduationCap } from 'lucide-react';
import BaseModal from './BaseModal';
import { useGoalsStore, type Goal } from '../../store/goalsStore';

interface GoalModalProps {
  onClose: () => void;
  initialData?: Partial<Goal>;
}

const GoalModal: React.FC<GoalModalProps> = ({ onClose, initialData }) => {
  const { addGoal, updateGoal } = useGoalsStore();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    icon: initialData?.icon || 'target',
    color: initialData?.color || 'blue',
  });

  const icons = {
    target: Target,
    briefcase: Briefcase,
    'graduation-cap': GraduationCap,
  };

  const colors = [
    { name: 'blue', class: 'bg-blue-600' },
    { name: 'purple', class: 'bg-purple-600' },
    { name: 'green', class: 'bg-green-600' },
    { name: 'yellow', class: 'bg-yellow-600' },
    { name: 'red', class: 'bg-red-600' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData?.id) {
      updateGoal(initialData.id, formData);
    } else {
      addGoal(formData);
    }
    onClose();
  };

  return (
    <BaseModal title={initialData ? 'Edit Goal' : 'New Goal'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter goal title"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe your goal"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Icon
          </label>
          <div className="flex space-x-2">
            {Object.entries(icons).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormData({ ...formData, icon: key as Goal['icon'] })}
                className={`p-3 rounded-lg transition-colors ${
                  formData.icon === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Color
          </label>
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.name })}
                className={`w-8 h-8 rounded-full ${color.class} ${
                  formData.color === color.name
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                    : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default GoalModal;