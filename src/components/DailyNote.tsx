import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle, Plus, X, ListChecks, ChevronLeft, ChevronRight, Clock, Pencil, Save, RotateCcw } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, isToday, isSameDay } from 'date-fns';
import 'react-day-picker/dist/style.css';
import EditRoutineModal from './EditRoutineModal';
import AddEventModal from './AddEventModal';
import TaskItem from './TaskItem';
import { useGoalsStore } from '../store/goalsStore';
import { useNoteStore } from '../store/noteStore';
import ConfirmationDialog from './ConfirmationDialog';

interface Event {
  id: string;
  title: string;
  time: string;
  notes: string;
  completed: boolean;
}

interface Routine {
  id: string;
  title: string;
  completed: boolean;
  time: string;
}

const DailyNote = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [isEditingRoutines, setIsEditingRoutines] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const templateTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use the note store
  const { 
    getNote, 
    createNote, 
    updateNote, 
    getTemplate, 
    updateTemplate, 
    getDayStatus, 
    getAllNotes 
  } = useNoteStore();
  
  // Get or create current note
  const currentNote = getNote(selectedDate) || createNote(selectedDate);
  const [noteContent, setNoteContent] = useState(currentNote.content);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateContent, setTemplateContent] = useState(getTemplate());
  
  const { 
    tasks, 
    toggleTask, 
    archiveTask, 
    updateTaskImpact, 
    toggleTaskUrgent,
    getGlobalUncategorizedTasks
  } = useGoalsStore();

  const [events, setEvents] = useState<Event[]>([
    { 
      id: '1', 
      title: 'Team Standup', 
      time: '10:00', 
      notes: 'Review sprint progress and blockers', 
      completed: false 
    },
    { 
      id: '2', 
      title: 'Product Review', 
      time: '14:30', 
      notes: 'Present new feature designs to stakeholders', 
      completed: false 
    },
  ]);

  const [routines, setRoutines] = useState<Routine[]>([
    { id: '1', title: 'Morning workout', completed: false, time: '06:00 AM' },
    { id: '2', title: 'Review daily goals', completed: false, time: '09:00 AM' },
    { id: '3', title: 'Evening reflection', completed: false, time: '08:00 PM' },
  ]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [noteContent]);

  // Auto-resize template textarea
  useEffect(() => {
    const textarea = templateTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [templateContent, isEditingTemplate]);

  // Load current template whenever editing mode changes
  useEffect(() => {
    if (isEditingTemplate) {
      setTemplateContent(getTemplate());
    }
  }, [isEditingTemplate, getTemplate]);

  // Update note when selected date changes
  useEffect(() => {
    const note = getNote(selectedDate);
    if (note) {
      setNoteContent(note.content);
    } else {
      setNoteContent('');
    }
  }, [selectedDate, getNote]);

  // Save note content when it changes
  useEffect(() => {
    if (currentNote && noteContent !== currentNote.content) {
      updateNote(currentNote.id, noteContent);
    }
  }, [noteContent, currentNote, updateNote]);

  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    // Check if note exists for the new date
    const noteExists = getDayStatus(newDate) === 'exists';
    if (noteExists) {
      setSelectedDate(newDate);
    } else {
      // Show confirmation dialog
      setShowConfirmation(newDate);
    }
    
    setIsCalendarOpen(false);
  };

  const handleSelectDay = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if note exists for the selected date
    const noteExists = getDayStatus(date) === 'exists';
    
    if (noteExists || isToday(date)) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    } else {
      // Show confirmation dialog
      setShowConfirmation(date);
    }
  };

  const handleCreateNote = () => {
    if (!showConfirmation) return;
    
    createNote(showConfirmation);
    setSelectedDate(showConfirmation);
    setShowConfirmation(null);
    setIsCalendarOpen(false);
  };

  const toggleEvent = (eventId: string) => {
    setEvents(items =>
      items.map(item =>
        item.id === eventId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(items =>
      items.map(item =>
        item.id === eventId ? { ...item, ...updates } : item
      )
    );
  };

  const addNewEvent = (eventData: Omit<Event, 'id' | 'completed'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(),
      completed: false,
    };

    const updatedEvents = [...events];
    const insertIndex = updatedEvents.findIndex(event => event.time > eventData.time);
    
    if (insertIndex === -1) {
      updatedEvents.push(newEvent);
    } else {
      updatedEvents.splice(insertIndex, 0, newEvent);
    }

    setEvents(updatedEvents);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(items => items.filter(item => item.id !== eventId));
    setEditingEvent(null);
  };

  const toggleRoutine = (routineId: string) => {
    setRoutines(items =>
      items.map(item =>
        item.id === routineId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleSaveRoutines = (updatedRoutines: { id: string; title: string }[]) => {
    setRoutines(updatedRoutines.map(routine => ({
      ...routine,
      completed: false,
      time: '09:00 AM',
    })));
  };

  const saveTemplate = () => {
    // Save the current template content
    updateTemplate(templateContent);
    setIsEditingTemplate(false);
  };

  const applyTemplate = () => {
    const template = getTemplate();
    setNoteContent(template);
    if (currentNote) {
      updateNote(currentNote.id, template);
    }
  };

  // Get days with notes for the calendar
  const daysWithNotes = getAllNotes().map(note => new Date(note.date));

  // Customize the day cell in the calendar
  const dayWithDot = (day: Date) => {
    const hasNote = daysWithNotes.some(noteDate => isSameDay(noteDate, day));
    
    if (!hasNote) return undefined;
    
    return (
      <div className="relative">
        <div className="absolute w-1 h-1 bg-blue-500 rounded-full bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>
    );
  };

  const dailyTasks = getGlobalUncategorizedTasks();
  const notesTemplate = getTemplate();

  return (
    <>
      {/* Tasks and Routines Section */}
      <div className="w-1/2 border-r border-zinc-800 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="p-2 hover:bg-zinc-800 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
              >
                <CalendarIcon size={20} />
              </button>
              {isCalendarOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setIsCalendarOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 shadow-xl border border-zinc-800 rounded-lg z-50">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleSelectDay}
                      footer={dayWithDot}
                      modifiers={{
                        hasNote: daysWithNotes
                      }}
                      modifiersStyles={{
                        hasNote: {
                          fontWeight: 'bold',
                          borderBottom: '2px solid var(--rdp-accent-color)'
                        }
                      }}
                      className="bg-zinc-900 text-white rdp"
                      classNames={{
                        day_selected: 'bg-blue-600',
                        day_today: 'font-bold',
                        day: 'hover:bg-zinc-800 rounded-lg relative',
                        nav_button: 'hover:bg-zinc-800 rounded-lg',
                        caption_label: 'text-white',
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Daily Note</h2>
              <div className="flex items-center space-x-2 text-sm text-zinc-400">
                <button
                  onClick={() => navigateDate('prev')}
                  className="hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{formattedDate}</span>
                <button
                  onClick={() => navigateDate('next')}
                  className="hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          {!isToday(selectedDate) && (
            <button
              onClick={() => handleSelectDay(new Date())}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <CalendarIcon size={16} />
              <span>View Today's Note</span>
            </button>
          )}
        </div>

        {/* Tasks Section */}
        <div className="bg-zinc-900 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              Tasks for Today
            </h3>
            <button className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {dailyTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onArchive={archiveTask}
                onUpdateImpact={updateTaskImpact}
                onToggleUrgent={toggleTaskUrgent}
              />
            ))}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-zinc-900 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Clock size={18} className="text-yellow-400" />
              Schedule
            </h3>
            <button 
              onClick={() => setIsAddingEvent(true)}
              className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {events.map(event => (
              <div
                key={event.id}
                className={`flex items-start p-2 rounded-lg transition-all ${
                  editingEvent === event.id ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                }`}
              >
                {editingEvent === event.id ? (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={event.time}
                        onChange={(e) => updateEvent(event.id, { time: e.target.value })}
                        className="bg-zinc-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                        placeholder="Event title"
                        className="flex-1 bg-zinc-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        autoFocus
                      />
                    </div>
                    <textarea
                      value={event.notes}
                      onChange={(e) => updateEvent(event.id, { notes: e.target.value })}
                      placeholder="Add notes (optional)"
                      className="w-full bg-zinc-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setEditingEvent(null)}
                        className="px-2 py-1 text-xs bg-yellow-500 text-black rounded hover:bg-yellow-400"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => toggleEvent(event.id)}
                      className={`mt-1 w-5 h-5 rounded-full border ${
                        event.completed
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'border-zinc-600 hover:border-yellow-500'
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      {event.completed && <CheckCircle size={14} className="text-white" />}
                    </button>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-yellow-500">{event.time}</span>
                          <span className={event.completed ? 'line-through text-zinc-500' : ''}>
                            {event.title}
                          </span>
                        </div>
                        <button
                          onClick={() => setEditingEvent(event.id)}
                          className="p-1 hover:bg-zinc-700 rounded"
                        >
                          <Pencil size={14} className="text-yellow-500" />
                        </button>
                      </div>
                      {event.notes && (
                        <p className="text-sm text-zinc-400 mt-1">{event.notes}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Routines Section */}
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <ListChecks size={18} className="text-purple-400" />
              Daily Routines
            </h3>
            <button 
              onClick={() => setIsEditingRoutines(true)} 
              className="text-xs text-zinc-400 hover:text-white"
            >
              Edit Template
            </button>
          </div>
          <div className="space-y-2">
            {routines.map(routine => (
              <div
                key={routine.id}
                className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleRoutine(routine.id)}
                    className={`w-5 h-5 rounded-full border ${
                      routine.completed
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-zinc-600 hover:border-purple-500'
                    } flex items-center justify-center`}
                  >
                    {routine.completed && <CheckCircle size={14} className="text-white" />}
                  </button>
                  <span className={routine.completed ? 'line-through text-zinc-500' : ''}>
                    {routine.title}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">{routine.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="w-1/2 p-6 overflow-y-auto flex flex-col h-screen">
        {isEditingTemplate ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Edit Template</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={saveTemplate}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save size={14} />
                  <span>Save Template</span>
                </button>
                <button
                  onClick={() => setIsEditingTemplate(false)}
                  className="p-1.5 text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Edit your template for daily notes. This will be available for all future notes.
            </p>
            <textarea
              ref={templateTextareaRef}
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              className="flex-1 w-full bg-zinc-900 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[calc(100vh-10rem)]"
              placeholder="Create a template for your daily notes..."
              style={{ height: 'auto' }}
            />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Notes</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditingTemplate(true)}
                  className="text-xs text-zinc-400 hover:text-white p-1.5 hover:bg-zinc-800 rounded transition-colors"
                >
                  Edit Template
                </button>
                {notesTemplate && (
                  <button
                    onClick={applyTemplate}
                    className="flex items-center space-x-1 p-1.5 text-blue-400 hover:text-blue-300 hover:bg-zinc-800 rounded transition-colors"
                    title="Apply Template"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Capture your notes for the day here.
            </p>
            <textarea
              ref={textareaRef}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="flex-1 w-full bg-zinc-900 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[calc(100vh-10rem)]"
              placeholder="Start writing..."
              style={{ height: 'auto' }}
            />
          </>
        )}
      </div>

      {/* Edit Routines Modal */}
      {isEditingRoutines && (
        <EditRoutineModal
          routines={routines}
          onSave={handleSaveRoutines}
          onClose={() => setIsEditingRoutines(false)}
        />
      )}

      {/* Add Event Modal */}
      {isAddingEvent && (
        <AddEventModal
          onSave={addNewEvent}
          onClose={() => setIsAddingEvent(false)}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <ConfirmationDialog
          message={`Create a new daily note for ${format(showConfirmation, 'MMMM d, yyyy')}?`}
          confirmText="Create Note"
          onConfirm={handleCreateNote}
          onCancel={() => setShowConfirmation(null)}
        />
      )}
    </>
  );
};

export { DailyNote };