import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TaskDto,
  TaskStatus,
  TaskPriority,
  PaginationMeta,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS
} from '@ai-business-manager/shared';
import {
  Search,
  Calendar,
  User,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Plus,
  Milestone
} from 'lucide-react';

interface TasksListViewProps {
  tasks: TaskDto[];
  pagination: PaginationMeta | null;
  page: number;
  onPageChange: (newPage: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  isOverdueOnly: boolean;
  onToggleOverdueOnly: () => void;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: string, title: string) => Promise<void>;
  onAddTask?: () => void;
}

export function TasksListView({
  tasks,
  pagination,
  page,
  onPageChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  isOverdueOnly,
  onToggleOverdueOnly,
  isLoading,
  onRefresh,
  onSelectTask,
  onUpdateStatus,
  onDeleteTask,
  onAddTask
}: TasksListViewProps) {
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning" className="text-[10px] px-1.5 py-0">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-blue-700 bg-blue-50 border-blue-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-600 bg-slate-50">Low</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, descriptions..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Overdue Quick Toggle */}
          <Button
            variant={isOverdueOnly ? 'destructive' : 'outline'}
            size="sm"
            onClick={onToggleOverdueOnly}
            className="text-xs h-8 gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Overdue Only</span>
          </Button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs h-8 gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {onAddTask && (
            <Button
              size="sm"
              onClick={onAddTask}
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Tasks Table Card */}
      <Card className="border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Task Title</th>
                <th className="py-2.5 px-4">Project / Milestone</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Assignee</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4 text-center">Subtasks</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No tasks found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Create tasks to assign deliverables and track team workload.
                    </p>
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTask(t.id)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Title */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:text-blue-600 transition-colors">
                          {t.title}
                        </span>
                        {t.commentCount > 0 && (
                          <div className="flex items-center gap-0.5 text-[10px] text-slate-400">
                            <MessageSquare className="h-3 w-3" />
                            <span>{t.commentCount}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Project & Milestone */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 block">
                          {t.projectName || '—'}
                        </span>
                        {t.milestoneTitle && (
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-normal inline-flex items-center gap-1">
                            <Milestone className="h-2.5 w-2.5" />
                            {t.milestoneTitle}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Select */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={t.status}
                        onChange={(e) => onUpdateStatus(t.id, e.target.value as TaskStatus)}
                        className="text-[11px] font-semibold py-1 px-2 rounded border border-slate-200 bg-white"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      {getPriorityBadge(t.priority)}
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4 text-slate-700">
                      {t.assigneeName ? (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t.assigneeName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4">
                      <div
                        className={`flex items-center gap-1.5 ${
                          t.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{t.dueDate ? t.dueDate.substring(0, 10) : '—'}</span>
                        {t.isOverdue && <span className="text-[10px] text-rose-500 font-semibold">(Overdue)</span>}
                      </div>
                    </td>

                    {/* Subtasks Count */}
                    <td className="py-3 px-4 text-center">
                      {t.subtaskCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {t.completedSubtaskCount}/{t.subtaskCount}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTask(t.id, t.title)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} tasks
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={pagination.page <= 1 || isLoading}
                className="h-7 text-xs px-2.5"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="h-7 text-xs px-2.5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
