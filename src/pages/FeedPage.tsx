import React, { useState } from 'react';
import { BookMarked, Video, Newspaper, Globe, Image as ImageIcon, BookmarkIcon, CheckCircle2, Filter, MessageSquare, X, SlidersHorizontal, Tag, UserIcon, ArrowDownUp, Clock, Target, Briefcase, GraduationCap } from 'lucide-react';
import { useFeedStore, type FeedTag } from '../store/feedStore';
import { FilterBar } from '../components/FilterBar';
import { FilterPanel } from '../components/FilterPanel';

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
    getAvailableProjects,
    selectedProject,
    selectedGoal,
    showBookmarks,
    filterStatus,
    searchTerm,
    sortBy,
    setSelectedProject,
    setSelectedGoal,
    setShowBookmarks,
    setFilterStatus,
    setSearchTerm,
    setSortBy,
    clearFilters
  } = useFeedStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');

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
    if (filterStatus === 'read') return item.read;
    if (filterStatus === 'unread') return !item.read;
    return true;
  });

  // Filter items based on date
  items = items.filter(item => {
    if (dateFilter === 'all') return true;
    
    const itemDate = new Date(item.time);
    const now = new Date();
    
    switch (dateFilter) {
      case 'week':
        return itemDate >= new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return itemDate >= new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return itemDate >= new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return true;
    }
  });

  // Sort items
  items = [...items].sort((a, b) => {
    const timeA = a.time;
    const timeB = b.time;
    
    if (sortBy === 'newest') {
      return timeA > timeB ? -1 : 1;
    } else if (sortBy === 'oldest') {
      return timeA < timeB ? -1 : 1;
    } else if (sortBy === 'az') {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  const icons = {
    article: Newspaper,
    video: Video,
    blog: Globe,
    bookmark: BookMarked,
  };

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
  
  if (filterStatus !== 'all') {
    filterTags.push({
      id: 'read',
      label: filterStatus === 'read' ? 'Read' : 'Unread',
      color: 'bg-green-600/20 text-green-400',
      icon: <CheckCircle2 size={14} className="flex-shrink-0" />
    });
  }
  
  // Add date filter to filter tags
  if (dateFilter !== 'all') {
    filterTags.push({
      id: 'date',
      label: `Date: ${dateFilter === 'week' ? 'Last Week' : dateFilter === 'month' ? 'Last Month' : 'Last Year'}`,
      color: 'bg-orange-600/20 text-orange-400',
      icon: <Clock size={14} className="flex-shrink-0" />
    });
  }
  
  // Handle removing a single filter tag
  const handleRemoveTag = (id: string) => {
    if (id === 'project') setSelectedProject('All');
    else if (id === 'goal') setSelectedGoal('All');
    else if (id === 'read') setFilterStatus('all');
    else if (id === 'date') setDateFilter('all');
  };
  
  // Sort options
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'az', label: 'A-Z' },
    { id: 'za', label: 'Z-A' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
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
            <FilterBar
              searchPlaceholder="Search feed..."
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortOptions={sortOptions}
              currentSortOption={sortBy}
              onSortChange={(option) => setSortBy(option as 'newest' | 'oldest' | 'az' | 'za')}
              onToggleFilters={() => setShowFilters(!showFilters)}
              filterTags={filterTags}
              onRemoveTag={handleRemoveTag}
              onClearAll={clearFilters}
              isFiltersOpen={showFilters}
            />
          </div>
        </div>

        {/* Active Filters */}
        {filterTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filterTags.map((tag) => (
              <span
                key={tag.id}
                className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${tag.color}`}
              >
                {tag.icon}
                {tag.label}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:text-white"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1"
            >
              Clear all
            </button>
          </div>
        )}

        {showFilters && (
          <FilterPanel title="Filter Feed">
            {/* Goal Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <GraduationCap size={14} className="mr-2 text-purple-400" />
                Goal
              </h3>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {goals.map(goal => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Briefcase size={14} className="mr-2 text-blue-400" />
                Project
              </h3>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map(project => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <CheckCircle2 size={14} className="mr-2 text-green-400" />
                Status
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('read')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filterStatus === 'read'
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Read
                </button>
                <button
                  onClick={() => setFilterStatus('unread')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filterStatus === 'unread'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Unread
                </button>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Clock size={14} className="mr-2 text-orange-400" />
                Date Range
              </h3>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'week' | 'month' | 'year')}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </FilterPanel>
        )}

        {/* Feed Content */}
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
                                    setCustomQuestion('');
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
  );
};

export default FeedPage;