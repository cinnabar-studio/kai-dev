import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import { useGoalsStore, type Task, type ImpactLevel } from '../store/goalsStore';
import { useCommentsStore } from '../store/commentsStore';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/modals/TaskModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import FilterSortBar from '../components/FilterSortBar';
import FilterPanel from '../components/FilterPanel';
import ImpactSelect from '../components/ImpactSelect';
import Comments from '../components/Comments';

// Status filters
type StatusFilter = 'all' | 'completed' | 'archived';

interface TasksPageProps {
  onAskQuestion: (itemId: string, question: string) => void;
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
      <div className="border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <button
            onClick={() => onToggleCompleted(task.id)}
            className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center ${
              task.completed
                ? 'bg-green-500 border-green-500'
                : 'border-zinc-600 hover:border-green-500'
            }`}
          >
            {task.completed && <CheckCircle size={16} className="text-white" />}
          </button>
          <h2 className="text-lg font-semibold truncate max-w-[calc(100%-200px)]">{task.title}</h2>
        </div>
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          {/* Archive Button - Separate as requested */}
          {task.archived && onUnarchive ? (
            <button
              onClick={() => onUnarchive(task.id)}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm flex items-center space-x-1"
            >
              <Archive size={14} className="text-blue-400" />
              <span className="text-blue-400">Unarchive</span>
            </button>
          ) : (
            <button
              onClick={() => onArchive(task.id)}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm flex items-center space-x-1"
            >
              <Archive size={14} className="text-red-400" />
              <span className="text-red-400">Archive</span>
            </button>
          )}
          
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center space-x-1"
            >
              <Save size={14} />
              <span>Save</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center space-x-1"
            >
              <Edit size={14} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="bg-zinc-900 rounded-lg px-3 py-2 break-words">{task.title}</div>
              )}
            </div>
            
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
                  {task.description || <span className="text-zinc-500 italic">No description</span>}
                </div>
              )}
            </div>
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
                  <div className="whitespace-pre-wrap">{task.notes}</div>
                ) : (
                  <span className="text-zinc-500 italic">No notes added</span>
                )}
              </div>
            )}
          </div>
          
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Priority</label>
              {isEditing ? (
                <div className="space-y-2">
                  <ImpactSelect 
                    value={editedTask.impact as ImpactLevel} 
                    onChange={(impact) => setEditedTask({ ...editedTask, impact })} 
                  />
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
                </div>
              ) : (
                <div className="space-y-2">
                  <div className={`inline-block px-3 py-1 rounded-lg text-sm ${
                    task.impact === 'High' 
                      ? 'bg-red-500/20 text-red-400' 
                      : task.impact === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {task.impact} Impact
                  </div>
                  
                  {task.urgent && (
                    <div className="flex items-center">
                      <button
                        onClick={() => onToggleUrgent(task.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm"
                      >
                        <AlertTriangle size={14} />
                        <span>Urgent</span>
                      </button>
                    </div>
                  )}
                </div>
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
                  onChange={(e) => setEditedTask({ ...editedTask, projectId: e.target.value || null })}
                  className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Uncategorized</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              ) : (
                <div className="bg-zinc-900 rounded-lg px-3 py-2 flex items-center space-x-2">
                  <Briefcase size={16} className="text-blue-400" />
                  <span>
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
                  onChange={(e) => setEditedTask({ ...editedTask, milestoneId: e.target.value || null })}
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
                      <Target size={16} className="text-purple-400" />
                      <span>
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
  // Get all tasks data from store
  const { 
    tasks, 
    toggleTask, 
    archiveTask, 
    unarchiveTask, 
    updateTask,
    updateTaskImpact, 
    toggleTaskUrgent,
    projects,
    milestones,
    getMilestonesByProject,
    updateTaskNotes
  } = useGoalsStore();
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [selectedImpact, setSelectedImpact] = useState<ImpactLevel | ''>('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [showTasksFilters, setShowTasksFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'alpha-asc' | 'alpha-desc'>('date-desc');
  
  // State for editing tasks
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [showArchiveConfirmation, setShowArchiveConfirmation] = useState<string | null>(null);
  
  // State for selected task
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Filter for available milestones based on selected project
  const [availableMilestones, setAvailableMilestones] = useState<Array<{ id: string; title: string }>>([]);

  // Update available milestones whenever the selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      const projectMilestones = getMilestonesByProject(selectedProjectId)
        .filter(m => !m.archived)
        .map(m => ({ id: m.id, title: m.title }));
      setAvailableMilestones(projectMilestones);
      
      // Reset milestone selection if not part of new project
      if (selectedMilestoneId) {
        const milestoneExists = projectMilestones.some(m => m.id === selectedMilestoneId);
        if (!milestoneExists) {
          setSelectedMilestoneId('');
        }
      }
    } else {
      setAvailableMilestones([]);
      setSelectedMilestoneId('');
    }
  }, [selectedProjectId, getMilestonesByProject, selectedMilestoneId]);

  // Filter tasks based on search, status, etc.
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !task.title.toLowerCase().includes(searchLower) &&
        !(task.description || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter === 'completed' && !task.completed) return false;
    if (statusFilter === 'all' && task.archived) return false;
    if (statusFilter === 'archived' && !task.archived) return false;
    
    // For 'all' filter, show both completed and non-completed tasks that aren't archived
    
    // Urgent filter
    if (urgentOnly && !task.urgent) return false;
    
    // Impact filter
    if (selectedImpact && task.impact !== selectedImpact) return false;
    
    // Project filter
    if (selectedProjectId && task.projectId !== selectedProjectId) return false;
    
    // Milestone filter
    if (selectedMilestoneId && task.milestoneId !== selectedMilestoneId) return false;
    
    return true;
  });
  
  // Sort the filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'date-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'alpha-asc') {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });
  
  // Select first task by default
  useEffect(() => {
    if (sortedTasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(sortedTasks[0].id);
    } else if (sortedTasks.length > 0 && !sortedTasks.find(t => t.id === selectedTaskId)) {
      // If the selected task is no longer in the filtered list, select the first task
      setSelectedTaskId(sortedTasks[0].id);
    } else if (sortedTasks.length === 0) {
      setSelectedTaskId(null);
    }
  }, [sortedTasks, selectedTaskId]);
  
  // Get all available projects (non-archived)
  const availableProjects = projects.filter(p => !p.archived);
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setUrgentOnly(false);
    setSelectedImpact('');
    setSelectedProjectId('');
    setSelectedMilestoneId('');
  };
  
  // Handler for updating a task
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
    
    // Update task notes separately if it exists in the updates
    if (updates.notes !== undefined) {
      updateTaskNotes(taskId, updates.notes);
    }
  };
  
  // Confirm archiving a task
  const confirmArchiveTask = () => {
    if (showArchiveConfirmation) {
      archiveTask(showArchiveConfirmation);
      setShowArchiveConfirmation(null);
    }
  };

  // Prepare filter tags for the Filter Panel
  const filterTags = [];
  
  if (searchTerm) {
    filterTags.push({
      id: 'search',
      label: `Search: ${searchTerm}`,
      color: 'bg-blue-600/20 text-blue-400',
      icon: <Search size={14} className="flex-shrink-0" />
    });
  }
  
  if (statusFilter !== 'all') {
    filterTags.push({
      id: 'status',
      label: statusFilter === 'completed' ? 'Completed' : 'Archived',
      color: statusFilter === 'completed' ? 'bg-green-500/20 text-green-400' : 
             'bg-zinc-500/20 text-zinc-400',
      icon: <CheckCircle2 size={14} className="flex-shrink-0" />
    });
  }
  
  if (urgentOnly) {
    filterTags.push({
      id: 'urgent',
      label: 'Urgent Only',
      color: 'bg-red-500/20 text-red-400',
      icon: <AlertTriangle size={14} className="flex-shrink-0" />
    });
  }
  
  if (selectedImpact) {
    filterTags.push({
      id: 'impact',
      label: `Impact: ${selectedImpact}`,
      color: selectedImpact === 'High' ? 'bg-red-500/20 text-red-400' :
             selectedImpact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
             'bg-blue-500/20 text-blue-400',
      icon: <ChevronUp size={14} className="flex-shrink-0" />
    });
  }
  
  if (selectedProjectId) {
    filterTags.push({
      id: 'project',
      label: availableProjects.find(p => p.id === selectedProjectId)?.title || 'Unknown Project',
      color: 'bg-blue-600/20 text-blue-400',
      icon: <Briefcase size={14} className="flex-shrink-0" />
    });
  }
  
  if (selectedMilestoneId) {
    filterTags.push({
      id: 'milestone',
      label: availableMilestones.find(m => m.id === selectedMilestoneId)?.title || 'Unknown Milestone',
      color: 'bg-purple-600/20 text-purple-400',
      icon: <Target size={14} className="flex-shrink-0" />
    });
  }
  
  // Handle removing a single filter tag
  const handleRemoveTag = (id: string) => {
    if (id === 'search') setSearchTerm('');
    else if (id === 'status') setStatusFilter('all');
    else if (id === 'urgent') setUrgentOnly(false);
    else if (id === 'impact') setSelectedImpact('');
    else if (id === 'project') setSelectedProjectId('');
    else if (id === 'milestone') setSelectedMilestoneId('');
  };
  
  // Sort options
  const sortOptions = [
    { id: 'date-desc', label: 'Newest First' },
    { id: 'date-asc', label: 'Oldest First' },
    { id: 'alpha-asc', label: 'A-Z' },
    { id: 'alpha-desc', label: 'Z-A' }
  ];
  
  // Get selected task
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <div className="flex items-center space-x-3">
            <FilterSortBar
              searchPlaceholder="Search tasks..."
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortOptions={sortOptions}
              currentSortOption={sortBy}
              onSortChange={(option) => setSortBy(option as 'date-asc' | 'date-desc' | 'alpha-asc' | 'alpha-desc')}
              isFilterActive={showTasksFilters || filterTags.length > 0}
              onToggleFilters={() => setShowTasksFilters(!showTasksFilters)}
            >
              <button 
                onClick={() => {
                  setTaskToEdit(null);
                  setShowTaskModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus size={18} />
                <span>Add Task</span>
              </button>
            </FilterSortBar>
          </div>
        </div>
        
        {/* Status Tabs */}
        <div className="flex mb-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
              statusFilter === 'all' 
                ? 'bg-zinc-700 text-white' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-2 text-sm transition-colors ${
              statusFilter === 'completed' 
                ? 'bg-zinc-700 text-green-400' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-2 text-sm rounde
d-r-lg transition-colors ${
              statusFilter === 'archived' 
                ? 'bg-zinc-700 text-zinc-300' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Archived
          </button>
        </div>
        
        {/* Filters Panel */}
        {showTasksFilters && (
          <FilterPanel
            title="Filter Tasks"
            activeTags={filterTags}
            onRemoveTag={handleRemoveTag}
            onClearAll={clearFilters}
          >
            {/* Urgent Toggle */}
            <div>
              <div className="flex items-center mb-2">
                <h3 className="text-sm font-medium flex items-center flex-1">
                  <AlertTriangle size={14} className="mr-2 text-red-400" />
                  Urgency
                </h3>
                <button
                  onClick={() => setUrgentOnly(!urgentOnly)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    urgentOnly ? 'bg-red-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      urgentOnly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                {urgentOnly ? 'Showing urgent tasks only' : 'Showing all tasks'}
              </p>
            </div>
            
            {/* Impact Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <ChevronUp size={14} className="mr-2 text-yellow-400" />
                Impact
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedImpact('')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedImpact === ''
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedImpact('High')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedImpact === 'High'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  High
                </button>
                <button
                  onClick={() => setSelectedImpact('Medium')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedImpact === 'Medium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setSelectedImpact('Low')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedImpact === 'Low'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  Low
                </button>
              </div>
            </div>
            
            {/* Project Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Briefcase size={14} className="mr-2 text-blue-400" />
                Project
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedProjectId('')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedProjectId === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  All Projects
                </button>
                <button
                  onClick={() => setSelectedProjectId('uncategorized')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedProjectId === 'uncategorized'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Uncategorized
                </button>
                {availableProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedProjectId === project.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Milestone Filter - Only show if a project is selected */}
            {selectedProjectId && selectedProjectId !== 'uncategorized' && availableMilestones.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Target size={14} className="mr-2 text-purple-400" />
                  Milestone
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedMilestoneId('')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedMilestoneId === ''
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    All Milestones
                  </button>
                  {availableMilestones.map(milestone => (
                    <button
                      key={milestone.id}
                      onClick={() => setSelectedMilestoneId(milestone.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedMilestoneId === milestone.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {milestone.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </FilterPanel>
        )}
      </div>
      
      {/* Main content with split view */}
      <div className="flex-1 overflow-hidden flex p-6 pt-0">
        {/* Task List - Fixed width container */}
        <div className="w-[600px] flex-shrink-0 overflow-y-auto pr-4">
          <div className="space-y-3">
            {sortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 mb-2">No tasks found</p>
                <p className="text-sm text-zinc-500">
                  {filterTags.length > 0
                    ? 'Try adjusting your filters'
                    : statusFilter === 'archived'
                    ? 'No archived tasks'
                    : statusFilter === 'completed'
                    ? 'No completed tasks'
                    : 'Create your first task to get started'
                  }
                </p>
              </div>
            ) : (
              sortedTasks.map(task => (
                <div
                  key={task.id}
                  className={`cursor-pointer transition-all rounded-lg border ${
                    selectedTaskId === task.id 
                      ? 'bg-blue-500/5 border-blue-500/50' 
                      : 'border-transparent hover:border-zinc-800 hover:bg-zinc-900/50'
                  }`}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onArchive={(statusFilter === 'archived') 
                      ? undefined 
                      : (id) => setShowArchiveConfirmation(id)}
                    onUnarchive={(statusFilter === 'archived')
                      ? unarchiveTask
                      : undefined}
                    onUpdateImpact={updateTaskImpact}
                    onToggleUrgent={toggleTaskUrgent}
                    onAskQuestion={onAskQuestion}
                  />
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Task Detail Panel - Flexible width */}
        <div className="flex-1 border-l border-zinc-800 pl-4 flex flex-col overflow-hidden">
          {selectedTask ? (
            <TaskDetail
              task={selectedTask}
              projects={availableProjects}
              milestones={milestones}
              onSave={handleUpdateTask}
              onToggleUrgent={toggleTaskUrgent}
              onToggleCompleted={toggleTask}
              onArchive={(id) => setShowArchiveConfirmation(id)}
              onUnarchive={statusFilter === 'archived' ? unarchiveTask : undefined}
              onAskQuestion={onAskQuestion}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-zinc-500">Select a task to view details</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Task Modal for adding/editing */}
      {showTaskModal && (
        <TaskModal
          initialData={taskToEdit || undefined}
          onClose={() => {
            setShowTaskModal(false);
            setTaskToEdit(null);
          }}
        />
      )}
      
      {/* Archive Confirmation */}
      {showArchiveConfirmation && (
        <ConfirmationDialog
          message="Are you sure you want to archive this task? Archived tasks won't appear in your active tasks list."
          confirmText="Archive Task"
          onConfirm={confirmArchiveTask}
          onCancel={() => setShowArchiveConfirmation(null)}
        />
      )}
    </div>
  );
};

export default TasksPage;