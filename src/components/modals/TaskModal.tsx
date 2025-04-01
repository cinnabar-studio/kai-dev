import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { useGoalsStore, type Task, type ImpactLevel } from '../../store/goalsStore';
import ImpactSelect from '../ImpactSelect';

interface TaskModalProps {
  projectId?: string;
  milestoneId?: string;
  onClose: () => void;
  initialData?: Partial<Task>;
}

const TaskModal: React.FC<TaskModalProps> = ({ projectId, milestoneId, onClose, initialData }) => {
  const { 
    addTask, 
    updateTask, 
    projects: allProjects, 
    getMilestonesByProject 
  } = useGoalsStore();

  // Get only non-archived projects
  const availableProjects = allProjects.filter(p => !p.archived);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || '');
  const [availableMilestones, setAvailableMilestones] = useState<Array<{ id: string; title: string }>>([]);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    deadline: initialData?.deadline || '',
    impact: initialData?.impact || 'Medium' as ImpactLevel,
    urgent: initialData?.urgent || false,
    milestoneId: milestoneId || initialData?.milestoneId || null,
  });

  // Update available milestones when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const milestones = getMilestonesByProject(selectedProjectId);
      setAvailableMilestones(milestones.map(m => ({ id: m.id, title: m.title })));
      
      // If current milestone doesn't belong to new project, reset it
      if (formData.milestoneId) {
        const milestoneExists = milestones.some(m => m.id === formData.milestoneId);
        if (!milestoneExists) {
          setFormData(prev => ({ ...prev, milestoneId: null }));
        }
      }
    } else {
      setAvailableMilestones([]);
      setFormData(prev => ({ ...prev, milestoneId: null }));
    }
  }, [selectedProjectId, getMilestonesByProject]);

  // Set initial project and milestone if provided
  useEffect(() => {
    if (initialData) {
      setSelectedProjectId(initialData.projectId || '');
    } else if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [initialData, projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (initialData?.id) {
      updateTask(initialData.id, {
        ...formData,
        projectId: selectedProjectId || '',
      });
    } else {
      addTask({ 
        ...formData, 
        projectId: selectedProjectId || '',
        description: formData.description || '',
        deadline: formData.deadline || undefined,
        milestoneId: formData.milestoneId || null,
      });
    }
    onClose();
  };

  return (
    <BaseModal title={initialData ? 'Edit Task' : 'New Task'} onClose={onClose}>
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
            placeholder="Enter task title"
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
            placeholder="Describe your task"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Uncategorized</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Milestone
            </label>
            <select
              value={formData.milestoneId || ''}
              onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value || null })}
              disabled={!selectedProjectId}
              className={`w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !selectedProjectId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">None</option>
              {availableMilestones.map(milestone => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </option>
              ))}
            </select>
            {!selectedProjectId && (
              <p className="text-xs text-zinc-500 mt-1">
                Select a project first to choose a milestone
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Impact
            </label>
            <ImpactSelect
              value={formData.impact}
              onChange={(impact) => setFormData({ ...formData, impact })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Urgency
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.urgent}
                onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                className="form-checkbox h-4 w-4 text-red-500 rounded border-zinc-600 bg-zinc-800 focus:ring-2 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-400">Mark as urgent</span>
            </label>
          </div>
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
            {initialData ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default TaskModal;