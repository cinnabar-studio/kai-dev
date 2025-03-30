import React, { useState } from 'react';
import { BookMarked, Video, Newspaper, Globe, Image as ImageIcon, BookmarkIcon, CheckCircle2, Filter, MessageSquare, X, SlidersHorizontal, Tag, UserIcon, ArrowDownUp, Clock, Target } from 'lucide-react';
import { useFeedStore, type FeedTag } from '../store/feedStore';
import FilterSortBar from '../components/FilterSortBar';
import FilterPanel from '../components/FilterPanel';

interface FeedPageProps {
  onPageChange: (page: 'home') => void;
  onAskQuestion: (itemId: string, question: string) => void;
}

const tagColors: Record<FeedTag, { bg: string; text: string }> = {
  innovation: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  growth: { bg: 'bg-green-500/20', text: 'text-green-400' },
  productivity: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  leadership: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  technology: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  mindfulness: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  strategy: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

const FeedPage: React.FC<FeedPageProps> = ({ onPageChange, onAskQuestion }) => {
  const { 
    feedItems, 
    filterByProject,
    filterByGoal, 
    toggleBookmark, 
    isBookmarked, 
    getBookmarkedItems,
    toggleRead,
    filterByReadStatus,
    getAvailableProjects
  } = useFeedStore();
  
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedGoal, setSelectedGoal] = useState('All');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [showFeedFilters, setShowFeedFilters] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const availableProjects = getAvailableProjects();
  const projects = ['All', ...new Set(availableProjects.map(p => p.project))];
  const goals = ['All', ...new Set(availableProjects.map(p => p.goal))];
  
  // Get initial items based on bookmark state
  let items = showBookmarks ? getBookmarkedItems() : feedItems;
  
  // Apply filters in sequence
  if (selectedProject !== 'All') {
    items = items.filter(item => item.project === selectedProject);
  }
  if (selectedGoal !== 'All') {
    items = items.filter(item => item.goal === selectedGoal);
  }
  items = items.filter(item => {
    if (readFilter === 'read') return item.read;
    if (readFilter === 'unread') return !item.read;
    return true;
  });

  // Sort items
  items = [...items].sort((a, b) => {
    // Convert time strings to comparable values (assuming format like "2 hours ago")
    const timeA = a.time;
    const timeB = b.time;
    
    if (sortBy === 'newest') {
      return timeA > timeB ? -1 : 1; // Simple string comparison for demo
    } else {
      return timeA < timeB ? -1 : 1;
    }
  });

  const icons = {
    article: Newspaper,
    video: Video,
    blog: Globe,
    bookmark: BookMarked,
  };

  const clearFilters = () => {
    setSelectedProject('All');
    setSelectedGoal('All');
    setReadFilter('all');
  };
  
  // Prepare filter tags for display
  const filterTags = [];
  
  if (selectedProject !== 'All') {
    filterTags.push({
      id: 'project',
      label: `Project: ${selectedProject}`,
      color: 'bg-blue-600/20 text-blue-400',
      icon: <Video size={14} className="flex-shrink-0" />
    });
  }
  
  if (selectedGoal !== 'All') {
    filterTags.push({
      id: 'goal',
      label: `Goal: ${selectedGoal}`,
      color: 'bg-purple-600/20 text-purple-400',
      icon: <Target size={14} className="flex-shrink-0" />
    });
  }
  
  if (readFilter !== 'all') {
    filterTags.push({
      id: 'read',
      label: readFilter === 'read' ? 'Read' : 'Unread',
      color: 'bg-green-600/20 text-green-400',
      icon: <CheckCircle2 size={14} className="flex-shrink-0" />
    });
  }
  
  // Handle removing a single filter tag
  const handleRemoveTag = (id: string) => {
    if (id === 'project') setSelectedProject('All');
    else if (id === 'goal') setSelectedGoal('All');
    else if (id === 'read') setReadFilter('all');
  };
  
  // Sort options
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' }
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[#0A0A0A] z-10 p-8 pb-0">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Feed</h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className={`p-2 rounded-lg transition-colors ${
                    showBookmarks ? 'bg-yellow-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookMarked size={20} />
                </button>
                <FilterSortBar
                  searchPlaceholder="Search feed..."
                  searchTerm=""
                  onSearchChange={() => {}}
                  showSort={true}
                  sortOptions={sortOptions}
                  currentSortOption={sortBy}
                  onSortChange={(option) => setSortBy(option as 'newest' | 'oldest')}
                  showFilters={true}
                  isFilterActive={showFeedFilters || selectedProject !== 'All' || selectedGoal !== 'All' || readFilter !== 'all'}
                  onToggleFilters={() => setShowFeedFilters(!showFeedFilters)}
                />
              </div>
            </div>

            {/* Active Filters */}
            {(selectedProject !== 'All' || selectedGoal !== 'All' || readFilter !== 'all') && (
              <div className="flex items-center gap-2 mb-4 flex-wrap bg-zinc-800 p-2 rounded-lg">
                <span className="text-sm text-zinc-400">Filters:</span>
                {selectedProject !== 'All' && (
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm flex items-center gap-1">
                    Project: {selectedProject}
                    <button 
                      onClick={() => setSelectedProject('All')}
                      className="hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedGoal !== 'All' && (
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-sm flex items-center gap-1">
                    Goal: {selectedGoal}
                    <button 
                      onClick={() => setSelectedGoal('All')}
                      className="hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {readFilter !== 'all' && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm flex items-center gap-1">
                    {readFilter === 'read' ? 'Read' : 'Unread'}
                    <button 
                      onClick={() => setReadFilter('all')}
                      className="hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-zinc-400 hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}

            {showFeedFilters && (
              <FilterPanel
                title="Filter Feed"
                activeTags={filterTags}
                onRemoveTag={handleRemoveTag}
                onClearAll={clearFilters}
              >
                {/* Goals Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Target size={14} className="mr-2 text-purple-400" />
                    Goals
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {goals.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setSelectedGoal(goal)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          selectedGoal === goal
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Projects Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Video size={14} className="mr-2 text-blue-400" />
                    Projects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {projects.map((project) => (
                      <button
                        key={project}
                        onClick={() => setSelectedProject(project)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          selectedProject === project
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {project}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <CheckCircle2 size={14} className="mr-2 text-green-400" />
                    Status
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReadFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        readFilter === 'all'
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setReadFilter('read')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        readFilter === 'read'
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Read
                    </button>
                    <button
                      onClick={() => setReadFilter('unread')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        readFilter === 'unread'
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Unread
                    </button>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Clock size={14} className="mr-2 text-yellow-400" />
                    Sort By
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('newest')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        sortBy === 'newest'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => setSortBy('oldest')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        sortBy === 'oldest'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Oldest
                    </button>
                  </div>
                </div>
              </FilterPanel>
            )}
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="p-8 pt-0">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400">
                  {showBookmarks ? 'No bookmarks yet' : 'No items found'}
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  {showBookmarks 
                    ? 'Save interesting articles, videos, and blog posts for later'
                    : 'Try adjusting your filters'
                  }
                </p>
              </div>
            ) : (
              items.map((item) => {
                const Icon = icons[item.type];
                const bookmarked = isBookmarked(item.id);
                const isExpanded = expandedItem === item.id;
                
                return (
                  <div key={item.id} className="group bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                        {item.thumbnail ? (
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={24} className="text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon size={18} className="text-zinc-400" />
                            {item.goal && (
                              <span className="text-sm text-purple-400">{item.goal}</span>
                            )}
                            <span className="text-xs text-zinc-500">•</span>
                            <span className="text-sm text-blue-400">{item.project}</span>
                            <span className="text-xs text-zinc-500">•</span>
                            <span className="text-xs text-zinc-500">{item.source}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-zinc-500">{item.time}</span>
                            <button
                              onClick={() => toggleRead(item.id)}
                              className={`${item.read ? 'text-green-500' : 'text-zinc-400'} hover:text-green-400 p-1 rounded-lg`}
                              title={item.read ? 'Mark as unread' : 'Mark as read'}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() => toggleBookmark(item.id)}
                              className={`p-1 rounded-lg ${
                                bookmarked ? 'text-yellow-500' : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              <BookMarked size={16} />
                            </button>
                          </div>
                        </div>
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 font-medium hover:text-blue-400 transition-colors block"
                        >
                          {item.title}
                        </a>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.tags.map(tag => {
                            const { bg, text } = tagColors[tag];
                            return (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>

                        {/* Summary */}
                        <p className="mt-2 text-sm text-zinc-400">
                          {item.summary}
                        </p>

                        {/* AI Questions */}
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                            className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300"
                          >
                            <MessageSquare size={16} />
                            <span>Ask AI about this {item.type}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-3 space-y-3">
                              <div className="space-y-2">
                                {item.defaultQuestions.map((question, index) => (
                                  <button
                                    key={index}
                                    onClick={() => onAskQuestion(item.id, question)}
                                    className="block w-full text-left px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                                  >
                                    {question}
                                  </button>
                                ))}
                              </div>

                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={customQuestion}
                                  onChange={(e) => setCustomQuestion(e.target.value)}
                                  placeholder="Ask your own question..."
                                  className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => {
                                    if (customQuestion.trim()) {
                                      onAskQuestion(item.id, customQuestion);
                                    }
                                  }}
                                  disabled={!customQuestion.trim()}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Ask
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;