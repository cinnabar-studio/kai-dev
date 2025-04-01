export type ImpactLevel = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  urgent: boolean;
  impact: ImpactLevel;
  projectId?: string;
  milestoneId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  archived: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  impact: ImpactLevel;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  archived: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  tags: string[];
}

export interface FeedItem {
  id: string;
  type: 'task' | 'goal' | 'note' | 'milestone';
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  projectId?: string;
  goalId?: string;
  milestoneId?: string;
  tags: string[];
  bookmarked: boolean;
} 