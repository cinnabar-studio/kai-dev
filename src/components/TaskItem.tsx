import React, { useState, useRef, useEffect } from 'react';
import { Calendar, CheckCircle, Archive, AlertTriangle, MessageSquare, ChevronDown, Briefcase, Target, Clock, Undo, Edit, ChevronUp } from 'lucide-react';
import { type Task, type ImpactLevel, useGoalsStore } from '../store/goalsStore';
import { useCommentsStore } from '../store/commentsStore';
import Comments from './Comments';
import ImpactBadge from './ImpactBadge';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onUpdateImpact: (id: string, impact: ImpactLevel) => void;
  onToggleUrgent: (id: string) => void;
  onAskQuestion?: (itemId: string, question: string) => void;
}

const impactColors: Record<ImpactLevel, { bg: string; text: string }> = {
  High: { bg: 'bg-red-500/10', text: 'text-red-500' },
  Medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
  Low: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
};

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onArchive,
  onUnarchive,
  onEdit,
  onUpdateImpact,
  onToggleUrgent,
  onAskQuestion
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [question, setQuestion] = useState('');
  const [showImpactDropdown, setShowImpactDropdown] = useState(false);
  const impactDropdownRef = useRef<HTMLDivElement>(null);
  const { getComments } = useCommentsStore();
  const { projects, milestones } = useGoalsStore();
  const { bg, text } = impactColors[task.impact];
  
  const comments = getComments(task.id);
  const commentCount = comments.length;

  // Get project and milestone info
  const project = projects.find(p => p.id === task.projectId);
  const milestone = milestones.find(m => m.id === task.milestoneId);

  // Format the created date
  const formattedCreatedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Close impact dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (impactDropdownRef.current && !impactDropdownRef.current.contains(event.target as Node)) {
        setShowImpactDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAskQuestion = () => {
    if (question.trim() && onAskQuestion) {
      onAskQuestion(task.id, question);
      setQuestion('');
      setShowAskQuestion(false);
    }
  };

  // Truncate title if it's too long
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return `${title.substring(0, maxLength)}...`;
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (!description || description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  return (
    <div className="space-y-2 max-w-2xl">
      {/* Task Card */}
      <div className="flex items-start p-3 transition-colors group">
        {/* Checkbox */}
        <button
          onClick={(e) => { 
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-zinc-600 hover:border-green-500'
          }`}
        >
          {task.completed && <CheckCircle size={14} className="text-white" />}
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0 ml-3">
          <div className="flex items-start">
            {/* Title */}
            <div className="flex-1 min-w-0 mr-4">
              <h3 
                className={`font-medium truncate ${task.completed ? 'line-through text-zinc-500' : ''}`}
                title={task.title} // Show full title on hover
              >
                {truncateTitle(task.title)}
              </h3>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Urgent Toggle Button - Always visible */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleUrgent(task.id);
                }}
                className={`p-1 rounded-md ${
                  task.urgent ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400'
                }`}
                title={task.urgent ? "Remove urgent flag" : "Mark as urgent"}
              >
                <AlertTriangle size={14} />
              </button>
              
              {/* Impact Dropdown */}
              <div className="relative" ref={impactDropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImpactDropdown(!showImpactDropdown);
                  }}
                  className={`p-1 rounded-md ${bg} ${text} hover:opacity-80`}
                  title="Change impact level"
                >
                  <ChevronUp size={14} />
                </button>
                
                {/* Impact Dropdown Menu */}
                {showImpactDropdown && (
                  <div className="absolute right-0 mt-1 w-32 bg-zinc-800 rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateImpact(task.id, 'High');
                        setShowImpactDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-700 text-red-400 flex items-center gap-2"
                    >
                      <ChevronUp size={14} />
                      High Impact
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateImpact(task.id, 'Medium');
                        setShowImpactDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-700 text-yellow-400 flex items-center gap-2"
                    >
                      <ChevronUp size={14} />
                      Medium Impact
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateImpact(task.id, 'Low');
                        setShowImpactDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-700 text-blue-400 flex items-center gap-2"
                    >
                      <ChevronUp size={14} />
                      Low Impact
                    </button>
                  </div>
                )}
              </div>
              
              {/* Edit Button */}
              {onEdit && !task.archived && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white"
                  title="Edit task"
                >
                  <Edit size={14} />
                </button>
              )}
              
              {/* Archive/Unarchive Button */}
              {task.archived && onUnarchive ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnarchive(task.id);
                  }}
                  className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-blue-400"
                  title="Unarchive task"
                >
                  <Undo size={14} />
                </button>
              ) : !task.completed && onArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(task.id);
                  }}
                  className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-red-400"
                  title="Archive task"
                >
                  <Archive size={14} />
                </button>
              )}
            </div>
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center text-xs text-zinc-500 mt-1 flex-wrap gap-y-1 gap-x-2">
            {/* Project and Milestone indicators (simplified) */}
            {project && (
              <div className="flex items-center space-x-1">
                <Briefcase size={10} />
                <span className="truncate max-w-[100px]">{project.title}</span>
              </div>
            )}
            
            {/* Deadline if exists */}
            {task.deadline && (
              <div className="flex items-center space-x-1">
                <Calendar size={10} />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            )}
            
            {/* Comments count */}
            {commentCount > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare size={10} />
                <span>{commentCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="ml-8 mt-2">
          <Comments entityId={task.id} entityType="task" />
        </div>
      )}
    </div>
  );
};

export default TaskItem;