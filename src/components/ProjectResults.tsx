import React, { useState } from 'react';
import { Plus, CheckCircle2, X, MessageSquare, ChevronDown } from 'lucide-react';
import { useGoalsStore, type ProjectResult } from '../store/goalsStore';

interface ProjectResultsProps {
  projectId: string;
  results: ProjectResult[];
}

const ProjectResults: React.FC<ProjectResultsProps> = ({ projectId, results }) => {
  const { addProjectResult, toggleProjectResult, removeProjectResult, addCheckIn } = useGoalsStore();
  const [newResult, setNewResult] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [checkingInFor, setCheckingInFor] = useState<string | null>(null);
  const [checkInContent, setCheckInContent] = useState('');
  const [checkInProgress, setCheckInProgress] = useState(10);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResult.trim()) {
      addProjectResult(projectId, newResult.trim());
      setNewResult('');
      setIsAdding(false);
    }
  };

  const handleCheckIn = (resultId: string) => {
    if (!checkInContent.trim()) return;
    
    addCheckIn(projectId, resultId, {
      content: checkInContent.trim(),
      progress: checkInProgress,
    });
    
    setCheckInContent('');
    setCheckInProgress(10);
    setCheckingInFor(null);
  };

  const toggleComments = (resultId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedComments(newExpanded);
  };

  // Modified to handle toggling the result and setting progress to 100% when completed
  const handleToggleResult = (resultId: string, isAchieved: boolean) => {
    // If the result is being marked as completed, set progress to 100%
    if (!isAchieved) {
      // First add a check-in that sets progress to 100%
      addCheckIn(projectId, resultId, {
        content: "Marked as completed",
        progress: 100,
      });
    }
    
    // Then toggle the result status
    toggleProjectResult(projectId, resultId);
  };

  return (
    <div className="space-y-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <ChevronDown
            size={16}
            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
          <h3 className="text-sm font-medium text-zinc-400">
            Expected Results ({results.length})
          </h3>
        </div>
        {!isExpanded && (
          <div className="text-xs text-zinc-500">
            {results.filter(r => r.achieved).length} of {results.length} completed
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500">
              {results.filter(r => r.achieved).length} of {results.length} completed
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAdding(true);
              }}
              className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
            >
              <Plus size={16} />
            </button>
          </div>

          {results.length === 0 && !isAdding && (
            <div className="text-sm text-zinc-500 italic">
              Add expected results to help track progress
            </div>
          )}

          {isAdding && (
            <form onSubmit={handleSubmit} className="space-y-2" onClick={e => e.stopPropagation()}>
              <textarea
                value={newResult}
                onChange={(e) => setNewResult(e.target.value)}
                placeholder="What result do you expect to achieve?"
                className="w-full bg-zinc-800 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewResult('');
                    setIsAdding(false);
                  }}
                  className="px-2 py-1 text-sm text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newResult.trim()}
                  className="px-2 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="space-y-2">
                <div 
                  className="group flex items-start space-x-2 p-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleResult(result.id, result.achieved);
                    }}
                    className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      result.achieved
                        ? 'bg-green-500 border-green-500'
                        : 'border-zinc-600 hover:border-green-500'
                    }`}
                  >
                    {result.achieved && <CheckCircle2 size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-sm ${result.achieved ? 'line-through text-zinc-500' : ''}`}>
                        {result.description}
                      </span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCheckingInFor(checkingInFor === result.id ? null : result.id);
                          }}
                          className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProjectResult(projectId, result.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-red-400 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                        <span>Progress</span>
                        <span>{result.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${result.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Check-in Form */}
                    {checkingInFor === result.id && (
                      <div className="mt-3 p-3 bg-zinc-800 rounded-lg space-y-3" onClick={e => e.stopPropagation()}>
                        <textarea
                          value={checkInContent}
                          onChange={(e) => setCheckInContent(e.target.value)}
                          placeholder="What progress have you made?"
                          className="w-full bg-zinc-700 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                          rows={2}
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Progress made</span>
                            <span className="text-zinc-400">{checkInProgress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={checkInProgress}
                            onChange={(e) => setCheckInProgress(Number(e.target.value))}
                            className="w-full"
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCheckingInFor(null);
                            }}
                            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCheckIn(result.id);
                            }}
                            disabled={!checkInContent.trim()}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Submit Check-in
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Check-ins History */}
                    {result.checkIns && result.checkIns.length > 0 && (
                      <div className="mt-3">
                        {/* Latest Check-in */}
                        <div className="text-sm bg-zinc-800 rounded p-2">
                          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                            <span>{new Date(result.checkIns[result.checkIns.length - 1].createdAt).toLocaleDateString()}</span>
                            <span>+{result.checkIns[result.checkIns.length - 1].progress}%</span>
                          </div>
                          <p className="text-zinc-300">{result.checkIns[result.checkIns.length - 1].content}</p>
                        </div>

                        {/* Show More Button */}
                        {result.checkIns.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComments(result.id);
                            }}
                            className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-white mt-2"
                          >
                            <ChevronDown
                              size={14}
                              className={`transform transition-transform ${
                                expandedComments.has(result.id) ? 'rotate-180' : ''
                              }`}
                            />
                            <span>
                              {expandedComments.has(result.id)
                                ? 'Hide previous updates'
                                : `Show ${result.checkIns.length - 1} previous updates`}
                            </span>
                          </button>
                        )}

                        {/* Previous Check-ins */}
                        {expandedComments.has(result.id) && (
                          <div className="space-y-2 mt-2">
                            {result.checkIns.slice(0, -1).reverse().map((checkIn) => (
                              <div key={checkIn.id} className="text-sm bg-zinc-800 rounded p-2">
                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                                  <span>{new Date(checkIn.createdAt).toLocaleDateString()}</span>
                                  <span>+{checkIn.progress}%</span>
                                </div>
                                <p className="text-zinc-300">{checkIn.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectResults;