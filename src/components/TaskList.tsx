import React from 'react';
import { Task, ImpactLevel } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId?: string;
  onSelectTask: (id: string) => void;
  onToggleUrgent: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onAskQuestion: (question: string) => void;
  onUpdateImpact: (id: string, impact: ImpactLevel) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleUrgent,
  onToggleCompleted,
  onArchive,
  onUnarchive,
  onAskQuestion,
  onUpdateImpact
}) => {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`cursor-pointer transition-all rounded-lg border ${
            selectedTaskId === task.id 
              ? 'bg-blue-500/5 border-blue-500/50' 
              : 'border-transparent hover:border-zinc-800 hover:bg-zinc-900/50'
          }`}
          onClick={() => onSelectTask(task.id)}
        >
          <TaskItem
            task={task}
            onToggle={onToggleCompleted}
            onArchive={onArchive}
            onEdit={() => onUpdateImpact(task.id, task.impact)}
            onToggleUrgent={onToggleUrgent}
            onUpdateImpact={onUpdateImpact}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList; 