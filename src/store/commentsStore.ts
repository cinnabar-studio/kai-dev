import { create } from 'zustand';

export interface Comment {
  id: string;
  entityId: string;
  content: string;
  createdAt: string;
  author: string;
}

interface CommentsStore {
  comments: Record<string, Comment[]>;
  addComment: (entityId: string, content: string) => void;
  getComments: (entityId: string) => Comment[];
}

export const useCommentsStore = create<CommentsStore>((set, get) => ({
  comments: {
    // Example comments
    't1': [
      {
        id: 'c1',
        entityId: 't1',
        content: 'Making good progress with the morning routine',
        createdAt: '2024-03-15T08:00:00Z',
        author: 'John',
      }
    ],
    'p1': [
      {
        id: 'c2',
        entityId: 'p1',
        content: 'This project is helping me stay focused',
        createdAt: '2024-03-14T15:30:00Z',
        author: 'John',
      }
    ]
  },
  
  addComment: (entityId: string, content: string) => {
    set((state) => {
      const newComment: Comment = {
        id: Math.random().toString(),
        entityId,
        content,
        createdAt: new Date().toISOString(),
        author: 'John', // In a real app, this would come from auth
      };
      
      return {
        comments: {
          ...state.comments,
          [entityId]: [...(state.comments[entityId] || []), newComment],
        },
      };
    });
  },
  
  getComments: (entityId: string) => {
    return get().comments[entityId] || [];
  },
}));