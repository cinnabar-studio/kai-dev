import React, { useState } from 'react';
import { Calendar, CheckCircle, Archive, AlertTriangle, MessageSquare, ChevronDown, Briefcase, Target, Clock, Undo, Eye, EyeOff, Edit, ChevronUp } from 'lucide-react';
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
  const [showDetails, setShowDetails] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [question, setQuestion] = useState('');
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

  return (
    <div className="space-y-2 max-w-2xl">
      {/* Compact Task Card */}
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
                {task.title}
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
              
              {/* Impact Button - Show dropdown on click */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateImpact(task.id, task.impact === 'High' ? 'Medium' : task.impact === 'Medium' ? 'Low' : 'High');
                  }}
                  className={`p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 ${text} hover:text-white`}
                  title="Change impact level"
                >
                  <ChevronUp size={14} />
                </button>
              </div>
              
              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white"
                title={showDetails ? "Hide details" : "View details"}
              >
                {showDetails ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              
              {/* Edit Button - Only in compact mode */}
              {onEdit && !task.archived && !showDetails && (
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
              
              {/* Archive/Unarchive Button - Only in compact mode */}
              {!showDetails && (
                <>
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
                </>
              )}
            </div>
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center text-xs text-zinc-500 mt-1 flex-wrap gap-y-1 gap-x-2">
            {/* Show basic info in compact view */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${bg} ${text}`}>
              <ChevronUp size={10} />
              <span>{task.impact}</span>
            </span>
            
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

      {/* Expanded Details */}
      {showDetails && (
        <div className="bg-zinc-800 rounded-lg p-4 ml-3 border-l-2 border-blue-500">
          {/* Description */}
          {task.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-zinc-400 mb-1">Description</h4>
              <p className="text-sm text-zinc-300">{task.description}</p>
            </div>
          )}
          
          {/* Tags and Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Details</h4>
              <div className="space-y-2">
                {/* Impact */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Impact:</span>
                  <ImpactBadge impact={task.impact} onChange={(impact) => onUpdateImpact(task.id, impact)} />
                </div>
                
                {/* Urgency */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Urgency:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUrgent(task.id);
                    }}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      task.urgent 
                        ? 'bg-red-500/10 text-red-500' 
                        : 'bg-zinc-700 text-zinc-400 hover:text-red-500'
                    }`}
                  >
                    <AlertTriangle size={12} />
                    <span>Urgent</span>
                  </button>
                </div>
                
                {/* Created Date */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Created:</span>
                  <span className="text-xs">{formattedCreatedDate}</span>
                </div>
                
                {/* Deadline */}
                {task.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Deadline:</span>
                    <div className="flex items-center space-x-1 text-xs">
                      <Calendar size={12} />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Organization</h4>
              <div className="space-y-2">
                {/* Project */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Project:</span>
                  {project ? (
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">
                      <Briefcase size={12} />
                      <span>{project.title}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400">Uncategorized</span>
                  )}
                </div>
                
                {/* Milestone */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Milestone:</span>
                  {milestone ? (
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs">
                      <Target size={12} />
                      <span>{milestone.title}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-zinc-700 pt-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowComments(!showComments)}
                className={`px-3 py-1.5 bg-zinc-700 rounded-lg text-xs flex items-center space-x-1 ${
                  showComments ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MessageSquare size={12} />
                <span>{commentCount} Comment{commentCount !== 1 ? 's' : ''}</span>
              </button>
              
              {onAskQuestion && (
                <button
                  onClick={() => setShowAskQuestion(!showAskQuestion)}
                  className={`px-3 py-1.5 bg-zinc-700 rounded-lg text-xs flex items-center space-x-1 ${
                    showAskQuestion ? 'text-orange-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageSquare size={12} />
                  <span>Ask AI</span>
                </button>
              )}
            </div>
            
            {/* Edit/Archive Buttons */}
            <div className="flex items-center space-x-2">
              {onEdit && !task.archived && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-zinc-300"
                >
                  Edit
                </button>
              )}
              
              {task.archived && onUnarchive ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnarchive(task.id);
                  }}
                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-blue-400"
                >
                  Unarchive
                </button>
              ) : !task.completed && onArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(task.id);
                  }}
                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-red-400"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
          
          {/* Ask AI Section */}
          {showAskQuestion && (
            <div className="mt-3 space-y-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask AI about this task..."
                className="w-full bg-zinc-700 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
                rows={2}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAskQuestion(false)}
                  className="px-3 py-1 text-sm text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim()}
                  className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Ask
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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