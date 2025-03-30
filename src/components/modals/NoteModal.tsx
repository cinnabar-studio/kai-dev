import React, { useState, useEffect, useRef } from 'react';
import { Tag, X, Plus, CheckSquare } from 'lucide-react';
import BaseModal from './BaseModal';
import { useNotesStore, type Note, type NoteTag, type PredefinedTag } from '../../store/notesStore';
import { useGoalsStore } from '../../store/goalsStore';

const PREDEFINED_TAGS: PredefinedTag[] = [
  'idea',
  'meeting',
  'research',
  'todo',
  'important',
  'insight',
  'personal',
  'work',
  'question',
  'reference',
  'checklist',
];

const TAG_COLORS: Record<string, string> = {
  idea: 'bg-purple-500/20 text-purple-400',
  meeting: 'bg-blue-500/20 text-blue-400',
  research: 'bg-cyan-500/20 text-cyan-400',
  todo: 'bg-yellow-500/20 text-yellow-400',
  important: 'bg-red-500/20 text-red-400',
  insight: 'bg-green-500/20 text-green-400',
  personal: 'bg-pink-500/20 text-pink-400',
  work: 'bg-orange-500/20 text-orange-400',
  question: 'bg-indigo-500/20 text-indigo-400',
  reference: 'bg-emerald-500/20 text-emerald-400',
  checklist: 'bg-teal-500/20 text-teal-400',
  // Default color for custom tags
  custom: 'bg-gray-500/20 text-gray-400',
};

interface NoteModalProps {
  initialData?: Partial<Note>;
  onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ initialData, onClose }) => {
  const { addNote, updateNote, getAllTags } = useNotesStore();
  const { projects: allProjects, getMilestonesByProject } = useGoalsStore();
  
  // Get only non-archived projects
  const availableProjects = allProjects.filter(p => !p.archived);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    tags: initialData?.tags || [],
    projectId: initialData?.projectId || '',
    milestoneId: initialData?.milestoneId || null,
  });
  
  const [availableMilestones, setAvailableMilestones] = useState<Array<{ id: string; title: string }>>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  
  const customTagInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus the custom tag input when shown
  useEffect(() => {
    if (showCustomTagInput && customTagInputRef.current) {
      customTagInputRef.current.focus();
    }
  }, [showCustomTagInput]);
  
  // Update available milestones when a project is selected
  useEffect(() => {
    if (formData.projectId) {
      const milestones = getMilestonesByProject(formData.projectId);
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
  }, [formData.projectId, getMilestonesByProject]);
  
  // Get all existing custom tags from notes
  const allTags = getAllTags();
  const existingCustomTags = allTags
    .filter(({ tag }) => !PREDEFINED_TAGS.includes(tag as PredefinedTag))
    .map(({ tag }) => tag);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    if (initialData?.id) {
      updateNote(initialData.id, formData);
    } else {
      addNote(formData);
    }
    
    onClose();
  };
  
  const toggleTag = (tag: NoteTag) => {
    const tags = [...formData.tags];
    const index = tags.indexOf(tag);
    
    if (index === -1) {
      tags.push(tag);
    } else {
      tags.splice(index, 1);
    }
    
    setFormData({ ...formData, tags });
  };
  
  const addCustomTag = () => {
    if (customTag.trim()) {
      const tags = [...formData.tags];
      if (!tags.includes(customTag)) {
        tags.push(customTag);
        setFormData({ ...formData, tags });
      }
      setCustomTag('');
      setShowCustomTagInput(false);
    }
  };
  
  const handleCustomTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    } else if (e.key === 'Escape') {
      setShowCustomTagInput(false);
      setCustomTag('');
    }
  };
  
  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag] || TAG_COLORS.custom;
  };
  
  return (
    <BaseModal title={initialData ? 'Edit Note' : 'New Note'} onClose={onClose}>
      <div className="max-h-[80vh] flex flex-col" ref={modalRef}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Note title"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[150px]"
              placeholder="Write your note..."
              rows={6}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Project (Optional)
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {availableProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Milestone (Optional)
              </label>
              <select
                value={formData.milestoneId || ''}
                onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value || null })}
                disabled={!formData.projectId}
                className={`w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !formData.projectId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">None</option>
                {availableMilestones.map(milestone => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.title}
                  </option>
                ))}
              </select>
              {!formData.projectId && (
                <p className="text-xs text-zinc-500 mt-1">
                  Select a project first to choose a milestone
                </p>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-400">
                Tags
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>{showTagSelector ? 'Hide Options' : 'Add Tags'}</span>
                </button>
              </div>
            </div>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.length === 0 ? (
                <span className="text-sm text-zinc-500">No tags selected</span>
              ) : (
                formData.tags.map(tag => (
                  <div
                    key={tag}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${getTagColor(tag)}`}
                  >
                    {tag === 'checklist' ? (
                      <CheckSquare size={14} />
                    ) : (
                      <Tag size={14} />
                    )}
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Tag Selector */}
            {showTagSelector && (
              <div className="p-3 bg-zinc-800 rounded-lg space-y-3">
                {/* Predefined Tags */}
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                        formData.tags.includes(tag)
                          ? TAG_COLORS[tag]
                          : 'bg-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tag === 'checklist' ? (
                        <CheckSquare size={14} />
                      ) : (
                        <Tag size={14} />
                      )}
                      <span className="text-sm">{tag}</span>
                    </button>
                  ))}
                </div>
                
                {/* Custom Tags Section */}
                <div className="pt-2 border-t border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm text-zinc-400">Custom Tags</h4>
                    <button
                      type="button"
                      onClick={() => setShowCustomTagInput(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>New Tag</span>
                    </button>
                  </div>
                  
                  {showCustomTagInput ? (
                    <div className="flex items-center space-x-2">
                      <input
                        ref={customTagInputRef}
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={handleCustomTagKeyDown}
                        placeholder="Enter custom tag"
                        className="flex-1 bg-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addCustomTag}
                        disabled={!customTag.trim()}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomTagInput(false);
                          setCustomTag('');
                        }}
                        className="px-2 py-1 text-zinc-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {existingCustomTags.length === 0 ? (
                        <span className="text-xs text-zinc-500">No custom tags yet</span>
                      ) : (
                        existingCustomTags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                              formData.tags.includes(tag)
                                ? TAG_COLORS.custom
                                : 'bg-zinc-700 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Tag size={14} />
                            <span className="text-sm">{tag}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
        
        <div className="flex justify-end space-x-3 p-4 border-t border-zinc-800 bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default NoteModal;