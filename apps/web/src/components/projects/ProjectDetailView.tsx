import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ProjectDto,
  TaskDto,
  MilestoneDto,
  CommentDto,
  TaskStatus,
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  PaginationMeta
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  Kanban,
  List,
  Milestone,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  Building,
  TrendingUp,
  MessageSquare,
  Send,
  Target
} from 'lucide-react';
import { TasksKanbanView } from './TasksKanbanView';
import { TasksListView } from './TasksListView';
import { MilestonesListView } from './MilestonesListView';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateMilestoneModal } from './CreateMilestoneModal';
import { ProjectMembersModal } from './ProjectMembersModal';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onProjectUpdated?: () => void;
}

type TabKey = 'kanban' | 'list' | 'milestones' | 'comments';

export function ProjectDetailView({
  projectId,
  onBack,
  onProjectUpdated
}: ProjectDetailViewProps) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [tasksPagination, setTasksPagination] = useState<PaginationMeta | null>(null);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksSearch, setTasksSearch] = useState('');
  const [tasksStatusFilter, setTasksStatusFilter] = useState('');
  const [tasksPriorityFilter, setTasksPriorityFilter] = useState('');
  const [tasksOverdueOnly, setTasksOverdueOnly] = useState(false);

  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>('kanban');
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskInitialStatus, setCreateTaskInitialStatus] = useState<TaskStatus>('todo');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateMilestoneOpen, setIsCreateMilestoneOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const loadProjectData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pData, mData, cData] = await Promise.all([
        apiClient.getProject(projectId),
        apiClient.getProjectMilestones(projectId),
        apiClient.getProjectComments(projectId)
      ]);
      setProject(pData);
      setMilestones(mData);
      setComments(cData);
    } catch (err: any) {
      console.error('Failed to load project details', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const loadTasks = useCallback(async () => {
    try {
      const res = await apiClient.getTasks({
        projectId,
        page: tasksPage,
        limit: activeTab === 'kanban' ? 200 : 20,
        search: tasksSearch || undefined,
        status: tasksStatusFilter || undefined,
        priority: tasksPriorityFilter || undefined,
        isOverdue: tasksOverdueOnly || undefined
      });
      setTasks(res.items);
      setTasksPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load project tasks', err);
    }
  }, [projectId, tasksPage, activeTab, tasksSearch, tasksStatusFilter, tasksPriorityFilter, tasksOverdueOnly]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await apiClient.updateTaskStatus(taskId, { status: newStatus });
      await Promise.all([loadTasks(), loadProjectData()]);
      if (onProjectUpdated) onProjectUpdated();
    } catch (err: any) {
      alert(`Failed to update task status: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) return;
    try {
      await apiClient.deleteTask(taskId);
      await Promise.all([loadTasks(), loadProjectData()]);
      if (onProjectUpdated) onProjectUpdated();
    } catch (err: any) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: 'pending' | 'completed') => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await apiClient.updateMilestone(milestoneId, { status: nextStatus });
      const mData = await apiClient.getProjectMilestones(projectId);
      setMilestones(mData);
    } catch (err: any) {
      alert(`Failed to update milestone: ${err.message}`);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete milestone "${title}"?`)) return;
    try {
      await apiClient.deleteMilestone(milestoneId);
      const mData = await apiClient.getProjectMilestones(projectId);
      setMilestones(mData);
    } catch (err: any) {
      alert(`Failed to delete milestone: ${err.message}`);
    }
  };

  const handlePostProjectComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const created = await apiClient.createProjectComment(projectId, {
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

  const handleProjectStatusChange = async (newStatus: ProjectStatus) => {
    try {
      const updated = await apiClient.updateProject(projectId, { status: newStatus });
      setProject(updated);
      if (onProjectUpdated) onProjectUpdated();
    } catch (err: any) {
      alert(`Failed to update project status: ${err.message}`);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (
      !window.confirm(
        `Are you sure you want to delete project "${project.name}"? All associated tasks, milestones, and comments will be archived.`
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteProject(project.id);
      if (onProjectUpdated) onProjectUpdated();
      onBack();
    } catch (err: any) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  if (!project && isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
        <p className="text-xs">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-12 text-center text-slate-500 space-y-3">
        <p className="text-sm font-semibold">Project not found or was removed.</p>
        <Button size="sm" variant="outline" onClick={onBack} className="text-xs">
          Return to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setCreateTaskInitialStatus('todo');
              setIsCreateTaskOpen(true);
            }}
            className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateMilestoneOpen(true)}
            className="text-xs h-8 gap-1.5"
          >
            <Milestone className="h-3.5 w-3.5 text-purple-600" />
            <span>Add Milestone</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMembersModalOpen(true)}
            className="text-xs h-8 gap-1.5"
          >
            <Users className="h-3.5 w-3.5 text-blue-600" />
            <span>Team ({project.memberCount})</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDeleteProject}
            className="text-xs h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete project"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Project Header Card */}
      <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={project.status}
                  onChange={(e) => handleProjectStatusChange(e.target.value as ProjectStatus)}
                  className="text-xs font-bold px-2.5 py-1 rounded-md border border-slate-300 bg-slate-50 text-slate-800"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <Badge variant="outline" className="text-xs capitalize font-medium">
                  {project.priority} Priority
                </Badge>

                {project.accountName && (
                  <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    <Building className="h-3 w-3" />
                    <span>{project.accountName}</span>
                  </div>
                )}

                {project.opportunityName && (
                  <div className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    <TrendingUp className="h-3 w-3" />
                    <span>{project.opportunityName}</span>
                  </div>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {project.name}
              </h1>

              {project.description && (
                <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              )}
            </div>

            {/* Quick Metrics Badge */}
            <div className="shrink-0 bg-slate-50 border border-slate-200 p-3 rounded-xl min-w-[200px] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Progress</span>
                <span className="font-bold text-slate-900">{project.progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>{project.completedTasks} of {project.totalTasks} completed</span>
                {project.overdueTasks > 0 && (
                  <span className="text-rose-600 font-bold">{project.overdueTasks} overdue</span>
                )}
              </div>
            </div>
          </div>

          {/* Meta row: dates & owner */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Owner:</span>
              <span className="font-semibold text-slate-700">{project.ownerName}</span>
            </div>
            {project.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Started: {project.startDate.substring(0, 10)}</span>
              </div>
            )}
            {project.targetEndDate && (
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-slate-400" />
                <span>Target: {project.targetEndDate.substring(0, 10)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>{project.memberCount} team members</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-1 sm:space-x-4 pb-px">
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
            <span>Kanban Board</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <List className="h-4 w-4" />
            <span>Task List ({project.totalTasks})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'milestones'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Milestone className="h-4 w-4" />
            <span>Milestones ({milestones.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'comments'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comments ({comments.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'kanban' && (
          <TasksKanbanView
            tasks={tasks}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onUpdateStatus={handleUpdateTaskStatus}
            onAddTask={(defStatus) => {
              setCreateTaskInitialStatus(defStatus);
              setIsCreateTaskOpen(true);
            }}
          />
        )}

        {activeTab === 'list' && (
          <TasksListView
            tasks={tasks}
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
            isLoading={isLoading}
            onRefresh={() => {
              loadTasks();
              loadProjectData();
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

        {activeTab === 'milestones' && (
          <MilestonesListView
            milestones={milestones}
            onToggleStatus={handleToggleMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onAddMilestone={() => setIsCreateMilestoneOpen(true)}
          />
        )}

        {activeTab === 'comments' && (
          <Card className="border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Project Collaboration & Notes</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">
                  No project-level discussions yet.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{c.authorName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()} at{' '}
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-slate-700 whitespace-pre-line">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostProjectComment} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post a message or update on this project..."
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isPostingComment || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1"
              >
                <Send className="h-3.5 w-3.5" />
                Post
              </Button>
            </form>
          </Card>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        defaultProjectId={projectId}
        defaultStatus={createTaskInitialStatus}
        onClose={() => setIsCreateTaskOpen(false)}
        onSuccess={() => {
          loadTasks();
          loadProjectData();
          if (onProjectUpdated) onProjectUpdated();
        }}
      />

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          isOpen={!!selectedTaskId}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            loadTasks();
            loadProjectData();
            if (onProjectUpdated) onProjectUpdated();
          }}
        />
      )}

      {/* Create Milestone Modal */}
      <CreateMilestoneModal
        isOpen={isCreateMilestoneOpen}
        projectId={projectId}
        onClose={() => setIsCreateMilestoneOpen(false)}
        onSuccess={() => {
          apiClient.getProjectMilestones(projectId).then(setMilestones);
        }}
      />

      {/* Project Members Modal */}
      <ProjectMembersModal
        isOpen={isMembersModalOpen}
        projectId={projectId}
        ownerId={project.ownerId}
        onClose={() => setIsMembersModalOpen(false)}
        onMembersUpdated={() => {
          loadProjectData();
        }}
      />
    </div>
  );
}
