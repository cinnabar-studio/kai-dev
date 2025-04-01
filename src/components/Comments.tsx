import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useCommentsStore } from '../store/commentsStore';

interface CommentsProps {
  entityId: string;
  entityType: string;
}

const Comments: React.FC<CommentsProps> = ({ entityId, entityType }) => {
  const { getComments, addComment } = useCommentsStore();
  const [newComment, setNewComment] = useState('');
  const comments = getComments(entityId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(entityId, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="mt-2">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Comment on this ${entityType}...`}
            className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 mb-3">
        {comments.length === 0 ? (
          <p className="text-sm text-zinc-500">No comments yet</p>
        ) : (
          comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((comment) => (
              <div key={comment.id} className="bg-zinc-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{comment.author}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                    {new Date(comment.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 break-words">{comment.content}</p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Comments;