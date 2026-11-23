import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DetailedOpportunityDto,
  OpportunityStage,
  PaginationMeta
} from '@ai-business-manager/shared';
import { formatCurrency } from '@ai-business-manager/shared';
import {
  Kanban,
  Table as TableIcon,
  TrendingUp,
  FileText,
  DollarSign,
  Plus,
  RefreshCw,
  Award,
  Sparkles
} from 'lucide-react';
import { OpportunitiesPipelineView } from './OpportunitiesPipelineView';
import { OpportunitiesListView } from './OpportunitiesListView';
import { SalesForecastView } from './SalesForecastView';
import { QuotationsView } from './QuotationsView';
import { CreateOpportunityModal } from './CreateOpportunityModal';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import { CreateQuotationModal } from './CreateQuotationModal';
import { apiClient } from '@/lib/api-client';

type SalesTab = 'pipeline' | 'deals' | 'forecast' | 'quotations';

export function SalesModuleView() {
  const [activeTab, setActiveTab] = useState<SalesTab>('pipeline');
  const [opportunities, setOpportunities] = useState<DetailedOpportunityDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [page, setPage] = useState(1);

  // Top bar quick stats
  const [stats, setStats] = useState({
    activePipeline: '0.00',
    weightedForecast: '0.00',
    wonRevenue: '0.00',
    openDealsCount: 0,
    quotationsCount: 0
  });

  // Modals state
  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);
  const [oppInitialStage, setOppInitialStage] = useState<OpportunityStage>('prospecting');
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false);
  const [quoteTargetOpp, setQuoteTargetOpp] = useState<DetailedOpportunityDto | null>(null);

  const loadOpportunities = useCallback(
    async (targetPage = page, targetSearch = search, targetStage = stageFilter) => {
      setIsLoading(true);
      try {
        const res = await apiClient.getOpportunities({
          page: targetPage,
          limit: activeTab === 'pipeline' ? 100 : 15,
          search: targetSearch || undefined,
          stage: targetStage || undefined
        });
        setOpportunities(res.items);
        setPagination(res.pagination);
      } catch (err: any) {
        console.error('Failed to load opportunities', err);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, page, search, stageFilter]
  );

  const loadStats = useCallback(async () => {
    try {
      const [forecastRes, quotesRes] = await Promise.all([
        apiClient.getSalesForecast(),
        apiClient.getQuotations({ limit: 1 })
      ]);
      setStats({
        activePipeline: forecastRes.totalPipelineValue,
        weightedForecast: forecastRes.weightedForecastValue,
        wonRevenue: forecastRes.wonRevenue,
        openDealsCount: forecastRes.openDealsCount,
        quotationsCount: quotesRes.pagination.totalItems
      });
    } catch (err: any) {
      console.error('Failed to load sales stats', err);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
    loadStats();
  }, [loadOpportunities, loadStats]);

  function handleCreateOppForStage(stage: OpportunityStage) {
    setOppInitialStage(stage);
    setIsCreateOppOpen(true);
  }

  function handleCreateQuoteForOpp(opp: DetailedOpportunityDto) {
    setSelectedOppId(null);
    setQuoteTargetOpp(opp);
    setIsCreateQuoteOpen(true);
  }

  async function handleDeleteOpportunity(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete deal "${name}"?`)) return;
    try {
      await apiClient.deleteOpportunity(id);
      loadOpportunities();
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete deal');
    }
  }

  return (
    <div className="space-y-5">
      {/* Sales Overview Banner */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Phase 5 Active — Sales Management
              </Badge>
              <span className="text-xs text-slate-500 font-medium">Deals, Pipeline & Forecasts</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Sales Pipeline & Opportunities
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
              Track multi-stage sales opportunities, calculate risk-adjusted revenue forecasts, manage stage progression with win/loss audits, and issue commercial proposals.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-2xs text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Open Deals</span>
              <span className="text-base font-bold text-slate-900">{stats.openDealsCount}</span>
            </div>
            <div className="rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-2xs text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Active Pipeline</span>
              <span className="text-base font-bold text-blue-600">
                {formatCurrency(parseFloat(stats.activePipeline), 'USD')}
              </span>
            </div>
            <div className="rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-2xs text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Weighted Fcst</span>
              <span className="text-base font-bold text-indigo-700">
                {formatCurrency(parseFloat(stats.weightedForecast), 'USD')}
              </span>
            </div>
            <div className="rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-2xs text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Won Revenue</span>
              <span className="text-base font-bold text-emerald-600">
                {formatCurrency(parseFloat(stats.wonRevenue), 'USD')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium w-fit gap-1">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Deals Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
              activeTab === 'deals'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>All Deals</span>
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
              activeTab === 'forecast'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Forecasting</span>
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
              activeTab === 'quotations'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Quotations & Proposals</span>
            {stats.quotationsCount > 0 && (
              <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] text-slate-700">
                {stats.quotationsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadOpportunities();
              loadStats();
            }}
            title="Refresh Data"
            className="h-8 px-2.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setOppInitialStage('prospecting');
              setIsCreateOppOpen(true);
            }}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Opportunity</span>
          </Button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'pipeline' && (
        <OpportunitiesPipelineView
          opportunities={opportunities}
          onSelectOpportunity={(opp) => setSelectedOppId(opp.id)}
          onRefresh={() => {
            loadOpportunities();
            loadStats();
          }}
          onCreateOpportunity={handleCreateOppForStage}
        />
      )}

      {activeTab === 'deals' && (
        <OpportunitiesListView
          opportunities={opportunities}
          pagination={pagination}
          isLoading={isLoading}
          search={search}
          stageFilter={stageFilter}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
            loadOpportunities(1, val, stageFilter);
          }}
          onStageFilterChange={(val) => {
            setStageFilter(val);
            setPage(1);
            loadOpportunities(1, search, val);
          }}
          onPageChange={(p) => {
            setPage(p);
            loadOpportunities(p, search, stageFilter);
          }}
          onSelectOpportunity={(opp) => setSelectedOppId(opp.id)}
          onDeleteOpportunity={handleDeleteOpportunity}
          onCreateOpportunity={() => {
            setOppInitialStage('prospecting');
            setIsCreateOppOpen(true);
          }}
        />
      )}

      {activeTab === 'forecast' && <SalesForecastView />}

      {activeTab === 'quotations' && (
        <QuotationsView
          onCreateQuote={() => {
            setQuoteTargetOpp(null);
            setIsCreateQuoteOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <CreateOpportunityModal
        isOpen={isCreateOppOpen}
        initialStage={oppInitialStage}
        onClose={() => setIsCreateOppOpen(false)}
        onSuccess={() => {
          loadOpportunities();
          loadStats();
        }}
      />

      <OpportunityDetailModal
        opportunityId={selectedOppId}
        onClose={() => setSelectedOppId(null)}
        onUpdated={() => {
          loadOpportunities();
          loadStats();
        }}
        onCreateQuote={handleCreateQuoteForOpp}
      />

      <CreateQuotationModal
        isOpen={isCreateQuoteOpen}
        preselectedOpportunity={quoteTargetOpp}
        onClose={() => {
          setIsCreateQuoteOpen(false);
          setQuoteTargetOpp(null);
        }}
        onSuccess={() => {
          loadStats();
          if (activeTab === 'quotations') {
            loadOpportunities();
          }
        }}
      />
    </div>
  );
}
