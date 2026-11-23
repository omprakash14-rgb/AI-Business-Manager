import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CampaignDto,
  MarketingSummaryDto,
  PaginationMeta
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  Megaphone,
  BarChart3,
  ListFilter,
  Plus,
  RefreshCw,
  Users,
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react';
import { MarketingOverview } from './MarketingOverview';
import { CampaignsListView } from './CampaignsListView';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CampaignDetailModal } from './CampaignDetailModal';

type MarketingTab = 'overview' | 'campaigns' | 'attribution';

export function MarketingModuleView() {
  const [activeTab, setActiveTab] = useState<MarketingTab>('overview');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Summary Metrics
  const [summary, setSummary] = useState<MarketingSummaryDto | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Campaigns List State
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);

  // Modals state
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const data = await apiClient.getMarketingSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load marketing summary', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setIsCampaignsLoading(true);
    try {
      const res = await apiClient.getCampaigns({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        channel: channelFilter || undefined,
        type: typeFilter || undefined
      });
      setCampaigns(res.items);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load campaigns list', err);
    } finally {
      setIsCampaignsLoading(false);
    }
  }, [page, search, statusFilter, channelFilter, typeFilter]);

  // Initial load
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleRefresh = async () => {
    await Promise.all([loadSummary(), loadCampaigns()]);
  };

  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
    setActiveTab('campaigns');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-white p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Phase 8 Active — Marketing Management
              </Badge>
              <span className="text-xs text-slate-500 font-medium">Traceable CRM Lead Attribution</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-blue-600" />
              <span>Marketing Campaigns & Channels</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
              Organize campaigns, monitor channel budget allocation, and link CRM leads directly to marketing initiatives.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isSummaryLoading || isCampaignsLoading}
              className="gap-2 bg-white text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSummaryLoading || isCampaignsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateCampaignOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Channel Performance</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Campaign Directory</span>
            {summary && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                {summary.totalCampaigns}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('attribution')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'attribution'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Lead Attribution</span>
            {summary && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700 font-bold">
                {summary.totalAttributedLeads}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <MarketingOverview
          summary={summary}
          isLoading={isSummaryLoading}
          onCreateCampaign={() => setIsCreateCampaignOpen(true)}
          onFilterByStatus={handleFilterByStatus}
        />
      )}

      {activeTab === 'campaigns' && (
        <CampaignsListView
          campaigns={campaigns}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          channelFilter={channelFilter}
          onChannelFilterChange={setChannelFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onSelectCampaign={(id) => setSelectedCampaignId(id)}
          onDeleteCampaign={async (id) => {
            if (window.confirm('Delete this marketing campaign?')) {
              await apiClient.deleteCampaign(id);
              handleRefresh();
            }
          }}
          onCreateCampaign={() => setIsCreateCampaignOpen(true)}
          isLoading={isCampaignsLoading}
        />
      )}

      {activeTab === 'attribution' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span>Traceable Lead Attribution Hub</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and manage CRM lead links to active and completed marketing campaigns
                </p>
              </div>
            </div>
          </div>

          <CampaignsListView
            campaigns={campaigns}
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            channelFilter={channelFilter}
            onChannelFilterChange={setChannelFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onSelectCampaign={(id) => setSelectedCampaignId(id)}
            onDeleteCampaign={async (id) => {
              if (window.confirm('Delete this marketing campaign?')) {
                await apiClient.deleteCampaign(id);
                handleRefresh();
              }
            }}
            onCreateCampaign={() => setIsCreateCampaignOpen(true)}
            isLoading={isCampaignsLoading}
          />
        </div>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        onSuccess={(camp) => {
          setSelectedCampaignId(camp.id);
          handleRefresh();
        }}
      />

      {/* Campaign Detail Modal */}
      <CampaignDetailModal
        campaignId={selectedCampaignId}
        isOpen={!!selectedCampaignId}
        onClose={() => setSelectedCampaignId(null)}
        onCampaignUpdated={handleRefresh}
        onCampaignDeleted={() => {
          setSelectedCampaignId(null);
          handleRefresh();
        }}
      />
    </div>
  );
}
