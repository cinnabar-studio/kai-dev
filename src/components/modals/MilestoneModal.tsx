import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { useGoalsStore, type Milestone } from '../../store/goalsStore';

interface MilestoneModalProps {
  projectId: string;
  onClose: () => void;
  initialData?: Partial<Milestone>;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({ projectId, onClose, initialData }) => {
  const { addMilestone, updateMilestone } = useGoalsStore();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    deadline: initialData?.deadline || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData?.id) {
      updateMilestone(initialData.id, formData);
    } else {
      addMilestone({ ...formData, projectId });
    }
    onClose();
  };

  return (
    <BaseModal title={initialData ? 'Edit Milestone' : 'New Milestone'} onClose={onClose}>
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
            placeholder="Enter milestone title"
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
            placeholder="Describe your milestone"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Deadline (Optional)
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            {initialData ? 'Save Changes' : 'Create Milestone'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default MilestoneModal;