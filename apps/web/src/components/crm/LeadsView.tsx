import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  RefreshCw,
  LayoutList,
  Kanban,
  Building2,
  Mail,
  Phone,
  ArrowRightLeft,
  Calendar,
  ExternalLink,
  Tag
} from 'lucide-react';
import type {
  LeadDto,
  LeadStatus,
  PaginationMeta,
  OrganizationMembershipDto,
  UserDto
} from '@ai-business-manager/shared';
import { formatDateTime, formatRelativeTime, formatCurrency } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { CreateLeadModal } from './CreateLeadModal';
import { LeadDetailModal } from './LeadDetailModal';

export function LeadsView() {
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [members, setMembers] = useState<(OrganizationMembershipDto & { user: UserDto })[]>([]);

  const loadLeads = useCallback(async (
    targetPage = page,
    targetSearch = search,
    targetStatus = statusFilter,
    targetSource = sourceFilter
  ) => {
    setIsLoading(true);
    try {
      const res = await apiClient.getLeads({
        page: targetPage,
        limit: viewMode === 'pipeline' ? 100 : 15,
        search: targetSearch || undefined,
        status: targetStatus || undefined,
        source: targetSource || undefined
      });
      setLeads(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, sourceFilter, viewMode]);

  useEffect(() => {
    loadLeads();
    apiClient.getMembers().then(setMembers).catch(() => []);
  }, [loadLeads]);

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'qualified': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'converted': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'unqualified': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'lost': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const PIPELINE_COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
    { status: 'new', label: 'New Inbound', color: 'border-t-blue-500' },
    { status: 'contacted', label: 'Contacted', color: 'border-t-purple-500' },
    { status: 'qualified', label: 'Qualified', color: 'border-t-emerald-500' },
    { status: 'unqualified', label: 'Unqualified', color: 'border-t-slate-400' },
    { status: 'converted', label: 'Converted', color: 'border-t-teal-600' },
    { status: 'lost', label: 'Lost', color: 'border-t-rose-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Lead Pipeline & Inbound Management</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Capture potential customers, manage qualification stages, and convert leads into verified business accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="List View"
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('pipeline')}
                className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  viewMode === 'pipeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Visual Pipeline View"
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Pipeline</span>
              </button>
            </div>

            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Lead</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadLeads()}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Refresh leads"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search & Filter Bar */}
          <SearchFilterBar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
              loadLeads(1, v, statusFilter, sourceFilter);
            }}
            placeholder="Search leads by title, name, company, email..."
            filterValue={statusFilter}
            filterOptions={[
              { label: 'All Statuses', value: '' },
              { label: 'New', value: 'new' },
              { label: 'Contacted', value: 'contacted' },
              { label: 'Qualified', value: 'qualified' },
              { label: 'Unqualified', value: 'unqualified' },
              { label: 'Converted', value: 'converted' },
              { label: 'Lost', value: 'lost' },
            ]}
            onFilterChange={(v) => {
              setStatusFilter(v);
              setPage(1);
              loadLeads(1, search, v, sourceFilter);
            }}
          />

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No leads found matching criteria. Click &quot;New Lead&quot; to register a potential customer.
            </div>
          ) : viewMode === 'list' ? (
            /* 1. List View */
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Lead Subject</th>
                      <th className="py-2.5 px-3">Contact Person</th>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Estimated Value</th>
                      <th className="py-2.5 px-3">Owner</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((l) => (
                      <tr
                        key={l.id}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => setSelectedLeadId(l.id)}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-[200px] truncate" title={l.title}>
                          {l.title}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <div className="font-medium">{l.firstName} {l.lastName}</div>
                          {l.email && <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{l.email}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {l.companyName || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="capitalize text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {l.source.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusBadge(l.status)}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800">
                          {l.estimatedValue ? formatCurrency(l.estimatedValue, l.currency) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {l.assignedToName || 'Unassigned'}
                        </td>
                        <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLeadId(l.id)}
                            className="h-7 text-xs px-2"
                          >
                            <span>View</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && (
                <PaginationBar
                  pagination={pagination}
                  onPageChange={(p) => {
                    setPage(p);
                    loadLeads(p);
                  }}
                />
              )}
            </div>
          ) : (
            /* 2. Visual Pipeline Stages (Kanban Columns) */
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
              {PIPELINE_COLUMNS.map((col) => {
                const columnLeads = leads.filter((l) => l.status === col.status);
                return (
                  <div
                    key={col.status}
                    className={`rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 space-y-2 border-t-4 ${col.color}`}
                  >
                    <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200/60">
                      <span className="font-semibold text-xs text-slate-800">{col.label}</span>
                      <span className="text-[10px] font-mono font-medium rounded-full bg-white border border-slate-200 px-1.5 py-0.2 text-slate-600">
                        {columnLeads.length}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[65vh] overflow-y-auto">
                      {columnLeads.length === 0 ? (
                        <div className="py-6 text-center text-[11px] text-slate-400">Empty</div>
                      ) : (
                        columnLeads.map((l) => (
                          <div
                            key={l.id}
                            onClick={() => setSelectedLeadId(l.id)}
                            className="rounded-md border border-slate-200 bg-white p-2.5 space-y-1.5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer text-xs"
                          >
                            <div className="font-semibold text-slate-900 line-clamp-1" title={l.title}>
                              {l.title}
                            </div>
                            <div className="text-[11px] text-slate-600 truncate">
                              {l.companyName ? `${l.companyName} (${l.firstName})` : `${l.firstName} ${l.lastName}`}
                            </div>
                            {l.estimatedValue && (
                              <div className="text-[11px] font-mono font-semibold text-emerald-700">
                                {formatCurrency(l.estimatedValue, l.currency)}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                              <span className="capitalize">{l.source.replace('_', ' ')}</span>
                              <span>{formatRelativeTime(l.createdAt)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <CreateLeadModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadLeads();
          }}
          members={members}
        />
      )}

      {/* Lead Detail Modal */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onLeadUpdated={() => loadLeads()}
        />
      )}
    </div>
  );
}
