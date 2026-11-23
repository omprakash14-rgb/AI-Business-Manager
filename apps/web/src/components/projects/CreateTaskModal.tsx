import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  TaskStatus,
  TaskPriority,
  ProjectDto,
  MilestoneDto
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, CheckSquare, Calendar, User, Clock, Flag, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  defaultProjectId?: string;
  defaultMilestoneId?: string;
  defaultParentTaskId?: string;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTaskModal({
  isOpen,
  defaultProjectId,
  defaultMilestoneId,
  defaultParentTaskId,
  defaultStatus = 'todo',
  onClose,
  onSuccess
}: CreateTaskModalProps) {
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [milestoneId, setMilestoneId] = useState(defaultMilestoneId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  // Dropdown lists
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [members, setMembers] = useState<{ id: string; fullName: string; email: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultProjectId) setProjectId(defaultProjectId);
      if (defaultMilestoneId) setMilestoneId(defaultMilestoneId);
      if (defaultStatus) setStatus(defaultStatus);
      loadProjectsAndMembers();
    }
  }, [isOpen, defaultProjectId, defaultMilestoneId, defaultStatus]);

  useEffect(() => {
    if (projectId) {
      loadMilestonesForProject(projectId);
    } else {
      setMilestones([]);
    }
  }, [projectId]);

  async function loadProjectsAndMembers() {
    try {
      const [projRes, orgRes] = await Promise.all([
        apiClient.getProjects({ limit: 100 }),
        apiClient.getMembers()
      ]);
      setProjects(projRes.items);
      if (!projectId && projRes.items.length > 0) {
        setProjectId(projRes.items[0].id);
      }
      setMembers(
        orgRes.map((m) => ({
          id: m.user.id,
          fullName: m.user.fullName,
          email: m.user.email
        }))
      );
    } catch (err: any) {
      console.error('Failed to load projects/members', err);
    }
  }

  async function loadMilestonesForProject(pId: string) {
    try {
      const ms = await apiClient.getProjectMilestones(pId);
      setMilestones(ms);
    } catch (err: any) {
      console.error('Failed to load milestones for project', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!projectId) {
      setError('Please select a project.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.createTask({
        projectId,
        milestoneId: milestoneId || undefined,
        parentTaskId: defaultParentTaskId || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined
      });

      setTitle('');
      setDescription('');
      setEstimatedHours('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {defaultParentTaskId ? 'Add Subtask' : 'Create New Task'}
              </h3>
              <p className="text-xs text-slate-500">Assign work items, deadlines and milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project & Milestone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project <span className="text-rose-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!!defaultProjectId}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Milestone (Optional)
              </label>
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">No Milestone</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement user permission checks on invoice routes"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignee & Estimated Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Hours
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="1000"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="e.g. 4.0"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Start and Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task instructions, acceptance criteria, or context..."
              rows={3}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Creating Task...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
