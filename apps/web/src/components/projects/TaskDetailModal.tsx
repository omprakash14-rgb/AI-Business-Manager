import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TaskDto,
  CommentDto,
  TaskStatus,
  TaskPriority,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  X,
  Calendar,
  User,
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Milestone,
  FolderKanban
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export function TaskDetailModal({
  isOpen,
  taskId,
  onClose,
  onTaskUpdated
}: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Quick subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadTaskData = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const [tData, cData] = await Promise.all([
        apiClient.getTask(taskId),
        apiClient.getProjectComments('', taskId) // backend filters by taskId
      ]);
      setTask(tData);
      setComments(cData);
    } catch (err: any) {
      console.error('Failed to load task details', err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskData();
    } else {
      setTask(null);
      setComments([]);
    }
  }, [isOpen, taskId, loadTaskData]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await apiClient.updateTaskStatus(task.id, { status: newStatus });
      setTask(updated);
      onTaskUpdated();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!task) return;
    try {
      const updated = await apiClient.updateTask(task.id, { priority: newPriority });
      setTask(updated);
      onTaskUpdated();
    } catch (err: any) {
      alert(`Failed to update priority: ${err.message}`);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newSubtaskTitle.trim()) return;

    setIsAddingSubtask(true);
    try {
      await apiClient.createTask({
        projectId: task.projectId,
        parentTaskId: task.id,
        title: newSubtaskTitle.trim(),
        status: 'todo',
        priority: task.priority
      });
      setNewSubtaskTitle('');
      await loadTaskData();
      onTaskUpdated();
    } catch (err: any) {
      alert(`Failed to add subtask: ${err.message}`);
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    try {
      await apiClient.updateTaskStatus(subtaskId, { status: nextStatus });
      await loadTaskData();
      onTaskUpdated();
    } catch (err: any) {
      alert(`Failed to toggle subtask: ${err.message}`);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const created = await apiClient.createProjectComment(task.projectId, {
        taskId: task.id,
        content: newComment.trim()
      });
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err: any) {
      alert(`Failed to post comment: ${err.message}`);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await apiClient.deleteProjectComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return;

    try {
      await apiClient.deleteTask(task.id);
      onTaskUpdated();
      onClose();
    } catch (err: any) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
              {task?.projectName || 'Project Task'}
            </span>
            {task?.milestoneTitle && (
              <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 flex items-center gap-1">
                <Milestone className="h-3 w-3" />
                {task.milestoneTitle}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        {isLoading && !task ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading task details...</div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title & Quick Status Bar */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{task.title}</h2>
              {task.description && (
                <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {task.description}
                </p>
              )}
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Status
                </span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  disabled={isUpdatingStatus}
                  className="w-full text-xs font-semibold py-1 px-2 rounded border border-slate-300 bg-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Priority
                </span>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  className="w-full text-xs font-semibold py-1 px-2 rounded border border-slate-300 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Assignee
                </span>
                <div className="flex items-center gap-1.5 py-1 text-slate-800 font-medium">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{task.assigneeName || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Due Date
                </span>
                <div
                  className={`flex items-center gap-1.5 py-1 font-medium ${
                    task.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{task.dueDate ? task.dueDate.substring(0, 10) : 'None'}</span>
                  {task.isOverdue && <span className="text-[10px] text-rose-500">(Overdue)</span>}
                </div>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Subtasks</span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {task.completedSubtaskCount} of {task.subtaskCount} completed
                  </Badge>
                </div>
              </div>

              {/* Subtask list */}
              <div className="space-y-1.5">
                {task.subtasks?.map((st) => {
                  const isDone = st.status === 'completed';
                  return (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleSubtask(st.id, st.status)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className={`font-medium ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {st.title}
                        </span>
                      </label>
                      {st.assigneeName && (
                        <span className="text-[10px] text-slate-400">{st.assigneeName}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new checklist subtask..."
                  className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                  className="h-7 text-xs bg-slate-800 hover:bg-slate-900 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </form>
            </div>

            {/* Comments & Collaboration Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Discussion ({comments.length})
                  </span>
                </div>
              </div>

              {/* Comments Feed */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 italic">
                    No comments yet. Start the conversation below.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{c.authorName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString()} at{' '}
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-slate-700 whitespace-pre-line">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment or update..."
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPostingComment || !newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs"
                >
                  <Send className="h-3 w-3" />
                  Post
                </Button>
              </form>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDeleteTask}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Task
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
