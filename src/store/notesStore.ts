import { create } from 'zustand';

export type PredefinedTag = 
  | 'idea' 
  | 'meeting' 
  | 'research' 
  | 'todo' 
  | 'important' 
  | 'insight' 
  | 'personal' 
  | 'work'
  | 'question'
  | 'reference'
  | 'checklist';

// NoteTag can be either a predefined tag or a custom string
export type NoteTag = PredefinedTag | string;

export interface Note {
  id: string;
  title: string;
  content: string;
  projectId?: string;
  milestoneId?: string | null;
  tags: NoteTag[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
}

interface NotesState {
  notes: Note[];
  searchTerm: string;
  selectedTags: NoteTag[];
  selectedProjectId: string;
  filteredView: 'all' | 'pinned' | 'archived';
  
  // Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'pinned' | 'archived'>) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteNote: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  togglePinned: (id: string) => void;
  
  // Filters and search
  setSearchTerm: (term: string) => void;
  toggleTag: (tag: NoteTag) => void;
  setSelectedProjectId: (id: string) => void;
  setFilteredView: (view: 'all' | 'pinned' | 'archived') => void;
  
  // Getters
  getNotesByProject: (projectId: string) => Note[];
  getNotesByMilestone: (milestoneId: string) => Note[];
  getFilteredNotes: () => Note[];
  getAllTags: () => { tag: NoteTag; count: number }[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [
    {
      id: '1',
      title: 'Project kickoff meeting notes',
      content: 'Discussed project timeline, team roles, and key milestones. Need to follow up on resource allocation.',
      projectId: 'p1',
      tags: ['meeting', 'important'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      pinned: true,
      archived: false,
    },
    {
      id: '2',
      title: 'Ideas for meditation app',
      content: 'Features to consider:\n- Guided sessions with variable length\n- Progress tracking\n- Mood journaling\n- Reminders and streaks',
      projectId: 'p1',
      tags: ['idea', 'research'],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      pinned: false,
      archived: false,
    },
    {
      id: '3',
      title: 'Weekly reflection',
      content: 'Made good progress on meditation routine. Finding it easiest to maintain in the morning. Need to work on consistency on weekends.',
      tags: ['personal', 'insight'],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      pinned: false,
      archived: false,
    },
  ],
  searchTerm: '',
  selectedTags: [],
  selectedProjectId: '',
  filteredView: 'all',
  
  // Actions
  addNote: (note) => set((state) => ({
    notes: [
      {
        ...note,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        archived: false,
      },
      ...state.notes,
    ],
  })),
  
  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id 
        ? { 
            ...note, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          } 
        : note
    ),
  })),
  
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== id),
  })),
  
  archiveNote: (id) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, archived: true, updatedAt: new Date().toISOString() } : note
    ),
  })),
  
  unarchiveNote: (id) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, archived: false, updatedAt: new Date().toISOString() } : note
    ),
  })),
  
  togglePinned: (id) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() } : note
    ),
  })),
  
  // Filters and search
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  toggleTag: (tag) => set((state) => {
    const selectedTags = [...state.selectedTags];
    const index = selectedTags.indexOf(tag);
    
    if (index === -1) {
      selectedTags.push(tag);
    } else {
      selectedTags.splice(index, 1);
    }
    
    return { selectedTags };
  }),
  
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  
  setFilteredView: (view) => set({ filteredView: view }),
  
  // Getters
  getNotesByProject: (projectId) => {
    return get().notes.filter((note) => note.projectId === projectId && !note.archived);
  },
  
  getNotesByMilestone: (milestoneId) => {
    return get().notes.filter((note) => note.milestoneId === milestoneId && !note.archived);
  },
  
  getFilteredNotes: () => {
    const { notes, searchTerm, selectedTags, selectedProjectId, filteredView } = get();
    
    return notes.filter((note) => {
      // Filter by archive status
      if (filteredView === 'pinned' && !note.pinned) return false;
      if (filteredView === 'archived' && !note.archived) return false;
      if (filteredView === 'all' && note.archived) return false;
      
      // Filter by project
      if (selectedProjectId) {
        if (selectedProjectId === 'uncategorized') {
          if (note.projectId) return false;
        } else if (note.projectId !== selectedProjectId) {
          return false;
        }
      }
      
      // Filter by tags
      if (selectedTags.length > 0 && !selectedTags.some(tag => note.tags.includes(tag))) return false;
      
      // Filter by search term
      if (searchTerm) {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        const inTitle = note.title.toLowerCase().includes(normalizedSearchTerm);
        const inContent = note.content.toLowerCase().includes(normalizedSearchTerm);
        
        if (!inTitle && !inContent) return false;
      }
      
      return true;
    });
  },
  
  getAllTags: () => {
    const { notes } = get();
    const tagsMap = new Map<NoteTag, number>();
    
    notes.forEach((note) => {
      if (!note.archived) {
        note.tags.forEach((tag) => {
          tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
        });
      }
    });
    
    return Array.from(tagsMap.entries()).map(([tag, count]) => ({ tag, count }));
  },
}));