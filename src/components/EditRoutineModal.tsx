import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Routine {
  id: string;
  title: string;
}

interface EditRoutineModalProps {
  routines: Routine[];
  onSave: (routines: Routine[]) => void;
  onClose: () => void;
}

interface SortableRoutineItemProps {
  routine: Routine;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

const SortableRoutineItem: React.FC<SortableRoutineItemProps> = ({
  routine,
  onUpdate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 bg-zinc-800/50 p-3 rounded-lg group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        className="p-1 text-zinc-400 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <div className="flex-1">
        <input
          type="text"
          value={routine.title}
          onChange={(e) => onUpdate(routine.id, e.target.value)}
          placeholder="Routine title"
          className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1"
        />
      </div>
      <button
        onClick={() => onDelete(routine.id)}
        className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const EditRoutineModal: React.FC<EditRoutineModalProps> = ({
  routines: initialRoutines,
  onSave,
  onClose,
}) => {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines.map(r => ({
    id: r.id,
    title: r.title,
  })));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addRoutine = () => {
    setRoutines([
      ...routines,
      {
        id: Math.random().toString(),
        title: '',
      },
    ]);
  };

  const updateRoutine = (id: string, title: string) => {
    setRoutines(routines.map(routine =>
      routine.id === id ? { ...routine, title } : routine
    ));
  };

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter(routine => routine.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRoutines((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    // Only save routines that have a title
    const validRoutines = routines.filter(routine => routine.title.trim());
    onSave(validRoutines);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">Edit Daily Routine Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={routines}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {routines.map((routine) => (
                  <SortableRoutineItem
                    key={routine.id}
                    routine={routine}
                    onUpdate={updateRoutine}
                    onDelete={deleteRoutine}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={addRoutine}
            className="mt-4 w-full py-2 px-4 border border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Routine</span>
          </button>
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoutineModal;