import { create, StateCreator } from 'zustand';
import { useGoalsStore, type Goal, type Project } from './goalsStore';

export type FeedTag = 'innovation' | 'growth' | 'productivity' | 'leadership' | 'technology' | 'mindfulness' | 'strategy';

export interface FeedItem {
  id: string;
  type: 'article' | 'video' | 'blog' | 'bookmark';
  source: string;
  title: string;
  time: string;
  project: string;
  goal?: string;
  url: string;
  thumbnail?: string;
  read: boolean;
  tags: FeedTag[];
  summary: string;
  defaultQuestions: string[];
}

interface FeedState {
  feedItems: FeedItem[];
  bookmarkedItems: Set<string>;
  filterStatus: 'all' | 'read' | 'unread';
  searchTerm: string;
  selectedProject: string;
  selectedGoal: string;
  showBookmarks: boolean;
  sortBy: 'newest' | 'oldest' | 'az' | 'za';
  
  // Actions
  setFilterStatus: (status: 'all' | 'read' | 'unread') => void;
  setSearchTerm: (term: string) => void;
  setSelectedProject: (project: string) => void;
  setSelectedGoal: (goal: string) => void;
  setShowBookmarks: (show: boolean) => void;
  setSortBy: (sort: 'newest' | 'oldest' | 'az' | 'za') => void;
  clearFilters: () => void;
}

interface FeedStore extends FeedState {
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  getBookmarkedItems: () => FeedItem[];
  filterByProject: (project: string) => FeedItem[];
  filterByGoal: (goal: string) => FeedItem[];
  toggleRead: (id: string) => void;
  filterByReadStatus: (status: 'all' | 'read' | 'unread', items: FeedItem[]) => FeedItem[];
  getAvailableProjects: () => { project: string; goal: string }[];
  getFilteredItems: () => FeedItem[];
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  feedItems: [
    {
      id: '1',
      type: 'article',
      source: 'Harvard Business Review',
      project: 'Mindfulness Practice',
      goal: 'Personal Growth',
      title: 'The Future of Leadership in a Digital Age',
      time: '2 hours ago',
      url: 'https://hbr.org/leadership-digital-age',
      thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      read: false,
      tags: ['leadership', 'innovation'],
      summary: 'Explores how digital transformation is reshaping leadership roles and the key competencies needed for future success.',
      defaultQuestions: [
        'How can I adapt my leadership style for the digital age?',
        'What skills should I prioritize developing?',
        'How will these changes impact my team?'
      ]
    },
    {
      id: '2',
      type: 'video',
      source: 'TED Talks',
      project: 'Mindfulness Practice',
      goal: 'Personal Growth',
      title: 'The Science of Mindfulness and Stress Management',
      time: '4 hours ago',
      url: 'https://ted.com/mindfulness-talk',
      thumbnail: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?auto=format&fit=crop&w=800&q=80',
      read: true,
      tags: ['mindfulness', 'productivity'],
      summary: 'Research-backed techniques for incorporating mindfulness into daily routines to reduce stress and improve focus.',
      defaultQuestions: [
        'How can I implement these techniques in my routine?',
        'What benefits should I expect to see first?',
        'How can I measure my progress?'
      ]
    },
    {
      id: '3',
      type: 'blog',
      source: 'Medium',
      project: 'Advanced TypeScript',
      goal: 'Learning',
      title: 'Advanced TypeScript Patterns for Enterprise Applications',
      time: 'Yesterday',
      url: 'https://medium.com/typescript-patterns',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      read: false,
      tags: ['technology', 'innovation'],
      summary: 'Deep dive into advanced TypeScript patterns and best practices for building scalable enterprise applications.',
      defaultQuestions: [
        'How can I apply these patterns to my current project?',
        'What are the performance implications?',
        'Which pattern should I implement first?'
      ]
    },
  ],
  bookmarkedItems: new Set<string>(),
  filterStatus: 'all',
  searchTerm: '',
  selectedProject: 'All',
  selectedGoal: 'All',
  showBookmarks: false,
  sortBy: 'newest',
  
  // Actions
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedGoal: (goal) => set({ selectedGoal: goal }),
  setShowBookmarks: (show) => set({ showBookmarks: show }),
  setSortBy: (sort) => set({ sortBy: sort }),
  clearFilters: () => set({
    filterStatus: 'all',
    searchTerm: '',
    selectedProject: 'All',
    selectedGoal: 'All',
    showBookmarks: false,
    sortBy: 'newest'
  }),
  
  toggleBookmark: (id: string) =>
    set((state: FeedState) => {
      const newBookmarkedItems = new Set(state.bookmarkedItems);
      if (newBookmarkedItems.has(id)) {
        newBookmarkedItems.delete(id);
      } else {
        newBookmarkedItems.add(id);
      }
      return { bookmarkedItems: newBookmarkedItems };
    }),
    
  isBookmarked: (id: string) => get().bookmarkedItems.has(id),
  
  getBookmarkedItems: () => {
    const { feedItems, bookmarkedItems } = get();
    return feedItems.filter((item: FeedItem) => bookmarkedItems.has(item.id));
  },
  
  filterByProject: (project: string) => {
    const { feedItems } = get();
    return project === 'All'
      ? feedItems
      : feedItems.filter((item: FeedItem) => item.project === project);
  },
  
  filterByGoal: (goal: string) => {
    const { feedItems } = get();
    return goal === 'All'
      ? feedItems
      : feedItems.filter((item: FeedItem) => item.goal === goal);
  },
  
  toggleRead: (id: string) =>
    set((state: FeedState) => ({
      feedItems: state.feedItems.map((item: FeedItem) =>
        item.id === id ? { ...item, read: !item.read } : item
      ),
    })),
    
  filterByReadStatus: (status: 'all' | 'read' | 'unread', items: FeedItem[]) => {
    if (status === 'all') return items;
    return items.filter((item: FeedItem) => status === 'read' ? item.read : !item.read);
  },
  
  getAvailableProjects: () => {
    const { goals, projects } = useGoalsStore.getState();
    
    // Create a map of goal IDs to titles for faster lookups
    const goalMap = new Map(goals.map((goal: Goal) => [goal.id, goal.title]));
    
    return projects
      .filter((p: Project) => !p.archived)
      .map((project: Project) => ({
        project: project.title,
        goal: goalMap.get(project.goalId) || 'Unknown Goal'
      }));
  },
  
  getFilteredItems: () => {
    const { feedItems, filterStatus, searchTerm } = get();
    
    return feedItems.filter((item: FeedItem) => {
      // Filter by read status
      if (filterStatus !== 'all' && item.read !== (filterStatus === 'read')) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.summary.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }
}));