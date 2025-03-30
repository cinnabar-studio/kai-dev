import React, { useState } from 'react';
import { Target, Briefcase, GraduationCap, Calendar, Plus, CheckCircle, Archive, BookMarked, Video, Newspaper, Globe, Image as ImageIcon, Filter, X, ArrowUpDown, ClipboardList, ArrowLeft, Eye, Clipboard, Edit, CheckCircle2 } from 'lucide-react';
import { useGoalsStore } from '../store/goalsStore';
import Comments from './Comments';
import ArchiveModal from './ArchiveModal';
import GoalModal from './modals/GoalModal';
import ProjectModal from './modals/ProjectModal';
import MilestoneModal from './modals/MilestoneModal';
import TaskModal from './modals/TaskModal';
import ProjectResults from './ProjectResults';

type ViewMode = 'goals';

interface TaskViewDetail {
  id: string;
  title: string;
  mode: ViewMode;
  parentId?: string;
  parentTitle?: string;
}

const GoalsPanel = () => {
  const { 
    goals, 
    projects,
    tasks,
    getProjectsByGoal,
    getMilestonesByProject,
    getUncategorizedTasksByProject,
    getTasksByMilestone,
    archiveGoal,
    archiveProject,
    toggleTask
  } = useGoalsStore();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState<{
    projectId?: string;
    milestoneId?: string;
    initialData?: any;
  } | null>(null);
  
  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState<{
    goalId: string;
    project?: any;
  } | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState<{
    projectId: string;
    milestone?: any;
  } | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState<{ type: 'goal' | 'project'; id: string; title: string } | null>(null);

  const icons = {
    target: Target,
    briefcase: Briefcase,
    'graduation-cap': GraduationCap,
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const goalProjects = selectedGoal ? getProjectsByGoal(selectedGoal.id) : [];
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const milestones = selectedProject ? getMilestonesByProject(selectedProject.id) : [];
  
  // Get uncategorized tasks for the selected project
  const uncategorizedTasks = selectedProject 
    ? getUncategorizedTasksByProject(selectedProject.id).filter(t => !t.archived)
    : [];

  // Navigate to tasks page with specific filters
  const navigateToProjectTasks = (projectId: string) => {
    // In a real implementation, this would navigate to the tasks page with a filter
    // for the specific project. For now, we'll open the browser's console to simulate this.
    console.log(`Navigating to tasks for project: ${projectId}`);
    window.open(`/tasks?project=${projectId}`, '_blank');
  };

  const navigateToMilestoneTasks = (milestoneId: string) => {
    // In a real implementation, this would navigate to the tasks page with a filter
    // for the specific milestone. For now, we'll open the browser's console to simulate this.
    console.log(`Navigating to tasks for milestone: ${milestoneId}`);
    window.open(`/tasks?milestone=${milestoneId}`, '_blank');
  };

  return (
    <div className="flex-1 flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 overflow-y-auto">
        {/* Goals Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Goals</h2>
            <button 
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
              onClick={() => setShowGoalModal(true)}
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-2">
            {goals.map(goal => {
              if (goal.archived) return null;
              const Icon = icons[goal.icon];
              
              return (
                <button
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoalId(goal.id);
                    setSelectedProjectId(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedGoalId === goal.id
                      ? 'bg-zinc-800'
                      : 'hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} className={`text-${goal.color}-400`} />
                    <span>{goal.title}</span>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-zinc-400 mt-1 ml-7">{goal.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedGoal ? (
          <div className="p-6 space-y-8">
            {/* Goal Header */}
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{selectedGoal.title}</h1>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowArchiveModal({
                      type: 'goal',
                      id: selectedGoal.id,
                      title: selectedGoal.title
                    })}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                  >
                    <Archive size={20} />
                  </button>
                  <button 
                    onClick={() => setShowProjectModal({ goalId: selectedGoal.id })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Add Project</span>
                  </button>
                </div>
              </div>
              <p className="text-zinc-400 mt-1">{selectedGoal.description}</p>
            </div>

            {/* Projects Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Projects</h2>
              <div className="grid grid-cols-2 gap-4">
                {goalProjects.map(project => (
                  <div
                    key={project.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedProjectId === project.id
                        ? 'bg-zinc-800 border-zinc-700'
                        : 'bg-zinc-900 border-transparent hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <h3 className="font-medium">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-zinc-400 mt-1">{project.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowProjectModal({ 
                            goalId: selectedGoal.id,
                            project
                          })}
                          className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setShowArchiveModal({
                            type: 'project',
                            id: project.id,
                            title: project.title
                          })}
                          className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-red-400"
                        >
                          <Archive size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Project Progress */}
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-zinc-400">Progress</span>
                        <span className="text-zinc-400">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Project Results */}
                    {project.results && project.results.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        <ProjectResults 
                          projectId={project.id}
                          results={project.results}
                        />
                      </div>
                    )}

                    {/* Tasks button - reduced spacing with mt-2 instead of mt-4 */}
                    <div className="flex justify-end mt-2 pt-3 border-t border-zinc-800">
                      <button
                        onClick={() => navigateToProjectTasks(project.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center space-x-1.5 transition-colors"
                      >
                        <Eye size={14} />
                        <span className="text-sm">Tasks</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Project Details */}
            {selectedProject && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Milestones</h2>
                  <button 
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                    onClick={() => setShowMilestoneModal({ projectId: selectedProject.id })}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Milestones */}
                  {milestones.map(milestone => (
                    <div key={milestone.id} className="bg-zinc-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{milestone.title}</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowMilestoneModal({ 
                              projectId: selectedProject.id,
                              milestone
                            })}
                            className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                            title="Edit milestone"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>

                      {milestone.description && (
                        <p className="text-sm text-zinc-400 mb-4">{milestone.description}</p>
                      )}
                      
                      <div className="flex flex-col space-y-3 mt-auto">
                        {milestone.deadline && (
                          <div className="flex items-center space-x-1 text-sm text-zinc-500">
                            <Calendar size={14} />
                            <span>Due {new Date(milestone.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {/* Tasks count and view button */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-500">
                            {getTasksByMilestone(milestone.id).filter(t => !t.archived).length} tasks
                          </div>
                          <button
                            onClick={() => navigateToMilestoneTasks(milestone.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center space-x-1.5 transition-colors"
                          >
                            <Eye size={14} />
                            <span className="text-sm">Tasks</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Other Tasks Card - Make the bottom content sticky */}
                  <div className="bg-zinc-900 rounded-lg p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Other Tasks</h3>
                      <button
                        onClick={() => setShowTaskModal({ projectId: selectedProject.id })}
                        className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mt-2">
                      Tasks not assigned to any milestone
                    </p>
                    
                    {/* Empty space in the middle */}
                    <div className="flex-grow"></div>
                    
                    {/* Show task count and button at the bottom */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                      <div className="text-sm text-zinc-500">
                        {uncategorizedTasks.length} tasks
                      </div>
                      
                      {/* View Tasks button */}
                      <button
                        onClick={() => navigateToProjectTasks(selectedProject.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center space-x-1.5 transition-colors"
                      >
                        <Eye size={14} />
                        <span className="text-sm">Tasks</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            <p>Select a goal to view projects and milestones</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showGoalModal && (
        <GoalModal onClose={() => setShowGoalModal(false)} />
      )}
      
      {showProjectModal && (
        <ProjectModal 
          goalId={showProjectModal.goalId}
          initialData={showProjectModal.project}
          onClose={() => setShowProjectModal(null)} 
        />
      )}
      
      {showMilestoneModal && (
        <MilestoneModal 
          projectId={showMilestoneModal.projectId}
          initialData={showMilestoneModal.milestone}
          onClose={() => setShowMilestoneModal(null)}
        />
      )}

      {showTaskModal && (
        <TaskModal
          projectId={showTaskModal.projectId}
          milestoneId={showTaskModal.milestoneId}
          initialData={showTaskModal.initialData}
          onClose={() => setShowTaskModal(null)}
        />
      )}

      {showArchiveModal && (
        <ArchiveModal
          entityType={showArchiveModal.type}
          entityTitle={showArchiveModal.title}
          onArchive={(reason) => {
            if (showArchiveModal.type === 'goal') {
              archiveGoal(showArchiveModal.id);
              setSelectedGoalId(null);
            } else {
              archiveProject(showArchiveModal.id);
              setSelectedProjectId(null);
            }
            setShowArchiveModal(null);
          }}
          onClose={() => setShowArchiveModal(null)}
        />
      )}
    </div>
  );
};

export default GoalsPanel;