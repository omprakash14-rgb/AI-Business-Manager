import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  PhoneCall,
  CalendarDays,
  MessageSquare,
  CheckCircle2,
  Check,
  RefreshCw,
  Filter
} from 'lucide-react';
import type {
  CrmActivityDto,
  CrmActivityType,
  CrmActivityStatus,
  PaginationMeta
} from '@ai-business-manager/shared';
import { formatDateTime, formatRelativeTime } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';

export function CrmActivitiesView() {
  const [activities, setActivities] = useState<CrmActivityDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadActivities = useCallback(async (
    targetPage = page,
    targetSearch = search,
    targetType = typeFilter,
    targetStatus = statusFilter
  ) => {
    setIsLoading(true);
    try {
      const res = await apiClient.getCrmActivities({
        page: targetPage,
        limit: 15,
        search: targetSearch || undefined,
        type: targetType || undefined,
        status: targetStatus || undefined
      });
      setActivities(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load CRM activities', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleMarkCompleted = async (id: string) => {
    try {
      await apiClient.updateCrmActivity(id, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      loadActivities();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update activity');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>CRM Activities & Follow-up Reminders</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Track scheduled customer follow-ups, logged discovery calls, client meetings, and interaction notes across all accounts and leads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadActivities()}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Refresh activities"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <SearchFilterBar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
              loadActivities(1, v, typeFilter, statusFilter);
            }}
            placeholder="Search activities by subject or notes..."
            filterValue={typeFilter}
            filterOptions={[
              { label: 'All Activity Types', value: '' },
              { label: 'Follow-up Reminders', value: 'follow_up' },
              { label: 'Phone Calls', value: 'call' },
              { label: 'Client Meetings', value: 'meeting' },
              { label: 'General Notes', value: 'note' },
              { label: 'Tasks', value: 'task' },
            ]}
            onFilterChange={(v) => {
              setTypeFilter(v);
              setPage(1);
              loadActivities(1, search, v, statusFilter);
            }}
          />

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No CRM activities or follow-ups found. Open a lead or contact to log interactions.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors gap-3 ${
                    act.status === 'completed'
                      ? 'border-slate-100 bg-slate-50/50 text-slate-500'
                      : 'border-blue-100 bg-blue-50/20 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        act.type === 'call'
                          ? 'bg-purple-100 text-purple-700'
                          : act.type === 'meeting'
                          ? 'bg-emerald-100 text-emerald-700'
                          : act.type === 'follow_up'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {act.type === 'call' ? (
                        <PhoneCall className="h-3.5 w-3.5" />
                      ) : act.type === 'meeting' ? (
                        <CalendarDays className="h-3.5 w-3.5" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{act.subject}</span>
                        <span className="capitalize text-[10px] font-mono font-medium rounded bg-slate-200/60 px-1.5 py-0.2">
                          {act.type.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                            act.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>

                      {act.description && (
                        <p className="text-xs text-slate-600 max-w-xl">{act.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span>Logged by {act.createdByName || 'Team Member'}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(act.createdAt)}</span>
                        {act.leadId && <span>• Associated with Lead</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {act.scheduledAt && (
                      <div className="text-right text-xs">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Scheduled For</span>
                        <span className={act.status === 'completed' ? 'text-slate-500' : 'text-amber-700 font-semibold'}>
                          {formatDateTime(act.scheduledAt)}
                        </span>
                      </div>
                    )}

                    {act.status !== 'completed' ? (
                      <Button
                        size="sm"
                        onClick={() => handleMarkCompleted(act.id)}
                        className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-7"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Complete</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-700 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {pagination && (
                <PaginationBar
                  pagination={pagination}
                  onPageChange={(p) => {
                    setPage(p);
                    loadActivities(p);
                  }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
