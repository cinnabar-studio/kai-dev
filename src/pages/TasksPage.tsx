import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  Archive, 
  ToggleLeft, 
  Calendar, 
  SlidersHorizontal, 
  Briefcase, 
  Target,
  ChevronDown,
  ChevronUp,
  X,
  ArrowDownUp,
  CheckCircle2,
  AlertTriangle,
  Save,
  Clock,
  Edit,
  MessageSquare,
  FileText,
  Flag
} from 'lucide-react';
import { useGoalsStore, type Task, type ImpactLevel } from '../store/goalsStore';
import { useCommentsStore } from '../store/commentsStore';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/modals/TaskModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { FilterBar } from '../components/FilterBar';
import { FilterPanel } from '../components/FilterPanel';
import ImpactSelect from '../components/ImpactSelect';
import Comments from '../components/Comments';
import TaskList from '../components/TaskList';

// Status filters
type StatusFilter = 'pending' | 'completed' | 'archived' | 'incomplete';

interface TasksPageProps {
  onAskQuestion: (question: string) => void;
}

interface TaskDetailProps {
  task: Task;
  projects: Array<{ id: string; title: string; }>;
  milestones: Array<{ id: string; title: string; projectId: string; }>;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onToggleUrgent: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onAskQuestion: (itemId: string, question: string) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ 
  task, 
  projects, 
  milestones, 
  onSave,
  onToggleUrgent,
  onToggleCompleted,
  onArchive,
  onUnarchive,
  onAskQuestion
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({
    title: task.title,
    description: task.description || '',
    projectId: task.projectId,
    milestoneId: task.milestoneId,
    deadline: task.deadline || '',
    impact: task.impact,
    urgent: task.urgent,
    notes: task.notes || ''
  });
  
  const [availableMilestones, setAvailableMilestones] = useState<Array<{ id: string; title: string }>>([]);
  const [showComments, setShowComments] = useState(true);
  
  // Get comments for this task
  const { getComments } = useCommentsStore();
  const comments = getComments(task.id);
  
  // Update available milestones when selected project changes
  useEffect(() => {
    if (editedTask.projectId) {
      const projectMilestones = milestones
        .filter(m => m.projectId === editedTask.projectId)
        .map(m => ({ id: m.id, title: m.title }));
      
      setAvailableMilestones(projectMilestones);
      
      // Reset milestone selection if current milestone doesn't belong to this project
      if (editedTask.milestoneId) {
        const belongsToProject = projectMilestones.some(m => m.id === editedTask.milestoneId);
        if (!belongsToProject) {
          setEditedTask(prev => ({ ...prev, milestoneId: null }));
        }
      }
    } else {
      setAvailableMilestones([]);
      setEditedTask(prev => ({ ...prev, milestoneId: null }));
    }
  }, [editedTask.projectId, milestones]);

  // Update edited task when task changes
  useEffect(() => {
    setEditedTask({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      milestoneId: task.milestoneId,
      deadline: task.deadline || '',
      impact: task.impact,
      urgent: task.urgent,
      notes: task.notes || ''
    });
  }, [task]);
  
  const handleSave = () => {
    onSave(task.id, editedTask);
    setIsEditing(false);
  };
  
  // Format dates
  const formattedCreatedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-start space-x-4">
          <div className="flex flex-col items-center">
            <button
              onClick={() => onToggleCompleted(task.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-zinc-600 hover:border-green-500'
              }`}
            >
              {task.completed && <CheckCircle size={14} className="text-white" />}
            </button>
          </div>
          <div className="flex-1 min-w-0 -ml-6">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
              />
            ) : (
              <h2 className={`text-lg font-semibold break-words line-clamp-2 ${task.completed ? 'line-through text-zinc-500' : ''}`}>{task.title}</h2>
            )}
            <div className="flex space-x-1 mt-2">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                  title="Save changes"
                >
                  <Save size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <Edit size={16} />
                </button>
              )}
              {task.archived && onUnarchive ? (
                <button
                  onClick={() => onUnarchive(task.id)}
                  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                  title="Unarchive task"
                >
                  <Archive size={16} />
                </button>
              ) : (
                <button
                  onClick={() => onArchive(task.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  title="Archive task"
                >
                  <Archive size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-4 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
            {isEditing ? (
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-zinc-900 rounded-lg px-3 py-2 min-h-[60px] max-h-[200px] overflow-y-auto">
                <p className="break-words whitespace-pre-wrap">{task.description || <span className="text-zinc-500 italic">No description</span>}</p>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Notes</label>
            {isEditing ? (
              <textarea
                value={editedTask.notes}
                onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this task..."
              />
            ) : (
              <div className="bg-zinc-900 rounded-lg px-3 py-2 min-h-[80px] max-h-[300px] overflow-y-auto">
                {task.notes ? (
                  <div className="whitespace-pre-wrap break-words">{task.notes}</div>
                ) : (
                  <span className="text-zinc-500 italic">No notes added</span>
                )}
              </div>
            )}
          </div>
          
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Priority</label>
              {isEditing ? (
                <ImpactSelect 
                  value={editedTask.impact as ImpactLevel} 
                  onChange={(impact) => setEditedTask({ ...editedTask, impact })} 
                />
              ) : (
                <div className={`inline-block px-3 py-1 rounded-lg text-sm ${
                  task.impact === 'High' 
                    ? 'bg-red-500/20 text-red-400' 
                    : task.impact === 'Medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {task.impact} Impact
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Urgency</label>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgent-toggle"
                    checked={editedTask.urgent}
                    onChange={(e) => setEditedTask({ ...editedTask, urgent: e.target.checked })}
                    className="rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="urgent-toggle" className="text-sm">Urgent</label>
                </div>
              ) : (
                <button
                  onClick={() => onToggleUrgent(task.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm ${
                    task.urgent 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-zinc-800 text-zinc-400 hover:text-red-400'
                  }`}
                >
                  <AlertTriangle size={14} />
                  <span>{task.urgent ? 'Urgent' : 'Not Urgent'}</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Project & Milestone */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Project</label>
              {isEditing ? (
                <select
                  value={editedTask.projectId || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, projectId: e.target.value || undefined })}
                  className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Uncategorized</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              ) : (
                <div className="bg-zinc-900 rounded-lg px-3 py-2 flex items-center space-x-2">
                  <Briefcase size={16} className="text-blue-400 flex-shrink-0" />
                  <span className="truncate">
                    {task.projectId 
                      ? projects.find(p => p.id === task.projectId)?.title || 'Unknown Project' 
                      : 'Uncategorized'}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Milestone</label>
              {isEditing ? (
                <select
                  value={editedTask.milestoneId || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, milestoneId: e.target.value || undefined })}
                  disabled={!editedTask.projectId}
                  className={`w-full bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !editedTask.projectId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">None</option>
                  {availableMilestones.map(milestone => (
                    <option key={milestone.id} value={milestone.id}>{milestone.title}</option>
                  ))}
                </select>
              ) : (
                <div className="bg-zinc-900 rounded-lg px-3 py-2 flex items-center space-x-2">
                  {task.milestoneId ? (
                    <>
                      <Target size={16} className="text-purple-400 flex-shrink-0" />
                      <span className="truncate">
                        {milestones.find(m => m.id === task.milestoneId)?.title || 'Unknown Milestone'}
                      </span>
                    </>
                  ) : (
                    <span className="text-zinc-500 italic">No milestone assigned</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Deadline</label>
            {isEditing ? (
              <input
                type="date"
                value={editedTask.deadline}
                onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-zinc-900 rounded-lg px-3 py-2 flex items-center space-x-2">
                {task.deadline ? (
                  <>
                    <Calendar size={16} className="text-zinc-400" />
                    <span>{new Date(task.deadline).toLocaleDateString()}</span>
                  </>
                ) : (
                  <span className="text-zinc-500 italic">No deadline set</span>
                )}
              </div>
            )}
          </div>
          
          {/* Created Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Created</label>
            <div className="bg-zinc-900 rounded-lg px-3 py-2 flex items-center space-x-2">
              <Clock size={16} className="text-zinc-400" />
              <span>{formattedCreatedDate}</span>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-400" />
                <span>Comments ({comments.length})</span>
              </h3>
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                {showComments ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showComments && (
              <Comments entityId={task.id} entityType="task" />
            )}
          </div>
          
          {/* Ask AI Section - at bottom */}
          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={() => onAskQuestion(task.id, `Help me with this task: ${task.title}`)}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors"
            >
              <MessageSquare size={16} />
              <span>Ask AI about this task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksPage: React.FC<TasksPageProps> = ({ onAskQuestion }) => {
  const { 
    tasks, 
    projects,
    milestones,
    updateTask,
    toggleTaskUrgent,
    toggleTask, 
    archiveTask, 
    unarchiveTask, 
    taskFilters,
    setTaskStatusFilter,
    setTaskUrgentFilter,
    setTaskImpactFilter,
    setTaskProjectFilter,
    setTaskMilestoneFilter,
    setTaskSearchTerm,
    setTaskSortBy,
    clearTaskFilters,
    addTask
  } = useGoalsStore();
  
  const [showTaskFilters, setShowTaskFilters] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [taskToArchive, setTaskToArchive] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  
  // Filter for available milestones based on selected project
  const availableMilestones = useMemo(() => {
    if (!taskFilters.selectedProjectId) {
      return milestones
        .filter(m => !m.archived)
        .map(m => ({ id: m.id, title: m.title }));
    }
    return milestones
      .filter(m => m.projectId === taskFilters.selectedProjectId && !m.archived)
      .map(m => ({ id: m.id, title: m.title }));
  }, [milestones, taskFilters.selectedProjectId]);

  // Filter tasks based on search, status, etc.
  const filteredTasks = useMemo(() => tasks.filter(task => {
    // Search filter
    if (taskFilters.searchTerm) {
      const searchLower = taskFilters.searchTerm.toLowerCase();
      const inTitle = task.title.toLowerCase().includes(searchLower);
      const inDescription = task.description?.toLowerCase().includes(searchLower);
      if (!inTitle && !inDescription) return false;
    }
    
    // Status filter
    if (taskFilters.status === 'completed' && !task.completed) return false;
    if (taskFilters.status === 'pending' && (task.completed || task.archived)) return false;
    if (taskFilters.status === 'archived' && !task.archived) return false;
    
    // Urgent filter
    if (taskFilters.urgentOnly && !task.urgent) return false;
    
    // Impact filter
    if (taskFilters.selectedImpact && task.impact !== taskFilters.selectedImpact) return false;
    
    // Project filter
    if (taskFilters.selectedProjectId) {
      if (taskFilters.selectedProjectId === 'uncategorized') {
        if (task.projectId) return false;
      } else if (task.projectId !== taskFilters.selectedProjectId) {
        return false;
      }
    }
    
    // Milestone filter
    if (taskFilters.selectedMilestoneId && task.milestoneId !== taskFilters.selectedMilestoneId) return false;
    
    return true;
  }), [tasks, taskFilters]);
  
  // Sort the filtered tasks
  const sortedTasks = useMemo(() => [...filteredTasks].sort((a, b) => {
    if (taskFilters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (taskFilters.sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (taskFilters.sortBy === 'priority') {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.impact] - priorityOrder[a.impact];
    } else {
      // deadline
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
  }), [filteredTasks, taskFilters.sortBy]);
  
  // Select first task by default
  useEffect(() => {
    if (sortedTasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(sortedTasks[0].id);
    } else if (sortedTasks.length > 0 && !sortedTasks.find(t => t.id === selectedTaskId)) {
      // If the selected task is no longer in the filtered list, select the first task
      setSelectedTaskId(sortedTasks[0].id);
    } else if (sortedTasks.length === 0) {
      setSelectedTaskId(undefined);
    }
  }, [sortedTasks, selectedTaskId]);
  
  // Update the filter tags section
  const filterTags = [];
  
  if (taskFilters.status !== 'pending') {
    filterTags.push({
      id: 'status',
      label: taskFilters.status === 'completed' ? 'Completed' : 'Archived',
      color: taskFilters.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400',
      icon: <CheckCircle2 size={14} className="flex-shrink-0" />
    });
  }
  
  if (taskFilters.urgentOnly) {
    filterTags.push({
      id: 'urgent',
      label: 'Urgent',
      color: 'bg-red-500/20 text-red-400',
      icon: <AlertTriangle size={14} className="flex-shrink-0" />
    });
  }
  
  if (taskFilters.selectedImpact) {
    filterTags.push({
      id: 'impact',
      label: `Impact: ${taskFilters.selectedImpact}`,
      color: 'bg-blue-500/20 text-blue-400',
      icon: <Target size={14} className="flex-shrink-0" />
    });
  }

  if (taskFilters.selectedProjectId) {
    filterTags.push({
      id: 'project',
      label: taskFilters.selectedProjectId === 'uncategorized' ? 
        'Project: Uncategorized' : 
        `Project: ${projects.find(p => p.id === taskFilters.selectedProjectId)?.title || 'Unknown'}`,
      color: 'bg-purple-500/20 text-purple-400',
      icon: <Briefcase size={14} className="flex-shrink-0" />
    });
  }
  
  if (taskFilters.selectedMilestoneId) {
    const milestone = milestones.find(m => m.id === taskFilters.selectedMilestoneId);
    if (milestone) {
    filterTags.push({
      id: 'milestone',
        label: `Milestone: ${milestone.title}`,
        color: 'bg-orange-500/20 text-orange-400',
      icon: <Target size={14} className="flex-shrink-0" />
    });
    }
  }
  
  // Handle removing a single filter tag
  const handleRemoveTag = (id: string) => {
    if (id === 'status') setTaskStatusFilter('pending');
    else if (id === 'urgent') setTaskUrgentFilter(false);
    else if (id === 'impact') setTaskImpactFilter(null);
    else if (id === 'project') setTaskProjectFilter('');
    else if (id === 'milestone') setTaskMilestoneFilter(null);
  };

  // Handler for updating a task
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
  };

  // Handler for updating task impact
  const handleUpdateImpact = (taskId: string, impact: ImpactLevel) => {
    updateTask(taskId, { impact });
  };

  // Handler for archiving a task
  const handleArchive = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTaskToArchive(task);
      setShowArchiveConfirm(true);
    }
  };
  
  // Sort options
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'priority', label: 'Priority' },
    { id: 'deadline', label: 'Deadline' }
  ];
  
  // Get selected task
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  
  // Handle opening the task modal
  const handleOpenTaskModal = (task?: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  // Handle closing the task modal
  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(undefined);
  };
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <div className="flex items-center space-x-3">
            <FilterBar
              searchPlaceholder="Search tasks..."
              searchTerm={taskFilters.searchTerm}
              onSearchChange={setTaskSearchTerm}
              sortOptions={sortOptions}
              currentSortOption={taskFilters.sortBy}
              onSortChange={(option) => setTaskSortBy(option as 'newest' | 'oldest' | 'priority' | 'deadline')}
              filterTags={filterTags}
              onRemoveTag={handleRemoveTag}
              onClearAll={clearTaskFilters}
              onToggleFilters={() => setShowTaskFilters(!showTaskFilters)}
              isFiltersOpen={showTaskFilters}
            >
              <button 
                onClick={() => handleOpenTaskModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus size={18} />
                <span>Add Task</span>
              </button>
            </FilterBar>
          </div>
        </div>

        {/* Active Filters */}
        {filterTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filterTags.map((tag) => (
              <span
                key={tag.id}
                className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${tag.color}`}
              >
                {tag.icon}
                {tag.label}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:text-white"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            <button
              onClick={clearTaskFilters}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex mb-4">
          <button
            onClick={() => setTaskStatusFilter('pending')}
            className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
              taskFilters.status === 'pending' 
                ? 'bg-zinc-700 text-white' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setTaskStatusFilter('completed')}
            className={`px-3 py-2 text-sm transition-colors ${
              taskFilters.status === 'completed' 
                ? 'bg-zinc-700 text-green-400' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setTaskStatusFilter('archived')}
            className={`px-3 py-2 text-sm rounded-r-lg transition-colors ${
              taskFilters.status === 'archived' 
                ? 'bg-zinc-700 text-zinc-300' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Archived
          </button>
        </div>

        {showTaskFilters && (
          <FilterPanel
            title="Filter Tasks"
          >
            {/* Project Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Briefcase size={14} className="mr-2 text-blue-400" />
                Project
              </h3>
              <select
                value={taskFilters.selectedProjectId}
                onChange={(e) => setTaskProjectFilter(e.target.value)}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!taskFilters.selectedMilestoneId}
              >
                {taskFilters.selectedMilestoneId ? (
                  <option value={milestones.find(m => m.id === taskFilters.selectedMilestoneId)?.projectId || ''}>
                    {projects.find(p => p.id === milestones.find(m => m.id === taskFilters.selectedMilestoneId)?.projectId)?.title || 'Unknown'}
                  </option>
                ) : (
                  <>
                <option value="">All Projects</option>
                <option value="uncategorized">Uncategorized</option>
                    {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
                  </>
                )}
              </select>
            </div>

            {/* Milestone Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Target size={14} className="mr-2 text-purple-400" />
                  Milestone
                </h3>
                <select
                value={taskFilters.selectedMilestoneId || ''}
                onChange={(e) => setTaskMilestoneFilter(e.target.value || null)}
                disabled={taskFilters.selectedProjectId === 'uncategorized'}
                className={`w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  taskFilters.selectedProjectId === 'uncategorized' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                >
                  <option value="">All Milestones</option>
                  {availableMilestones.map(milestone => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </option>
                  ))}
                </select>
              {taskFilters.selectedProjectId === 'uncategorized' && (
                <p className="text-xs text-zinc-500 mt-1">Milestone filter is disabled for uncategorized tasks</p>
            )}
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <CheckCircle2 size={14} className="mr-2 text-green-400" />
                Status
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setTaskStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    taskFilters.status === 'pending'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setTaskStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    taskFilters.status === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setTaskStatusFilter('incomplete')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    taskFilters.status === 'incomplete'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Incomplete
                </button>
              </div>
            </div>
          </FilterPanel>
        )}

        {/* Main content with split view */}
        <div className="flex gap-6">
          {/* Task List - Fixed width container */}
          <div className="w-[600px] flex-shrink-0">
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-400">No tasks found</p>
                  <p className="text-sm text-zinc-500 mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <TaskList
                  tasks={sortedTasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={setSelectedTaskId}
                      onToggleUrgent={toggleTaskUrgent}
                  onToggleCompleted={toggleTask}
                  onArchive={handleArchive}
                  onUnarchive={(taskFilters.status === 'archived') ? unarchiveTask : undefined}
                  onAskQuestion={onAskQuestion}
                  onUpdateImpact={handleUpdateImpact}
                    />
              )}
            </div>
          </div>

          {/* Task Detail Panel - Flexible width */}
          {selectedTask && (
            <div className="flex-1 border-l border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden">
              <TaskDetail
                task={selectedTask}
                projects={projects}
                milestones={milestones}
                onSave={handleUpdateTask}
                onToggleUrgent={toggleTaskUrgent}
                onToggleCompleted={toggleTask}
                onArchive={(id) => {
                  const task = tasks.find(t => t.id === id);
                  if (task) {
                    setTaskToArchive(task);
                    setShowArchiveConfirm(true);
                  }
                }}
                onUnarchive={(taskFilters.status === 'archived') ? unarchiveTask : undefined}
                onAskQuestion={onAskQuestion}
              />
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          projectId={taskFilters.selectedProjectId || undefined}
          milestoneId={taskFilters.selectedMilestoneId || undefined}
          onClose={handleCloseTaskModal}
          initialData={editingTask}
        />
      )}
      
      {/* Archive Confirmation */}
      {showArchiveConfirm && (
        <ConfirmationDialog
          message="Are you sure you want to archive this task? Archived tasks won't appear in your active tasks list."
          confirmText="Archive Task"
          onConfirm={() => {
            if (taskToArchive) {
              archiveTask(taskToArchive.id);
              setShowArchiveConfirm(false);
              setTaskToArchive(null);
            }
          }}
          onCancel={() => {
            setShowArchiveConfirm(false);
            setTaskToArchive(null);
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;