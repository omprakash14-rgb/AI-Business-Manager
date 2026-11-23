import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ProjectSummaryDto,
  TaskDto,
  TaskStatus,
  PaginationMeta
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  FolderKanban,
  Kanban,
  List,
  Plus,
  RefreshCw,
  CheckSquare,
  ShieldCheck,
  Target
} from 'lucide-react';
import { ProjectsOverview } from './ProjectsOverview';
import { ProjectDetailView } from './ProjectDetailView';
import { TasksKanbanView } from './TasksKanbanView';
import { TasksListView } from './TasksListView';
import { CreateProjectModal } from './CreateProjectModal';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';

type MainTab = 'projects' | 'kanban' | 'tasks';

export function ProjectsModuleView() {
  const [activeTab, setActiveTab] = useState<MainTab>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Summary Metrics
  const [summary, setSummary] = useState<ProjectSummaryDto | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // All Tasks state for Kanban & List tabs
  const [allTasks, setAllTasks] = useState<TaskDto[]>([]);
  const [tasksPagination, setTasksPagination] = useState<PaginationMeta | null>(null);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksSearch, setTasksSearch] = useState('');
  const [tasksStatusFilter, setTasksStatusFilter] = useState('');
  const [tasksPriorityFilter, setTasksPriorityFilter] = useState('');
  const [tasksOverdueOnly, setTasksOverdueOnly] = useState(false);
  const [isTasksLoading, setIsTasksLoading] = useState(false);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskInitialStatus, setCreateTaskInitialStatus] = useState<TaskStatus>('todo');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const data = await apiClient.getProjectSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load project summary', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const loadAllTasks = useCallback(async () => {
    setIsTasksLoading(true);
    try {
      const res = await apiClient.getTasks({
        page: tasksPage,
        limit: activeTab === 'kanban' ? 200 : 20,
        search: tasksSearch || undefined,
        status: tasksStatusFilter || undefined,
        priority: tasksPriorityFilter || undefined,
        isOverdue: tasksOverdueOnly || undefined
      });
      setAllTasks(res.items);
      setTasksPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load all tasks', err);
    } finally {
      setIsTasksLoading(false);
    }
  }, [tasksPage, activeTab, tasksSearch, tasksStatusFilter, tasksPriorityFilter, tasksOverdueOnly]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (activeTab === 'kanban' || activeTab === 'tasks') {
      loadAllTasks();
    }
  }, [activeTab, loadAllTasks]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await apiClient.updateTaskStatus(taskId, { status: newStatus });
      await Promise.all([loadAllTasks(), loadSummary()]);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) return;
    try {
      await apiClient.deleteTask(taskId);
      await Promise.all([loadAllTasks(), loadSummary()]);
    } catch (err: any) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* If a specific project is selected, render the ProjectDetailView */}
      {selectedProjectId ? (
        <ProjectDetailView
          projectId={selectedProjectId}
          onBack={() => {
            setSelectedProjectId(null);
            loadSummary();
          }}
          onProjectUpdated={() => {
            loadSummary();
          }}
        />
      ) : (
        <>
          {/* Module Banner */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">
                    Phase 7 Active — Project Management
                  </Badge>
                  <Badge variant="outline" className="text-xs text-slate-500 font-normal">
                    Workload & Milestones
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>Tenant Isolated Workspaces</span>
                  </div>
                </div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                  Projects & Team Workload
                </h1>
                <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
                  Plan, organize, assign and track projects, tasks, subtasks, deadlines, and milestone
                  deliverables across your SME workforce.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="gap-1.5 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  <span>New Project</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCreateTaskInitialStatus('todo');
                    setIsCreateTaskOpen(true);
                  }}
                  className="gap-1.5 text-xs h-8 bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5 text-blue-600" />
                  <span>New Task</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Module Tabs Navigation */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-1 sm:space-x-4 pb-px">
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'projects'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <FolderKanban className="h-4 w-4" />
                <span>Projects Directory</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Kanban className="h-4 w-4" />
                <span>All Tasks Kanban</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Task List</span>
              </button>
            </nav>
          </div>

          {/* Active Tab View */}
          <div>
            {activeTab === 'projects' && (
              <ProjectsOverview
                onSelectProject={(id) => setSelectedProjectId(id)}
                onCreateProject={() => setIsCreateProjectOpen(true)}
                summary={summary}
                onRefreshSummary={loadSummary}
              />
            )}

            {activeTab === 'kanban' && (
              <TasksKanbanView
                tasks={allTasks}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onUpdateStatus={handleUpdateTaskStatus}
                onAddTask={(defStatus) => {
                  setCreateTaskInitialStatus(defStatus);
                  setIsCreateTaskOpen(true);
                }}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksListView
                tasks={allTasks}
                pagination={tasksPagination}
                page={tasksPage}
                onPageChange={setTasksPage}
                search={tasksSearch}
                onSearchChange={setTasksSearch}
                statusFilter={tasksStatusFilter}
                onStatusFilterChange={setTasksStatusFilter}
                priorityFilter={tasksPriorityFilter}
                onPriorityFilterChange={setTasksPriorityFilter}
                isOverdueOnly={tasksOverdueOnly}
                onToggleOverdueOnly={() => setTasksOverdueOnly((prev) => !prev)}
                isLoading={isTasksLoading}
                onRefresh={() => {
                  loadAllTasks();
                  loadSummary();
                }}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onUpdateStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
                onAddTask={() => {
                  setCreateTaskInitialStatus('todo');
                  setIsCreateTaskOpen(true);
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={(newId) => {
          loadSummary();
          setSelectedProjectId(newId);
        }}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        defaultStatus={createTaskInitialStatus}
        onClose={() => setIsCreateTaskOpen(false)}
        onSuccess={() => {
          loadAllTasks();
          loadSummary();
        }}
      />

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          isOpen={!!selectedTaskId}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            loadAllTasks();
            loadSummary();
          }}
        />
      )}
    </div>
  );
}
