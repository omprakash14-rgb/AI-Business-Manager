import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TaskDto,
  TaskStatus,
  TaskPriority,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS
} from '@ai-business-manager/shared';
import {
  Calendar,
  CheckCircle2,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckSquare,
  Plus,
  AlertCircle,
  FolderKanban
} from 'lucide-react';

interface TasksKanbanViewProps {
  tasks: TaskDto[];
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onAddTask?: (defaultStatus: TaskStatus) => void;
}

const COLUMNS: { status: TaskStatus; title: string; color: string; border: string }[] = [
  { status: 'todo', title: 'To Do', color: 'bg-slate-100 text-slate-700', border: 'border-slate-300' },
  { status: 'in_progress', title: 'In Progress', color: 'bg-blue-50 text-blue-700', border: 'border-blue-300' },
  { status: 'in_review', title: 'In Review', color: 'bg-purple-50 text-purple-700', border: 'border-purple-300' },
  { status: 'completed', title: 'Completed', color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-300' }
];

export function TasksKanbanView({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onAddTask
}: TasksKanbanViewProps) {
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

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

  const handleShift = async (e: React.MouseEvent, taskId: string, nextStatus: TaskStatus) => {
    e.stopPropagation();
    setMovingTaskId(taskId);
    try {
      await onUpdateStatus(taskId, nextStatus);
    } finally {
      setMovingTaskId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col, colIdx) => {
        const colTasks = tasks.filter((t) => t.status === col.status && !t.parentTaskId);
        const prevCol = colIdx > 0 ? COLUMNS[colIdx - 1] : null;
        const nextCol = colIdx < COLUMNS.length - 1 ? COLUMNS[colIdx + 1] : null;

        return (
          <div
            key={col.status}
            className="flex flex-col bg-slate-50/70 border border-slate-200 rounded-xl p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{colTasks.length}</span>
              </div>
              {onAddTask && (
                <button
                  type="button"
                  onClick={() => onAddTask(col.status)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Task Cards Column */}
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs italic">
                  No tasks in {col.title.toLowerCase()}
                </div>
              ) : (
                colTasks.map((t) => (
                  <Card
                    key={t.id}
                    onClick={() => onSelectTask(t.id)}
                    className="p-3 bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer select-none group"
                  >
                    <div className="space-y-2">
                      {/* Priority & Project Indicator */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {getPriorityBadge(t.priority)}
                          {t.projectName && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {t.projectName}
                            </span>
                          )}
                        </div>
                        {t.milestoneTitle && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded font-medium truncate max-w-[100px]">
                            {t.milestoneTitle}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {t.title}
                      </h4>

                      {/* Meta footer: Due date & Assignee */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                        <div
                          className={`flex items-center gap-1 ${
                            t.isOverdue ? 'text-rose-600 font-semibold' : ''
                          }`}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>{t.dueDate ? t.dueDate.substring(0, 10) : 'No due date'}</span>
                        </div>

                        {t.assigneeName ? (
                          <div className="flex items-center gap-1" title={t.assigneeName}>
                            <User className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[80px]">{t.assigneeName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </div>

                      {/* Subtasks & Comments counts + Move buttons */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          {t.subtaskCount > 0 && (
                            <div className="flex items-center gap-0.5 text-slate-600" title="Checklist subtasks">
                              <CheckSquare className="h-3 w-3" />
                              <span>{t.completedSubtaskCount}/{t.subtaskCount}</span>
                            </div>
                          )}
                          {t.commentCount > 0 && (
                            <div className="flex items-center gap-0.5 text-slate-600" title="Comments">
                              <MessageSquare className="h-3 w-3" />
                              <span>{t.commentCount}</span>
                            </div>
                          )}
                        </div>

                        {/* Interactive transition arrows */}
                        <div className="flex items-center gap-1">
                          {prevCol && (
                            <button
                              type="button"
                              onClick={(e) => handleShift(e, t.id, prevCol.status)}
                              disabled={movingTaskId === t.id}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title={`Move to ${prevCol.title}`}
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {nextCol && (
                            <button
                              type="button"
                              onClick={(e) => handleShift(e, t.id, nextCol.status)}
                              disabled={movingTaskId === t.id}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title={`Move to ${nextCol.title}`}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
