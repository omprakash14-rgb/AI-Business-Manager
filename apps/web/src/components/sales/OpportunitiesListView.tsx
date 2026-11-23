import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DetailedOpportunityDto,
  OpportunityStage,
  STAGE_DISPLAY_NAMES,
  PaginationMeta
} from '@ai-business-manager/shared';
import { formatCurrency, formatDateTime } from '@ai-business-manager/shared';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import {
  DollarSign,
  Building2,
  User,
  Calendar,
  ExternalLink,
  Trash2,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface OpportunitiesListViewProps {
  opportunities: DetailedOpportunityDto[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  search: string;
  stageFilter: string;
  onSearchChange: (search: string) => void;
  onStageFilterChange: (stage: string) => void;
  onPageChange: (page: number) => void;
  onSelectOpportunity: (opp: DetailedOpportunityDto) => void;
  onDeleteOpportunity: (id: string, name: string) => void;
  onCreateOpportunity: () => void;
}

export function OpportunitiesListView({
  opportunities,
  pagination,
  isLoading,
  search,
  stageFilter,
  onSearchChange,
  onStageFilterChange,
  onPageChange,
  onSelectOpportunity,
  onDeleteOpportunity,
  onCreateOpportunity
}: OpportunitiesListViewProps) {
  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchFilterBar
            search={search}
            onSearchChange={onSearchChange}
            placeholder="Search deals by name, account, contact..."
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={stageFilter}
            onChange={(e) => onStageFilterChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Stages</option>
            {Object.entries(STAGE_DISPLAY_NAMES).map(([stg, label]) => (
              <option key={stg} value={stg}>
                {label}
              </option>
            ))}
          </select>

          <Button size="sm" onClick={onCreateOpportunity}>
            + New Opportunity
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Deal Name</th>
                <th className="px-4 py-3">Account / Contact</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-right">Probability</th>
                <th className="px-4 py-3">Expected Close</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span>Loading opportunities...</span>
                    </div>
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <DollarSign className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No opportunities found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {search || stageFilter
                        ? 'Try adjusting your search filters.'
                        : 'Create your first opportunity or convert qualified leads.'}
                    </p>
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => {
                  const amountNum = parseFloat(opp.amount || '0');
                  const isWon = opp.stage === 'closed_won';
                  const isLost = opp.stage === 'closed_lost';

                  return (
                    <tr
                      key={opp.id}
                      onClick={() => onSelectOpportunity(opp)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 hover:text-blue-600">
                          {opp.name}
                        </div>
                        {opp.leadTitle && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            Source: {opp.leadTitle}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {opp.accountName ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <span>{opp.accountName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {opp.contactName && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="h-2.5 w-2.5 text-slate-400" />
                            <span>{opp.contactName}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            isWon ? 'success' : isLost ? 'destructive' : 'secondary'
                          }
                          className="text-[10px] font-semibold"
                        >
                          {STAGE_DISPLAY_NAMES[opp.stage]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatCurrency(amountNum, opp.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-600">
                        {opp.probability}%
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {opp.expectedCloseDate
                          ? new Date(opp.expectedCloseDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {opp.assignedToName || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onSelectOpportunity(opp)}
                            title="View details"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteOpportunity(opp.id, opp.name)}
                            title="Delete opportunity"
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-slate-100 p-3">
            <PaginationBar
              pagination={pagination}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
