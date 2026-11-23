import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ProjectDto,
  ProjectStatus,
  ProjectPriority,
  ProjectSummaryDto,
  PROJECT_STATUS_LABELS,
  PaginationMeta
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Users,
  Building,
  TrendingUp,
  Target,
  ArrowRight,
  Calendar
} from 'lucide-react';

interface ProjectsOverviewProps {
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  summary: ProjectSummaryDto | null;
  onRefreshSummary: () => void;
}

export function ProjectsOverview({
  onSelectProject,
  onCreateProject,
  summary,
  onRefreshSummary
}: ProjectsOverviewProps) {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getProjects({
        page,
        limit: 12,
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      });
      setProjects(res.items);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load projects', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="text-[10px]">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
      case 'on_hold':
        return <Badge variant="warning" className="text-[10px]">On Hold</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-[10px]">Cancelled</Badge>;
      case 'planning':
      default:
        return <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700">Planning</Badge>;
    }
  };

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-slate-200 bg-white shadow-xs p-3">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">Total Projects</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {summary?.totalProjects ?? '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Portfolios tracked</div>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs p-3">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">Active Projects</div>
          <div className="text-xl font-bold text-blue-600 mt-1">
            {summary?.activeProjects ?? '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">In active delivery</div>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs p-3">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">Completed</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {summary?.completedProjects ?? '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Successfully delivered</div>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs p-3">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">Total Tasks</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {summary?.totalTasks ?? '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {summary?.inProgressTasks ?? '0'} in progress
          </div>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs p-3">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">Overdue Tasks</div>
          <div
            className={`text-xl font-bold mt-1 ${
              summary && summary.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {summary?.overdueTasks ?? '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Requiring attention</div>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs p-3">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">Delivery Rate</div>
          <div className="text-xl font-bold text-purple-600 mt-1">
            {summary?.overallCompletionRate ?? '0'}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Aggregate completion</div>
        </Card>
      </div>

      {/* Toolbar: Search, Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadProjects();
              onRefreshSummary();
            }}
            disabled={isLoading}
            className="text-xs h-8 gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={onCreateProject}
            className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading && projects.length === 0 ? (
        <Card className="border-slate-200 bg-white p-12 text-center text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-xs">Loading projects...</p>
        </Card>
      ) : projects.length === 0 ? (
        <Card className="border-slate-200 bg-white p-12 text-center text-slate-400">
          <FolderKanban className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <h4 className="font-semibold text-slate-700 text-sm">No projects found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Initialize your first project workspace to organize tasks, assign teammates, and track milestones.
          </p>
          <Button
            size="sm"
            onClick={onCreateProject}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            const isTargetOverdue =
              p.status !== 'completed' &&
              p.status !== 'cancelled' &&
              Boolean(p.targetEndDate && new Date(p.targetEndDate) < now);

            return (
              <Card
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="border-slate-200 bg-white shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getStatusBadge(p.status)}
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {p.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {p.name}
                      </CardTitle>
                    </div>
                  </div>

                  {/* CRM or Deal Link */}
                  {(p.accountName || p.opportunityName) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                      {p.accountName && (
                        <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium truncate max-w-[150px]">
                          <Building className="h-2.5 w-2.5" />
                          {p.accountName}
                        </span>
                      )}
                      {p.opportunityName && (
                        <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-medium truncate max-w-[150px]">
                          <TrendingUp className="h-2.5 w-2.5" />
                          {p.opportunityName}
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-3 pb-4 space-y-3">
                  {p.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  {/* Progress Bar & Tasks */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Progress</span>
                      <span className="font-bold text-slate-800">{p.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          p.progressPercentage === 100
                            ? 'bg-emerald-500'
                            : p.progressPercentage > 50
                            ? 'bg-blue-600'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${p.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks breakdown count */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-md text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tasks</span>
                      <span className="font-semibold text-slate-800">
                        {p.completedTasks} / {p.totalTasks} completed
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Overdue</span>
                      <span
                        className={`font-semibold ${
                          p.overdueTasks > 0 ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {p.overdueTasks} {p.overdueTasks === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </div>

                  {/* Footer metadata: Owner, Members, Target Date */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      <span>{p.memberCount} members</span>
                    </div>

                    {p.targetEndDate && (
                      <div
                        className={`flex items-center gap-1 ${
                          isTargetOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>Due {p.targetEndDate.substring(0, 10)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} projects)
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={pagination.page <= 1 || isLoading}
              className="h-7 text-xs px-2.5"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="h-7 text-xs px-2.5"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
