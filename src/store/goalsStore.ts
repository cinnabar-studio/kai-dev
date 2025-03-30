import { create } from 'zustand';

export type ImpactLevel = 'High' | 'Medium' | 'Low';

interface BaseEntity {
  id: string;
  title: string;
  description?: string;
  archived?: boolean;
  createdAt: string;
}

export interface Task extends BaseEntity {
  completed: boolean;
  deadline?: string;
  milestoneId?: string | null;
  projectId: string;
  impact: ImpactLevel;
  urgent: boolean;
  notes?: string;
}

export interface Milestone extends BaseEntity {
  deadline?: string;
  projectId: string;
  progress: number;
}

export interface CheckIn {
  id: string;
  content: string;
  createdAt: string;
  progress: number;
}

export interface ProjectResult {
  id: string;
  description: string;
  achieved: boolean;
  createdAt: string;
  progress: number;
  checkIns: CheckIn[];
}

export interface Project extends BaseEntity {
  goalId: string;
  progress: number;
  results: ProjectResult[];
}

export interface Goal extends BaseEntity {
  icon: 'target' | 'briefcase' | 'graduation-cap';
  color: string;
}

interface GoalsStore {
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => void;
  archiveGoal: (id: string) => void;
  
  // Project actions
  addProject: (data: {
    title: string;
    description?: string;
    goalId: string;
    results: { id: string; description: string; achieved: boolean; createdAt: string; }[];
  }) => void;
  updateProject: (id: string, updates: {
    title?: string;
    description?: string;
    results?: { id: string; description: string; achieved: boolean; createdAt: string; }[];
  }) => void;
  archiveProject: (id: string) => void;
  
  // Project Results actions
  addProjectResult: (projectId: string, description: string) => void;
  toggleProjectResult: (projectId: string, resultId: string) => void;
  removeProjectResult: (projectId: string, resultId: string) => void;
  addCheckIn: (projectId: string, resultId: string, data: { content: string; progress: number }) => void;
  
  // Milestone actions
  addMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'progress'>) => void;
  updateMilestone: (id: string, updates: Partial<Omit<Milestone, 'id'>>) => void;
  archiveMilestone: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  toggleTask: (id: string) => void;
  archiveTask: (id: string) => void;
  unarchiveTask: (id: string) => void;
  updateTaskImpact: (id: string, impact: ImpactLevel) => void;
  toggleTaskUrgent: (id: string) => void;
  updateTaskNotes: (id: string, notes: string) => void;
  
  // Getters
  getProjectsByGoal: (goalId: string) => Project[];
  getMilestonesByProject: (projectId: string) => Milestone[];
  getTasksByMilestone: (milestoneId: string) => Task[];
  getUncategorizedTasksByProject: (projectId: string) => Task[];
  getGlobalUncategorizedTasks: () => Task[];
}

export const useGoalsStore = create<GoalsStore>((set, get) => ({
  goals: [
    {
      id: '1',
      title: 'Personal Growth',
      description: 'Focus on mindfulness and health improvements',
      icon: 'target',
      color: 'blue',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Career Development',
      description: 'Advance professional skills and position',
      icon: 'briefcase',
      color: 'purple',
      createdAt: new Date().toISOString(),
    },
  ],
  
  projects: [
    {
      id: 'p1',
      title: 'Meditation Practice',
      description: 'Establish daily meditation routine',
      goalId: '1',
      progress: 0,
      results: [],
      createdAt: new Date().toISOString(),
    },
  ],
  
  milestones: [
    {
      id: 'm1',
      title: 'Initial 30-Day Challenge',
      description: 'Complete 30 days of consecutive meditation',
      projectId: 'p1',
      deadline: '2024-04-15',
      progress: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  
  tasks: [
    {
      id: 't1',
      title: 'Set up meditation space',
      projectId: 'p1',
      milestoneId: 'm1',
      completed: false,
      impact: 'Medium',
      urgent: false,
      notes: 'Need to find a quiet corner in the house. Consider buying a meditation cushion and perhaps some plants to create a calming atmosphere.',
      createdAt: new Date().toISOString(),
    },
  ],

  // Goal actions
  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, { ...goal, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
  })),

  updateGoal: (id, updates) => set((state) => ({
    goals: state.goals.map((goal) =>
      goal.id === id ? { ...goal, ...updates } : goal
    ),
  })),

  archiveGoal: (id) => set((state) => ({
    goals: state.goals.map((goal) =>
      goal.id === id ? { ...goal, archived: true } : goal
    ),
  })),

  // Project actions
  addProject: (data) => set((state) => ({
    projects: [
      ...state.projects,
      {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        goalId: data.goalId,
        progress: 0,
        results: data.results.map(r => ({
          ...r,
          progress: 0,
          checkIns: [],
        })),
        createdAt: new Date().toISOString(),
      },
    ],
  })),

  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === id
        ? {
            ...project,
            ...updates,
            results: updates.results !== undefined 
              ? updates.results.map(r => ({
                  ...r,
                  progress: project.results.find(pr => pr.id === r.id)?.progress || 0,
                  checkIns: project.results.find(pr => pr.id === r.id)?.checkIns || [],
                }))
              : project.results,
          }
        : project
    ),
  })),

  archiveProject: (id) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === id ? { ...project, archived: true } : project
    ),
  })),

  // Project Results actions
  addProjectResult: (projectId, description) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            results: [
              ...project.results,
              {
                id: crypto.randomUUID(),
                description,
                achieved: false,
                progress: 0,
                checkIns: [],
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : project
    ),
  })),

  toggleProjectResult: (projectId, resultId) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            results: project.results.map((result) =>
              result.id === resultId
                ? { ...result, achieved: !result.achieved }
                : result
            ),
          }
        : project
    ),
  })),

  removeProjectResult: (projectId, resultId) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            results: project.results.filter((result) => result.id !== resultId),
          }
        : project
    ),
  })),

  addCheckIn: (projectId, resultId, data) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            results: project.results.map((result) =>
              result.id === resultId
                ? {
                    ...result,
                    progress: Math.min(100, result.progress + data.progress),
                    checkIns: [
                      ...result.checkIns,
                      {
                        id: crypto.randomUUID(),
                        content: data.content,
                        progress: data.progress,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : result
            ),
            progress: Math.floor(
              project.results.reduce((acc, result) => {
                if (result.id === resultId) {
                  return acc + Math.min(100, result.progress + data.progress);
                }
                return acc + result.progress;
              }, 0) / project.results.length
            ),
          }
        : project
    ),
  })),

  // Milestone actions
  addMilestone: (milestone) => set((state) => ({
    milestones: [...state.milestones, { 
      ...milestone, 
      id: crypto.randomUUID(), 
      createdAt: new Date().toISOString(),
      progress: 0,
    }],
  })),

  updateMilestone: (id, updates) => set((state) => ({
    milestones: state.milestones.map((milestone) =>
      milestone.id === id ? { ...milestone, ...updates } : milestone
    ),
  })),

  archiveMilestone: (id) => set((state) => ({
    milestones: state.milestones.map((milestone) =>
      milestone.id === id ? { ...milestone, archived: true } : milestone
    ),
  })),

  // Task actions
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { 
      ...task, 
      id: crypto.randomUUID(), 
      createdAt: new Date().toISOString(),
      completed: false,
    }],
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),

  toggleTask: (id) => set((state) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return state;

    const newCompleted = !task.completed;
    
    return {
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { 
              ...task, 
              completed: newCompleted,
              // If completing an archived task, move it to completed tab
              archived: task.archived && newCompleted ? false : task.archived
            }
          : task
      ),
    };
  }),

  archiveTask: (id) => set((state) => {
    const task = state.tasks.find(t => t.id === id);
    if (task?.completed) return state; // Don't archive completed tasks

    return {
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, archived: true } : task
      ),
    };
  }),

  unarchiveTask: (id) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, archived: false } : task
    ),
  })),

  updateTaskImpact: (id, impact) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, impact } : task
    ),
  })),

  toggleTaskUrgent: (id) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, urgent: !task.urgent } : task
    ),
  })),
  
  updateTaskNotes: (id, notes) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, notes } : task
    ),
  })),

  // Getters
  getProjectsByGoal: (goalId) => {
    const { projects } = get();
    return projects.filter(p => p.goalId === goalId && !p.archived);
  },

  getMilestonesByProject: (projectId) => {
    const { milestones } = get();
    return milestones.filter(m => m.projectId === projectId && !m.archived);
  },

  getTasksByMilestone: (milestoneId) => {
    const { tasks } = get();
    return tasks.filter(t => t.milestoneId === milestoneId && !t.archived);
  },

  getUncategorizedTasksByProject: (projectId) => {
    const { tasks } = get();
    return tasks.filter(t => t.projectId === projectId && !t.milestoneId && !t.archived);
  },

  getGlobalUncategorizedTasks: () => {
    const { tasks } = get();
    return tasks.filter(t => !t.projectId && !t.milestoneId && !t.archived);
  },
}));