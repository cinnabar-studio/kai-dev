import { create } from 'zustand';
import { format } from 'date-fns';

interface Note {
  id: string;
  date: string; // ISO date string for the day
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: Record<string, Note>;
  notesTemplate: string;
  
  // Methods
  getNote: (date: Date) => Note | undefined;
  createNote: (date: Date, content?: string) => Note;
  updateNote: (id: string, content: string) => void;
  updateTemplate: (template: string) => void;
  getTemplate: () => string;
  getDayStatus: (date: Date) => 'exists' | 'empty';
  getAllNotes: () => Note[];
  getDateKey: (date: Date) => string;
}

export const useNoteStore = create<NotesState>((set, get) => {
  // Batch updates to localStorage
  let localStorageTimeout: NodeJS.Timeout | null = null;
  
  const batchUpdate = (updates: Partial<NotesState>) => {
    set(state => {
      const newState = { ...state, ...updates };
      
      // Clear existing timeout if any
      if (localStorageTimeout) {
        clearTimeout(localStorageTimeout);
      }
      
      // Set new timeout to save to localStorage
      localStorageTimeout = setTimeout(() => {
        localStorage.setItem('dailyNotes', JSON.stringify(newState.notes));
      }, 1000); // Debounce for 1 second
      
      return newState;
    });
  };

  // Try to load notes from localStorage
  const savedNotes = localStorage.getItem('dailyNotes');
  const savedTemplate = localStorage.getItem('notesTemplate');
  
  const initialNotes: Record<string, Note> = savedNotes 
    ? JSON.parse(savedNotes) 
    : {
        // Add today's note by default if not exists
        [format(new Date(), 'yyyy-MM-dd')]: {
          id: crypto.randomUUID(),
          date: format(new Date(), 'yyyy-MM-dd'),
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      
  return {
    notes: initialNotes,
    notesTemplate: savedTemplate || '',
    
    getDateKey: (date: Date) => format(date, 'yyyy-MM-dd'),
    
    getNote: (date: Date) => {
      const dateKey = get().getDateKey(date);
      return get().notes[dateKey];
    },
    
    createNote: (date: Date, content?: string) => {
      const dateKey = get().getDateKey(date);
      
      // Use template content if available and no content provided
      let noteContent = content || '';
      if (!noteContent && get().notesTemplate) {
        noteContent = get().notesTemplate;
      }
      
      const newNote: Note = {
        id: crypto.randomUUID(),
        date: dateKey,
        content: noteContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      batchUpdate({
        notes: {
          ...get().notes,
          [dateKey]: newNote,
        }
      });
      
      return newNote;
    },
    
    updateNote: (id: string, content: string) => {
      batchUpdate({
        notes: {
          ...get().notes,
          [get().getDateKey(new Date())]: {
            ...get().notes[get().getDateKey(new Date())],
            content,
            updatedAt: new Date().toISOString(),
          }
        }
      });
    },
    
    updateTemplate: (template: string) => {
      localStorage.setItem('notesTemplate', template);
      set({ notesTemplate: template });
    },
    
    getTemplate: () => {
      return get().notesTemplate;
    },
    
    getDayStatus: (date: Date) => {
      const dateKey = get().getDateKey(date);
      return get().notes[dateKey] ? 'exists' : 'empty';
    },
    
    getAllNotes: () => {
      return Object.values(get().notes);
    },
  };
});