import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, PlusCircle, MessageSquare, Pencil, Trash2, ChevronRight, ChevronLeft, Search, MoreVertical, Menu, LightbulbIcon, Info, Sparkles } from 'lucide-react';

// Types for our chat data structure
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatThread {
  id: string;
  title: string;
  lastActive: Date;
  messages: ChatMessage[];
  starred?: boolean;
}

interface ChatProps {
  initialQuestion?: {
    itemId: string;
    question: string;
  };
}

const Chat: React.FC<ChatProps> = ({ initialQuestion }) => {
  // State for the current message being typed
  const [message, setMessage] = useState('');
  
  // State for the active conversation/thread
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  // State for all chat threads/conversations
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('chatThreads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure dates are properly converted back from strings
        return parsed.map((thread: any) => ({
          ...thread,
          lastActive: new Date(thread.lastActive),
          messages: thread.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      } catch (e) {
        console.error("Failed to parse saved chat threads", e);
        return [];
      }
    }
    return [];
  });
  
  // State for thread sidebar visibility on mobile
  const [showSidebar, setShowSidebar] = useState(false);
  
  // State for showing suggestion prompts
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Ref for message input field
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Ref for scrolling to the bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for the thread being renamed
  const [renamingThread, setRenamingThread] = useState<string | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  
  // State for showing thread options menu
  const [threadWithMenuOpen, setThreadWithMenuOpen] = useState<string | null>(null);
  
  // State for showing the search input in the sidebar
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Suggested prompts for the user
  const suggestedPrompts = [
    "What are my priorities for today?",
    "Summarize my recent progress on my goals",
    "Help me brainstorm ideas for my current project",
    "What should I focus on to make the most impact?",
    "How can I improve my productivity?",
    "Give me a quick motivational message",
    "Help me plan my week ahead",
    "What tasks should I tackle first?",
    "Analyze my recent notes for patterns",
    "Help me prepare for my upcoming meeting"
  ];
  
  // Get current active thread
  const activeThread = activeThreadId 
    ? threads.find(t => t.id === activeThreadId) 
    : null;
  
  // Save threads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatThreads', JSON.stringify(threads));
  }, [threads]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);
  
  // Handle initial question coming in as a prop
  useEffect(() => {
    if (initialQuestion) {
      // Create a new thread with this question
      const threadId = crypto.randomUUID();
      const newThread: ChatThread = {
        id: threadId,
        title: initialQuestion.question.length > 30 
          ? initialQuestion.question.substring(0, 30) + '...' 
          : initialQuestion.question,
        lastActive: new Date(),
        messages: [
          {
            id: crypto.randomUUID(),
            type: 'user',
            content: initialQuestion.question,
            timestamp: new Date(),
          }
        ]
      };
      
      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(threadId);
      
      // Simulate AI response
      setTimeout(() => {
        addMessageToThread(threadId, {
          id: crypto.randomUUID(),
          type: 'assistant',
          content: `I'll help you analyze this. Let me think about "${initialQuestion.question}"...`,
          timestamp: new Date()
        });
      }, 1000);
    } else if (threads.length > 0 && !activeThreadId) {
      // Set the most recent thread as active if none is active
      setActiveThreadId(threads[0].id);
    }
  }, [initialQuestion]);
  
  // Create a new empty thread
  const createNewThread = () => {
    const threadId = crypto.randomUUID();
    const newThread: ChatThread = {
      id: threadId,
      title: 'New conversation',
      lastActive: new Date(),
      messages: []
    };
    
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(threadId);
    setShowSidebar(false); // Close sidebar on mobile after creating a new thread
    
    // Focus the input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  // Add a message to a specific thread
  const addMessageToThread = (threadId: string, message: ChatMessage) => {
    setThreads(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          messages: [...thread.messages, message],
          lastActive: new Date()
        };
      }
      return thread;
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // If no active thread, create one
    if (!activeThreadId) {
      createNewThread();
      return;
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    addMessageToThread(activeThreadId, userMessage);
    
    // Update thread title if it's the first message
    const thread = threads.find(t => t.id === activeThreadId);
    if (thread && thread.messages.length === 0) {
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      setThreads(prev => prev.map(t => 
        t.id === activeThreadId ? { ...t, title } : t
      ));
    }
    
    // Clear input
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: "I'm analyzing your question and will provide a thoughtful response...",
        timestamp: new Date()
      };
      addMessageToThread(activeThreadId, aiResponse);
    }, 1000);
  };
  
  // Rename a thread
  const renameThread = (threadId: string) => {
    if (!newThreadTitle.trim()) {
      setRenamingThread(null);
      return;
    }
    
    setThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, title: newThreadTitle } 
        : thread
    ));
    
    setRenamingThread(null);
  };
  
  // Delete a thread
  const deleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(thread => thread.id !== threadId));
    
    // If the active thread is deleted, set the first available thread as active
    if (activeThreadId === threadId) {
      const remainingThreads = threads.filter(thread => thread.id !== threadId);
      setActiveThreadId(remainingThreads.length > 0 ? remainingThreads[0].id : null);
    }
    
    setThreadWithMenuOpen(null);
  };
  
  // Toggle star status on a thread
  const toggleStarThread = (threadId: string) => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, starred: !thread.starred } 
        : thread
    ));
    
    setThreadWithMenuOpen(null);
  };
  
  // Handle selecting a suggested prompt
  const selectSuggestedPrompt = (prompt: string) => {
    setMessage(prompt);
    setShowSuggestions(false);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Filter threads by search term
  const filteredThreads = searchTerm
    ? threads.filter(thread => 
        thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.messages.some(msg => 
          msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : threads;
  
  // Render empty state when no threads exist
  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
        <Bot size={32} className="text-white" strokeWidth={2.5} />
      </div>
      <h2 className="text-xl font-semibold mb-2">Welcome to Kai</h2>
      <p className="text-zinc-400 max-w-md mb-6">
        Your AI assistant that helps you organize tasks, analyze information, and boost your productivity.
      </p>
      <button
        onClick={createNewThread}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2"
      >
        <PlusCircle size={18} />
        <span>Start a new conversation</span>
      </button>
      
      <div className="mt-8 w-full max-w-md">
        <h3 className="text-zinc-400 text-left mb-2 flex items-center">
          <Sparkles size={16} className="mr-2 text-orange-500" />
          <span>Try asking about:</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestedPrompts.slice(0, 4).map((prompt, index) => (
            <button
              key={index}
              onClick={() => {
                createNewThread();
                setTimeout(() => {
                  setMessage(prompt);
                  // Handle submit programmatically after a short delay
                  setTimeout(() => {
                    const form = document.querySelector('form');
                    if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                  }, 100);
                }, 100);
              }}
              className="text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Determine if we need to show empty state
  const showEmptyState = threads.length === 0 || !activeThreadId;
  
  // Determine if we should show suggested prompts for new empty chat
  const showWelcomePrompts = activeThread && activeThread.messages.length === 0;
  
  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="md:hidden absolute left-4 top-4 z-10">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 bg-zinc-800 rounded-lg"
        >
          <Menu size={20} />
        </button>
      </div>
      
      <div className="flex h-full">
        {/* Sidebar/Thread List */}
        <div className={`w-72 border-r border-zinc-800 flex-shrink-0 flex flex-col bg-zinc-900 z-20 transition-all duration-300 ease-in-out ${
          showSidebar ? 'absolute inset-y-0 left-0 transform translate-x-0' : 'absolute inset-y-0 left-0 transform -translate-x-full md:relative md:transform-none'
        }`}>
          {/* New Chat Button */}
          <div className="p-4 border-b border-zinc-800">
            <button
              onClick={createNewThread}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <PlusCircle size={18} />
              <span>New chat</span>
            </button>
          </div>
          
          {/* Search and Options */}
          <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-medium">Your conversations</h3>
            <div className="flex space-x-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-1.5 rounded ${showSearch ? 'bg-zinc-700 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          
          {/* Search Input */}
          {showSearch && (
            <div className="p-2 border-b border-zinc-800">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full bg-zinc-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 pl-8"
                  autoFocus
                />
                <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-zinc-500 text-sm">
                  {searchTerm ? 'No matching conversations found' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              <div className="py-2">
                {filteredThreads.map((thread) => (
                  <div 
                    key={thread.id}
                    className={`relative group px-3 py-2 cursor-pointer ${
                      activeThreadId === thread.id 
                        ? 'bg-zinc-800' 
                        : 'hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* Thread item with title, message preview, etc. */}
                    <div 
                      className="flex items-start"
                      onClick={() => {
                        setActiveThreadId(thread.id);
                        setShowSidebar(false); // Hide sidebar on mobile when selecting a thread
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <MessageSquare size={12} className="text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {renamingThread === thread.id ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={newThreadTitle}
                              onChange={(e) => setNewThreadTitle(e.target.value)}
                              className="bg-zinc-700 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                              autoFocus
                              onBlur={() => renameThread(thread.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  renameThread(thread.id);
                                } else if (e.key === 'Escape') {
                                  setRenamingThread(null);
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                renameThread(thread.id);
                              }}
                              className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded"
                            >
                              <Check size={14} className="text-green-500" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">
                                {thread.starred && '★ '}{thread.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setThreadWithMenuOpen(threadWithMenuOpen === thread.id ? null : thread.id);
                                }}
                                className="p-1 text-zinc-400 hover:text-white rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                              >
                                <MoreVertical size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                              {thread.messages.length > 0 
                                ? thread.messages[thread.messages.length - 1].content.substring(0, 50) + (thread.messages[thread.messages.length - 1].content.length > 50 ? '...' : '')
                                : 'No messages yet'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Thread Options Menu */}
                    {threadWithMenuOpen === thread.id && (
                      <div className="absolute right-10 top-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingThread(thread.id);
                              setNewThreadTitle(thread.title);
                              setThreadWithMenuOpen(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm hover:bg-zinc-700 w-full text-left"
                          >
                            <Pencil size={14} className="mr-2" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarThread(thread.id);
                            }}
                            className="flex items-center px-4 py-2 text-sm hover:bg-zinc-700 w-full text-left"
                          >
                            <Star size={14} className="mr-2" />
                            <span>{thread.starred ? 'Unstar' : 'Star'}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteThread(thread.id);
                            }}
                            className="flex items-center px-4 py-2 text-sm hover:bg-zinc-700 w-full text-left text-red-500"
                          >
                            <Trash2 size={14} className="mr-2" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500">
            <div className="flex items-center justify-center">
              <Info size={12} className="mr-1" />
              <span>Powered by Kai Assistant</span>
            </div>
          </div>
        </div>
        
        {/* Chat Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showEmptyState ? (
            renderEmptyState()
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {showWelcomePrompts ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                      <Bot size={32} className="text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to Kai</h2>
                    <p className="text-zinc-400 max-w-md mb-6">
                      Your AI assistant that helps you organize tasks, analyze information, and boost your productivity.
                    </p>
                    <div className="mt-4 w-full max-w-md">
                      <h3 className="text-zinc-400 text-left mb-2 flex items-center">
                        <Sparkles size={16} className="mr-2 text-orange-500" />
                        <span>Try asking about:</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {suggestedPrompts.slice(0, 4).map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setMessage(prompt);
                              // Handle submit programmatically after a short delay
                              setTimeout(() => {
                                const form = document.querySelector('form');
                                if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                              }, 100);
                            }}
                            className="text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  activeThread?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-2 ${
                        msg.type === 'assistant' ? '' : 'justify-end'
                      }`}
                    >
                      {msg.type === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                          <Bot size={16} className="text-white" strokeWidth={2.5} />
                        </div>
                      )}
                      <div
                        className={`flex-1 max-w-[80%] rounded-lg p-3 ${
                          msg.type === 'assistant'
                            ? 'bg-zinc-800'
                            : 'bg-orange-500 ml-auto'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-xs text-zinc-400 mt-1 block">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className={`p-2 rounded-lg transition-colors ${
                      showSuggestions ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-orange-500 hover:bg-zinc-700'
                    }`}
                    title="Suggested prompts"
                  >
                    <LightbulbIcon size={18} />
                  </button>
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    
                    {/* Suggested prompts dropdown */}
                    {showSuggestions && (
                      <div className="absolute bottom-full left-0 mb-2 w-full bg-zinc-900 rounded-lg border border-zinc-800 shadow-lg overflow-hidden z-10">
                        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                          <h4 className="text-sm font-medium">Suggested Prompts</h4>
                          <button 
                            type="button"
                            onClick={() => setShowSuggestions(false)}
                            className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {suggestedPrompts.map((prompt, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectSuggestedPrompt(prompt)}
                              className="w-full text-left p-3 hover:bg-zinc-800 text-sm border-b border-zinc-800 last:border-0"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Additional components needed for the chat interface
const Check = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Star = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default Chat;