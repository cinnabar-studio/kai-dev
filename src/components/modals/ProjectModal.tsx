import React, { useState } from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import BaseModal from './BaseModal';
import { useGoalsStore, type Project } from '../../store/goalsStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectModalProps {
  goalId: string;
  onClose: () => void;
  initialData?: Partial<Project>;
}

interface SortableResultItemProps {
  id: string;
  description: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, description: string) => void;
  onEnter: () => void;
}

const SortableResultItem: React.FC<SortableResultItemProps> = ({
  id,
  description,
  onDelete,
  onUpdate,
  onEnter,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 bg-zinc-800/50 p-3 rounded-lg group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        className="p-1 text-zinc-400 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <input
        type="text"
        value={description}
        onChange={(e) => onUpdate(id, e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1"
        placeholder="What result do you expect?"
      />
      <button
        onClick={() => onDelete(id)}
        className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ProjectModal: React.FC<ProjectModalProps> = ({ goalId, onClose, initialData }) => {
  const { addProject, updateProject } = useGoalsStore();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
  });

  const [results, setResults] = useState<{ id: string; description: string }[]>(
    initialData?.results?.map(r => ({ id: r.id, description: r.description })) || []
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setResults((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addResult = () => {
    setResults([
      ...results,
      {
        id: crypto.randomUUID(),
        description: '',
      },
    ]);
  };

  const updateResult = (id: string, description: string) => {
    setResults(results.map(result =>
      result.id === id ? { ...result, description } : result
    ));
  };

  const deleteResult = (id: string) => {
    setResults(results.filter(result => result.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty results
    const validResults = results.filter(r => r.description.trim());
    
    if (initialData?.id) {
      updateProject(initialData.id, {
        ...formData,
        results: validResults.map(r => ({
          ...r,
          achieved: false,
          createdAt: new Date().toISOString(),
        })),
      });
    } else {
      addProject({
        ...formData,
        goalId,
        results: validResults.map(r => ({
          ...r,
          achieved: false,
          createdAt: new Date().toISOString(),
        })),
      });
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') {
        // Allow multiline input in textarea
        return;
      }
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <BaseModal title={initialData ? 'Edit Project' : 'New Project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project title"
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
            placeholder="Describe your project"
            rows={3}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-400">
              Expected Results
            </label>
            <button
              type="button"
              onClick={addResult}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Result</span>
            </button>
          </div>
          <p className="text-sm text-zinc-500 mb-4">
            List the specific outcomes you want to achieve with this project. The more specific you are, the better we can help you track progress.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={results}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {results.map((result) => (
                  <SortableResultItem
                    key={result.id}
                    id={result.id}
                    description={result.description}
                    onUpdate={updateResult}
                    onDelete={deleteResult}
                    onEnter={addResult}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
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
            {initialData ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProjectModal;