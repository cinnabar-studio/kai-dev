import React, { useState } from 'react';
import { Home, Layout, Settings, PlusCircle, Target, FileText, ListTodo } from 'lucide-react';
import type { Page } from '../App';
import { useNotesStore } from '../store/notesStore';
import { useGoalsStore } from '../store/goalsStore';
import { useFeedStore } from '../store/feedStore'; 
import NoteModal from './modals/NoteModal';
import TaskModal from './modals/TaskModal';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { notes } = useNotesStore();
  const { tasks } = useGoalsStore();
  const { feedItems } = useFeedStore();
  
  const toggleAddOptions = () => {
    setShowAddOptions(!showAddOptions);
  };

  // Count unread feed items
  const unreadFeedCount = feedItems.filter(item => !item.read).length;

  return (
    <div className="w-16 bg-[#0A0A0A] border-r border-zinc-800 flex flex-col items-center py-4">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-8">
        <span className="text-black font-bold">LM</span>
      </div>
      
      <nav className="flex-1 flex flex-col items-center space-y-4">
        <button 
          className={`p-3 rounded-lg transition-colors ${
            currentPage === 'home' 
              ? 'bg-zinc-800 text-white' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
          onClick={() => onPageChange('home')}
        >
          <Home size={20} />
        </button>
        <button 
          className={`p-3 rounded-lg transition-colors ${
            currentPage === 'goals' 
              ? 'bg-zinc-800 text-white' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
          onClick={() => onPageChange('goals')}
        >
          <Target size={20} />
        </button>
        <button 
          className={`p-3 rounded-lg transition-colors ${
            currentPage === 'tasks' 
              ? 'bg-zinc-800 text-white' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
          onClick={() => onPageChange('tasks')}
        >
          <ListTodo size={20} />
        </button>
        <button 
          className={`p-3 rounded-lg transition-colors ${
            currentPage === 'notes' 
              ? 'bg-zinc-800 text-white' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
          onClick={() => onPageChange('notes')}
        >
          <FileText size={20} />
        </button>
        <button 
          className={`relative p-3 rounded-lg transition-colors ${
            currentPage === 'feed' 
              ? 'bg-zinc-800 text-white' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
          onClick={() => onPageChange('feed')}
        >
          <Layout size={20} />
          {unreadFeedCount > 0 && (
            <div className="absolute top-0 right-0 -mt-1 -mr-1 w-4 h-4 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center">
              {unreadFeedCount > 9 ? '9+' : unreadFeedCount}
            </div>
          )}
        </button>
      </nav>

      <div className="mt-auto flex flex-col items-center space-y-4 relative">
        <button 
          className="p-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors text-white"
          onClick={toggleAddOptions}
        >
          <PlusCircle size={20} />
        </button>
        
        {showAddOptions && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowAddOptions(false)}
            />
            <div className="absolute bottom-full mb-2 bg-zinc-900 rounded-lg border border-zinc-800 shadow-lg p-1 z-20 w-36 left-full ml-2">
              <button
                className="w-full text-left flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 transition-colors"
                onClick={() => {
                  setShowAddOptions(false);
                  setShowTaskModal(true);
                }}
              >
                <ListTodo size={16} className="text-orange-500" />
                <span>New Task</span>
              </button>
              <button
                className="w-full text-left flex items-center space-x-2 p-2 rounded hover:bg-zinc-800 transition-colors"
                onClick={() => {
                  setShowAddOptions(false);
                  setShowNoteModal(true);
                }}
              >
                <FileText size={16} className="text-orange-500" />
                <span>New Note</span>
              </button>
            </div>
          </>
        )}
        
        <button className="p-3 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </div>

      {/* Modals */}
      {showNoteModal && (
        <NoteModal onClose={() => setShowNoteModal(false)} />
      )}
      
      {showTaskModal && (
        <TaskModal onClose={() => setShowTaskModal(false)} />
      )}
    </div>
  );
};

export default Sidebar;