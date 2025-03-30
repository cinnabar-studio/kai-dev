import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DailyNote from './components/DailyNote';
import FeedPage from './pages/FeedPage';
import NotesPage from './pages/NotesPage';
import TasksPage from './pages/TasksPage';
import GoalsPanel from './components/GoalsPanel';
import Chat from './components/Chat';

export type Page = 'home' | 'feed' | 'goals' | 'notes' | 'tasks';

export interface ChatState {
  isVisible: boolean;
  currentQuestion?: {
    itemId: string;
    question: string;
  };
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [chatState, setChatState] = useState<ChatState>({
    isVisible: false,
  });

  const handleAskQuestion = (itemId: string, question: string) => {
    setChatState({
      isVisible: true,
      currentQuestion: {
        itemId,
        question,
      },
    });
  };

  const renderChatButton = () => (
    !chatState.isVisible && (
      <button
        onClick={() => setChatState(state => ({ ...state, isVisible: true }))}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out group z-50"
      >
        <div className="bg-orange-500 rounded-full p-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Bot 
            size={24} 
            className="text-white" 
            strokeWidth={2.5} 
          />
        </div>
      </button>
    )
  );

  const renderChatWindow = () => (
    chatState.isVisible && (
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 max-h-[90vh] w-[900px] h-[700px] bg-zinc-900 rounded-t-lg shadow-xl border border-zinc-800 flex flex-col transition-all duration-300 ease-in-out z-50"
      >
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
              <Bot size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-medium">Kai</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChatState(state => ({ ...state, isVisible: false }))}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <Chat initialQuestion={chatState.currentQuestion} />
      </div>
    )
  );

  if (currentPage === 'feed') {
    return (
      <div className="flex h-screen bg-[#0A0A0A] text-white">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <FeedPage onPageChange={setCurrentPage} onAskQuestion={handleAskQuestion} />
        {renderChatButton()}
        {renderChatWindow()}
      </div>
    );
  }

  if (currentPage === 'goals') {
    return (
      <div className="flex h-screen bg-[#0A0A0A] text-white">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <div className="flex-1 flex flex-col">
          <GoalsPanel />
        </div>
        {renderChatButton()}
        {renderChatWindow()}
      </div>
    );
  }

  if (currentPage === 'notes') {
    return (
      <div className="flex h-screen bg-[#0A0A0A] text-white">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <div className="flex-1 flex flex-col">
          <NotesPage onAskQuestion={handleAskQuestion} />
        </div>
        {renderChatButton()}
        {renderChatWindow()}
      </div>
    );
  }

  if (currentPage === 'tasks') {
    return (
      <div className="flex h-screen bg-[#0A0A0A] text-white">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <div className="flex-1 flex flex-col">
          <TasksPage onAskQuestion={handleAskQuestion} />
        </div>
        {renderChatButton()}
        {renderChatWindow()}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 flex">
        <DailyNote />
        {renderChatButton()}
        {renderChatWindow()}
      </main>
    </div>
  );
}

export default App;