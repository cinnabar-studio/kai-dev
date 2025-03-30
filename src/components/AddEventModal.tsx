import React, { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  time: string;
  notes: string;
  completed: boolean;
}

interface AddEventModalProps {
  onSave: (event: Omit<Event, 'id' | 'completed'>) => void;
  onClose: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onSave, onClose }) => {
  // Get current time rounded to nearest 30 minutes
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.round(minutes / 30) * 30;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const [event, setEvent] = useState({
    title: '',
    time: format(now, 'HH:mm'),
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.title.trim()) return;
    onSave(event);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">Add New Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-zinc-400 mb-1">
                Time
              </label>
              <input
                type="time"
                id="time"
                value={event.time}
                onChange={(e) => setEvent({ ...event, time: e.target.value })}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-400 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                placeholder="Enter event title"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-zinc-400 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={event.notes}
                onChange={(e) => setEvent({ ...event, notes: e.target.value })}
                placeholder="Add any additional notes"
                rows={3}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!event.title.trim()}
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;