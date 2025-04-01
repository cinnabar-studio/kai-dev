import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Tag, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  Pin, 
  Archive, 
  MoreVertical,
  Edit,
  Trash2,
  Target,
  MessageSquare,
  CheckSquare,
  CheckCircle,
  Calendar,
  Clock,
  ArrowDownUp,
  SlidersHorizontal
} from 'lucide-react';
import { useNotesStore, type NoteTag, type PredefinedTag } from '../store/notesStore';
import { useGoalsStore } from '../store/goalsStore';
import NoteModal from '../components/modals/NoteModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { FilterBar } from '../components/FilterBar';
import FilterPanel from '../components/FilterPanel';

const TAG_COLORS: Record<string, string> = {
  idea: 'bg-purple-500/20 text-purple-400',
  meeting: 'bg-blue-500/20 text-blue-400',
  research: 'bg-cyan-500/20 text-cyan-400',
  todo: 'bg-yellow-500/20 text-yellow-400',
  important: 'bg-red-500/20 text-red-400',
  insight: 'bg-green-500/20 text-green-400',
  personal: 'bg-pink-500/20 text-pink-400',
  work: 'bg-orange-500/20 text-orange-400',
  question: 'bg-indigo-500/20 text-indigo-400',
  reference: 'bg-emerald-500/20 text-emerald-400',
  checklist: 'bg-teal-500/20 text-teal-400',
  // Default color for custom tags
  custom: 'bg-gray-500/20 text-gray-400',
};

interface NoteItemProps {
  id: string;
  title: string;
  content: string;
  tags: NoteTag[];
  projectId?: string;
  milestoneId?: string | null;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  onPin: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onAskQuestion: (noteId: string, question: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({
  id,
  title,
  content,
  tags,
  projectId,
  milestoneId,
  createdAt,
  updatedAt,
  pinned,
  onPin,
  onEdit,
  onDelete,
  onArchive,
  onAskQuestion,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [question, setQuestion] = useState('');
  
  const { projects, milestones } = useGoalsStore();
  const project = projectId ? projects.find(p => p.id === projectId) : undefined;
  const milestone = milestoneId ? milestones.find(m => m.id === milestoneId) : undefined;
  
  // Add useEffect to handle updates
  useEffect(() => {
    // This will force a re-render when the note data changes
  }, [id, title, content, tags, projectId, milestoneId, createdAt, updatedAt, pinned]);
  
  const truncateText = (text: string, maxLength: number = 60) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  
  const handleAskQuestion = () => {
    if (question.trim()) {
      onAskQuestion(id, question);
      setQuestion('');
      setShowAskQuestion(false);
    }
  };
  
  // Format the created and updated dates
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  // Toggle the dropdown menu
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };
  
  const closeMenu = () => {
    setShowMenu(false);
  };

  // Get tag color
  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag] || TAG_COLORS.custom;
  };
  
  return (
    <div 
      className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 cursor-pointer"
      onClick={() => onEdit()}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {pinned && (
                <Pin size={14} className="text-orange-500 flex-shrink-0" />
              )}
              <h3 className="font-medium truncate">{truncateText(title)}</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
              >
                <MoreVertical size={16} />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={closeMenu}
                  />
                  <div className="absolute right-0 mt-1 bg-zinc-900 rounded-lg border border-zinc-800 shadow-lg overflow-hidden z-20 min-w-[160px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                        onEdit();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center space-x-2"
                    >
                      <Edit size={14} className="text-blue-400" />
                      <span>Edit Note</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                        onPin();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center space-x-2"
                    >
                      <Pin size={14} className={pinned ? "text-orange-500" : "text-zinc-400"} />
                      <span>{pinned ? 'Unpin Note' : 'Pin Note'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                        onArchive();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center space-x-2"
                    >
                      <Archive size={14} className="text-zinc-400" />
                      <span>Archive Note</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                        onDelete();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-red-400 flex items-center space-x-2"
                    >
                      <Trash2 size={14} />
                      <span>Delete Note</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Preview Content */}
        <p className="text-sm text-zinc-400 line-clamp-2">
          {truncateText(content, 150)}
        </p>
        
        {/* Project/Milestone Info */}
        {(project || milestone) && (
          <div className="flex flex-wrap items-center gap-2 text-sm mt-3">
            {project && (
              <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                <Briefcase size={12} />
                <span>{project.title}</span>
              </div>
            )}
            {milestone && (
              <div className="flex items-center space-x-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                <Target size={12} />
                <span>{milestone.title}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Tags and Date */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-y-2">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 2).map(tag => (
              <div
                key={tag}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded ${getTagColor(tag)}`}
              >
                {tag === 'checklist' ? (
                  <CheckSquare size={12} />
                ) : (
                  <Tag size={12} />
                )}
                <span className="text-xs">{tag}</span>
              </div>
            ))}
            {tags.length > 2 && (
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                <Tag size={12} />
                <span className="text-xs">+{tags.length - 2} more</span>
              </div>
            )}
          </div>
          <span className="text-xs text-zinc-500">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

interface NotesPageProps {
  onAskQuestion: (itemId: string, question: string) => void;
}

const NotesPage: React.FC<NotesPageProps> = ({ onAskQuestion }) => {
  const { 
    notes,
    searchTerm,
    selectedTags,
    selectedProjectId,
    filteredView,
    setSearchTerm,
    toggleTag,
    setSelectedProjectId,
    setFilteredView,
    getFilteredNotes,
    getAllTags,
    addNote,
    updateNote,
    deleteNote,
    archiveNote,
    unarchiveNote,
    togglePinned,
  } = useNotesStore();
  
  const { projects, milestones, getMilestonesByProject } = useGoalsStore();
  const availableProjects = projects.filter(p => !p.archived);
  
  const [showNoteFilters, setShowNoteFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [availableMilestones, setAvailableMilestones] = useState<Array<{ id: string; title: string }>>([]);
  
  // Add useEffect to handle note updates
  useEffect(() => {
    // This will force a re-render when notes change
  }, [notes]);

  // Update available milestones when selected project changes
  useEffect(() => {
    if (selectedProjectId && selectedProjectId !== 'uncategorized') {
      const projectMilestones = getMilestonesByProject(selectedProjectId)
        .filter(m => !m.archived)
        .map(m => ({ id: m.id, title: m.title }));
      setAvailableMilestones(projectMilestones);
      
      // Reset milestone selection if the current milestone doesn't belong to this project
      if (selectedMilestoneId) {
        const milestoneExists = projectMilestones.some(m => m.id === selectedMilestoneId);
        if (!milestoneExists) {
          setSelectedMilestoneId('');
        }
      }
    } else {
      // Show all non-archived milestones when no project is selected
      const allMilestones = milestones
        .filter(m => !m.archived)
        .map(m => ({ id: m.id, title: m.title }));
      setAvailableMilestones(allMilestones);
    }
  }, [selectedProjectId, getMilestonesByProject, selectedMilestoneId, milestones]);

  const filteredNotes = useMemo(() => {
    const baseFiltered = getFilteredNotes();
    return baseFiltered.filter(note => {
      if (selectedMilestoneId && note.milestoneId !== selectedMilestoneId) {
        return false;
      }
      return true;
    });
  }, [getFilteredNotes, selectedMilestoneId, notes, searchTerm, selectedTags, selectedProjectId, filteredView]);
  
  const allTags = useMemo(() => getAllTags(), [getAllTags, notes, searchTerm, selectedTags, selectedProjectId, filteredView]);
  
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy === 'az') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  }, [filteredNotes, sortBy, notes, searchTerm, selectedTags, selectedProjectId, filteredView]);
  
  const handleEditNote = (noteId: string) => {
    setNoteToEdit(noteId);
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
  };
  
  const confirmDeleteNote = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  };
  
  const editingNote = noteToEdit ? notes.find(note => note.id === noteToEdit) : undefined;
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProjectId('');
    setSelectedMilestoneId('');
    while (selectedTags.length) toggleTag(selectedTags[0]);
  };

  // Get tag color
  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag] || TAG_COLORS.custom;
  };

  // Prepare filter tags for the Filter Panel
  const filterTags = [];
  
  if (searchTerm) {
    filterTags.push({
      id: 'search',
      label: `Search: ${searchTerm}`,
      color: 'bg-blue-600/20 text-blue-400',
      icon: <Search size={14} className="flex-shrink-0" />
    });
  }

  selectedTags.forEach(tag => {
    filterTags.push({
      id: `tag-${tag}`,
      label: tag,
      color: getTagColor(tag),
      icon: tag === 'checklist' ? 
        <CheckSquare size={14} className="flex-shrink-0" /> : 
        <Tag size={14} className="flex-shrink-0" />
    });
  });

  if (selectedProjectId) {
    filterTags.push({
      id: 'project',
      label: selectedProjectId === 'uncategorized' ? 
        'Project: Uncategorized' : 
        `Project: ${availableProjects.find(p => p.id === selectedProjectId)?.title || 'Unknown'}`,
      color: 'bg-blue-600/20 text-blue-400',
      icon: <Briefcase size={14} className="flex-shrink-0" />
    });
  }

  if (selectedMilestoneId) {
    filterTags.push({
      id: 'milestone',
      label: availableMilestones.find(m => m.id === selectedMilestoneId)?.title || 'Unknown',
      color: 'bg-purple-600/20 text-purple-400',
      icon: <Target size={14} className="flex-shrink-0" />
    });
  }

  // Handle removing a single filter tag
  const handleRemoveTag = (id: string) => {
    if (id === 'search') setSearchTerm('');
    else if (id === 'project') setSelectedProjectId('');
    else if (id === 'milestone') setSelectedMilestoneId('');
    else if (id.startsWith('tag-')) toggleTag(id.substring(4));
  };
  
  // Sort options
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'az', label: 'A-Z' },
    { id: 'za', label: 'Z-A' }
  ];
  
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex items-center space-x-3">
          <FilterBar
            searchPlaceholder="Search notes..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortOptions={sortOptions}
            currentSortOption={sortBy}
            onSortChange={(option) => setSortBy(option as 'newest' | 'oldest' | 'az' | 'za')}
            filterTags={filterTags}
            onRemoveTag={handleRemoveTag}
            onClearAll={clearFilters}
            onToggleFilters={() => setShowNoteFilters(!showNoteFilters)}
            isFiltersOpen={showNoteFilters}
          >
            <button 
              onClick={() => {
                setNoteToEdit(null);
                setShowAddNoteModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={18} />
              <span>Add Note</span>
            </button>
          </FilterBar>
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

      {showNoteFilters && (
        <FilterPanel title="Filter Notes">
          {/* Project Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Briefcase size={14} className="mr-2 text-blue-400" />
              Project
            </h3>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!selectedMilestoneId}
            >
              {selectedMilestoneId ? (
                <option value={milestones.find(m => m.id === selectedMilestoneId)?.projectId || ''}>
                  {availableProjects.find(p => p.id === milestones.find(m => m.id === selectedMilestoneId)?.projectId)?.title || 'Unknown'}
                </option>
              ) : (
                <>
                  <option value="">All Projects</option>
                  <option value="uncategorized">Uncategorized</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          
          {/* Milestone Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Target size={14} className="mr-2 text-purple-400" />
              Milestone
            </h3>
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              disabled={selectedProjectId === 'uncategorized'}
              className={`w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                selectedProjectId === 'uncategorized' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">All Milestones</option>
              {availableMilestones.map(milestone => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </option>
              ))}
            </select>
            {selectedProjectId === 'uncategorized' && (
              <p className="text-xs text-zinc-500 mt-1">Milestone filter is disabled for uncategorized notes</p>
            )}
          </div>
          
          {/* Tags Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Tag size={14} className="mr-2 text-green-400" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                    selectedTags.includes(tag)
                      ? getTagColor(tag)
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tag === 'checklist' ? (
                    <CheckSquare size={14} />
                  ) : (
                    <Tag size={14} />
                  )}
                  <span className="text-sm">{tag}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              ))}
            </div>
          </div>
        </FilterPanel>
      )}
      
      {/* View Tabs */}
      <div className="flex mb-4">
        <button
          onClick={() => setFilteredView('all')}
          className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
            filteredView === 'all' 
              ? 'bg-zinc-700 text-white' 
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span className="sm:hidden"><CheckCircle size={16} /></span>
          <span className="hidden sm:inline">All</span>
        </button>
        <button
          onClick={() => setFilteredView('pinned')}
          className={`px-3 py-2 text-sm transition-colors ${
            filteredView === 'pinned' 
              ? 'bg-zinc-700 text-orange-400' 
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span className="sm:hidden"><Pin size={16} /></span>
          <span className="hidden sm:inline">Pinned</span>
        </button>
        <button
          onClick={() => setFilteredView('archived')}
          className={`px-3 py-2 text-sm rounded-r-lg transition-colors ${
            filteredView === 'archived' 
              ? 'bg-zinc-700 text-zinc-300' 
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span className="sm:hidden"><Archive size={16} /></span>
          <span className="hidden sm:inline">Archived</span>
        </button>
      </div>
      
      {/* Notes List */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-2">No notes found</p>
          <p className="text-sm text-zinc-500">
            {filteredView === 'all' 
              ? searchTerm || selectedTags.length > 0 || selectedProjectId || selectedMilestoneId
                ? 'Try adjusting your filters'
                : 'Create your first note to get started'
              : filteredView === 'pinned'
                ? 'Pin important notes to see them here'
                : 'Archived notes will appear here'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map(note => (
            <NoteItem
              key={`${note.id}-${note.updatedAt}`}
              {...note}
              onPin={() => togglePinned(note.id)}
              onEdit={() => handleEditNote(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
              onArchive={() => {
                if (note.archived) {
                  unarchiveNote(note.id);
                } else {
                  archiveNote(note.id);
                }
              }}
              onAskQuestion={onAskQuestion}
            />
          ))}
        </div>
      )}
      
      {/* Add/Edit Note Modal */}
      {(showAddNoteModal || noteToEdit) && (
        <NoteModal
          initialData={editingNote}
          onClose={() => {
            setShowAddNoteModal(false);
            setNoteToEdit(null);
          }}
        />
      )}
      
      {/* Delete Confirmation */}
      {noteToDelete && (
        <ConfirmationDialog
          message="Are you sure you want to delete this note? This action cannot be undone."
          confirmText="Delete Note"
          onConfirm={confirmDeleteNote}
          onCancel={() => setNoteToDelete(null)}
        />
      )}
    </div>
  );
};

export default NotesPage;