import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CampaignDto,
  PaginationMeta,
  CampaignStatus,
  MarketingChannel,
  CampaignType,
  CAMPAIGN_STATUS_LABELS,
  MARKETING_CHANNEL_LABELS,
  CAMPAIGN_TYPE_LABELS
} from '@ai-business-manager/shared';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Megaphone,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CampaignsListViewProps {
  campaigns: CampaignDto[];
  pagination: PaginationMeta | null;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  channelFilter: string;
  onChannelFilterChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  onSelectCampaign: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
  onCreateCampaign: () => void;
  isLoading: boolean;
}

export function CampaignsListView({
  campaigns,
  pagination,
  page,
  onPageChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  channelFilter,
  onChannelFilterChange,
  typeFilter,
  onTypeFilterChange,
  onSelectCampaign,
  onDeleteCampaign,
  onCreateCampaign,
  isLoading
}: CampaignsListViewProps) {
  const getStatusBadge = (st: CampaignStatus) => {
    switch (st) {
      case 'active':
        return <Badge variant="success" className="text-[10px]">{CAMPAIGN_STATUS_LABELS[st]}</Badge>;
      case 'completed':
        return <Badge variant="default" className="text-[10px] bg-slate-700">{CAMPAIGN_STATUS_LABELS[st]}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-[10px]">{CAMPAIGN_STATUS_LABELS[st]}</Badge>;
      case 'planned':
        return <Badge variant="default" className="text-[10px] bg-blue-600">{CAMPAIGN_STATUS_LABELS[st]}</Badge>;
      case 'draft':
      default:
        return <Badge variant="outline" className="text-[10px]">{CAMPAIGN_STATUS_LABELS[st] || st}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns by name, objective, or notes..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {Object.entries(CAMPAIGN_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {/* Channel */}
            <select
              value={channelFilter}
              onChange={(e) => onChannelFilterChange(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Channels</option>
              {Object.entries(MARKETING_CHANNEL_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {Object.entries(CAMPAIGN_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            <Button
              onClick={onCreateCampaign}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 ml-auto text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Campaign</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Megaphone className="h-6 w-6 mx-auto animate-bounce text-blue-500 mb-2" />
            <span>Loading marketing campaigns...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Megaphone className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-800 text-sm">No campaigns found</div>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              {search || statusFilter || channelFilter || typeFilter
                ? 'Try clearing your filters or search terms.'
                : 'Create your first marketing campaign to track budgets, channels, and attributed leads.'}
            </p>
            {!search && !statusFilter && !channelFilter && !typeFilter && (
              <Button
                onClick={onCreateCampaign}
                size="sm"
                className="mt-4 bg-blue-600 text-white text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Campaign</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3 px-4 font-semibold">Campaign Name & Objective</th>
                  <th className="py-3 px-4 font-semibold">Channel & Type</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Budget & Spend</th>
                  <th className="py-3 px-4 font-semibold text-center">Attributed Leads</th>
                  <th className="py-3 px-4 font-semibold text-center">Dates</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => {
                  const budgetNum = Number(camp.budget || 0);
                  const costNum = Number(camp.actualCost || 0);
                  const utilization = camp.utilizationPercent || 0;

                  return (
                    <tr
                      key={camp.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => onSelectCampaign(camp.id)}
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {camp.name}
                        </div>
                        {camp.objective ? (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {camp.objective}
                          </div>
                        ) : null}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-900 font-medium">
                          {MARKETING_CHANNEL_LABELS[camp.channel]}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {CAMPAIGN_TYPE_LABELS[camp.type]}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(camp.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-slate-900">
                          ${budgetNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ${costNum.toLocaleString('en-US', { minimumFractionDigits: 2 })} spent ({utilization}%)
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="font-semibold text-purple-700">
                          {camp.totalLeads} leads
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {camp.convertedLeads} converted ({camp.conversionRatePercent}%)
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-600 text-[11px]">
                        <div>{camp.startDate ? new Date(camp.startDate).toLocaleDateString() : '—'}</div>
                        <div className="text-slate-400">to {camp.endDate ? new Date(camp.endDate).toLocaleDateString() : '—'}</div>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectCampaign(camp.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteCampaign(camp.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Delete campaign"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page <span className="font-medium text-slate-900">{pagination.page}</span> of{' '}
              <span className="font-medium text-slate-900">{pagination.totalPages}</span> (
              {pagination.totalItems} total campaigns)
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => onPageChange(page - 1)}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => onPageChange(page + 1)}
                className="h-7 px-2 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
