import React, { useState } from 'react';
import { useGoalsStore } from '../store/goalsStore';
import { useFeedStore } from '../store/feedStore';
import { Target, Briefcase, GraduationCap, Calendar, Plus, CheckCircle, Archive, BookMarked, Video, Newspaper, Globe, Image as ImageIcon } from 'lucide-react';
import Comments from '../components/Comments';
import ArchiveModal from '../components/ArchiveModal';

interface GoalsPageProps {
  onPageChange: (page: 'home') => void;
}

const GoalsPage: React.FC<GoalsPageProps> = () => {
  const { 
    goals, 
    projects,
    getProjectsByGoal,
    archiveGoal,
    archiveProject,
    toggleTask,
    getUncategorizedTasksByProject
  } = useGoalsStore();
  const { feedItems, isBookmarked, toggleBookmark } = useFeedStore();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState<{ type: 'goal' | 'project'; id: string; title: string } | null>(null);

  const icons = {
    target: Target,
    briefcase: Briefcase,
    'graduation-cap': GraduationCap,
  };

  const feedIcons = {
    article: Newspaper,
    video: Video,
    blog: Globe,
    bookmark: BookMarked,
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId && !g.archived);
  const goalProjects = selectedGoal ? getProjectsByGoal(selectedGoal.id) : [];
  const selectedProject = goalProjects.find(p => p.id === selectedProjectId);

  const relatedBookmarks = feedItems.filter(item => {
    if (!selectedGoal) return false;
    if (!selectedProject) {
      return item.goal === selectedGoal.title;
    }
    return item.project === selectedProject.title;
  });

  return (
    <div className="flex-1 flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Goals Sidebar */}
      <div className="w-64 border-r border-zinc-800 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Goals</h2>
        <div className="space-y-2">
          {goals.filter(g => !g.archived).map(goal => {
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedGoal && (
          <div className="flex-1 overflow-y-auto">
            {/* Goal Header */}
            <div className="border-b border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{selectedGoal.title}</h1>
                  <p className="text-zinc-400 mt-1">{selectedGoal.description}</p>
                </div>
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
              </div>
            </div>

            {/* Projects and Tasks */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Projects List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Projects</h2>
                    <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {goalProjects.map(project => (
                      <div
                        key={project.id}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          selectedProjectId === project.id
                            ? 'bg-zinc-800 border-zinc-700'
                            : 'bg-zinc-900 border-transparent hover:border-zinc-700'
                        }`}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{project.title}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowArchiveModal({
                                type: 'project',
                                id: project.id,
                                title: project.title
                              });
                            }}
                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Archive size={16} />
                          </button>
                        </div>
                        {project.description && (
                          <p className="text-sm text-zinc-400 mb-3">{project.description}</p>
                        )}
                        <div className="h-1 bg-zinc-800 rounded-full">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks and Related Content */}
                <div className="space-y-6">
                  {selectedProject && (
                    <>
                      {/* Uncategorized Tasks */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold">Tasks</h2>
                          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                            <Plus size={20} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {getUncategorizedTasksByProject(selectedProject.id).map(task => (
                            <div key={task.id} className="flex items-start space-x-3 p-2 hover:bg-zinc-900 rounded-lg">
                              <button
                                onClick={() => toggleTask(task.id)}
                                className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${
                                  task.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-zinc-600 hover:border-green-500'
                                }`}
                              >
                                {task.completed && <CheckCircle size={14} className="text-white" />}
                              </button>
                              <div className="flex-1">
                                <span className={task.completed ? 'line-through text-zinc-500' : ''}>
                                  {task.title}
                                </span>
                                {task.deadline && (
                                  <div className="flex items-center space-x-1 text-xs text-zinc-500 mt-1">
                                    <Calendar size={12} />
                                    <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Related Content */}
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Related Content</h2>
                        <div className="space-y-4">
                          {relatedBookmarks.map(item => {
                            const Icon = feedIcons[item.type];
                            const bookmarked = isBookmarked(item.id);
                            
                            return (
                              <div key={item.id} className="group bg-zinc-900 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                                    {item.thumbnail ? (
                                      <img 
                                        src={item.thumbnail} 
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon size={20} className="text-zinc-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Icon size={16} className="text-zinc-400" />
                                        <span className="text-xs text-zinc-500">{item.source}</span>
                                      </div>
                                      <button
                                        onClick={() => toggleBookmark(item.id)}
                                        className={`${bookmarked ? 'text-yellow-500' : 'text-zinc-400'} hover:text-yellow-400`}
                                      >
                                        <BookMarked size={16} />
                                      </button>
                                    </div>
                                    <a 
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-1 text-sm font-medium hover:text-blue-400 transition-colors block"
                                    >
                                      {item.title}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showArchiveModal && (
        <ArchiveModal
          entityType={showArchiveModal.type}
          entityTitle={showArchiveModal.title}
          onArchive={(reason) => {
            if (showArchiveModal.type === 'goal') {
              archiveGoal(showArchiveModal.id);
            } else {
              archiveProject(showArchiveModal.id);
            }
            setShowArchiveModal(null);
          }}
          onClose={() => setShowArchiveModal(null)}
        />
      )}
    </div>
  );
};

export default GoalsPage;