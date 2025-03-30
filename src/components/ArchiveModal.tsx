import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ArchiveModalProps {
  entityType: string;
  entityTitle: string;
  onArchive: (reason: string) => void;
  onClose: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({
  entityType,
  entityTitle,
  onArchive,
  onClose,
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onArchive(reason);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Archive {entityType}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-zinc-400 mb-4">
          You are about to archive "{entityTitle}". Please provide a reason for archiving.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for archiving..."
            className="w-full bg-zinc-800 rounded-lg p-3 mb-4 min-h-[100px] text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Archive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArchiveModal;