import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ExecutiveDashboardDto,
  AnalyticsDateRange,
  ANALYTICS_DATE_RANGE_LABELS
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckSquare,
  Megaphone,
  Briefcase,
  Layers,
  Clock,
  Calendar,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  Building,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface ExecutiveDashboardViewProps {
  onNavigateReport?: (reportType: string) => void;
}

export function ExecutiveDashboardView({ onNavigateReport }: ExecutiveDashboardViewProps) {
  const { currentMembership } = useAuth();
  const [data, setData] = useState<ExecutiveDashboardDto | null>(null);
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getExecutiveDashboard({
        dateRange,
        startDate: dateRange === 'custom' ? startDate || undefined : undefined,
        endDate: dateRange === 'custom' ? endDate || undefined : undefined
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to aggregate dashboard analytics');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, startDate, endDate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const kpis = data?.kpis;
  const charts = data?.charts;

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Time Horizon:</span>
          </span>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as AnalyticsDateRange)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(ANALYTICS_DATE_RANGE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {data && (
            <span className="text-[11px] text-slate-400">
              Fresh as of {new Date(data.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5 bg-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && !data ? (
        <div className="py-24 text-center text-slate-500 text-xs">
          <BarChart3 className="h-8 w-8 mx-auto animate-pulse text-blue-500 mb-2" />
          <span>Aggregating cross-module business intelligence...</span>
        </div>
      ) : kpis && charts ? (
        <>
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Pipeline & Deal Forecasting */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Active Sales Pipeline</span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  ${Number(kpis.openPipelineValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="text-blue-600 font-semibold">{kpis.openOpportunitiesCount} open deals</span>
                  <span>•</span>
                  <span>Forecast: ${Number(kpis.weightedForecastValue).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* 2. Won Revenue & Win Rate */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Realized Won Revenue</span>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  ${Number(kpis.closedWonValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-semibold">{kpis.closedWonCount} deals won</span>
                  <span>•</span>
                  <span>Win Rate: <strong>{kpis.winRatePercent}%</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Inbound Leads & Acquisition */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">CRM Inbound Velocity</span>
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {kpis.activeLeadsCount} <span className="text-xs font-normal text-slate-500">Active</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="text-purple-700 font-medium">{kpis.convertedLeadsCount} converted</span>
                  <span>•</span>
                  <span>Conv Rate: <strong>{kpis.leadConversionRatePercent}%</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* 4. Operational Net Balance / Finance */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Net Operating Cashflow</span>
                  <Target className="h-4 w-4 text-indigo-600" />
                </div>
                {kpis.isFinanceRestricted ? (
                  <div className="py-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Restricted to Admins</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Requires Financial Ledger privileges</div>
                  </div>
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${Number(kpis.netOperatingBalance) < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      ${Number(kpis.netOperatingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-medium">In: ${Number(kpis.totalIncome).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-amber-600 font-medium">Out: ${Number(kpis.totalExpenses).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Secondary KPI Bar: Projects, Marketing & HR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Project Delivery Health */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-0.5">Project Delivery Velocity</div>
                <div className="text-lg font-bold text-slate-900">
                  {kpis.taskCompletionRatePercent}% Completion
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {kpis.completedTasks} of {kpis.totalTasks} tasks done ({kpis.overdueTasksCount} overdue)
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckSquare className="h-5 w-5" />
              </div>
            </div>

            {/* Marketing Attribution */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-0.5">Marketing Spend & Attribution</div>
                <div className="text-lg font-bold text-slate-900">
                  ${Number(kpis.totalMarketingSpend).toLocaleString()} Spent
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {kpis.attributedLeadsCount} attributed leads ({kpis.marketingBudgetUtilizationPercent}% budget utilized)
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Megaphone className="h-5 w-5" />
              </div>
            </div>

            {/* Workforce Presence */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-0.5">Active Workforce Operations</div>
                <div className="text-lg font-bold text-slate-900">
                  {kpis.totalEmployees} Team Members
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {kpis.isHrRestricted
                    ? 'Workforce directory operational'
                    : `Today's presence: ${kpis.todayAttendancePresencePercent}% (${kpis.pendingLeaveRequestsCount} pending leaves)`}
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Charts Row 1: Sales Funnel & Monthly Cash Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales Pipeline Funnel Visualization */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>Sales Pipeline Stage Valuation</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Deal distribution across pipeline progression stages
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {charts.salesPipelineFunnel.reduce((acc, s) => acc + s.dealCount, 0)} Total Deals
                </Badge>
              </div>

              <div className="space-y-2 pt-1">
                {charts.salesPipelineFunnel.map((stage) => {
                  const maxVal = Math.max(
                    1,
                    ...charts.salesPipelineFunnel.map((s) => Number(s.totalValue))
                  );
                  const barWidth = Math.min(100, Math.round((Number(stage.totalValue) / maxVal) * 100));

                  return (
                    <div key={stage.stage} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <span>{stage.stageName}</span>
                          <span className="text-slate-400 font-mono">({stage.dealCount} deals)</span>
                        </span>
                        <span className="font-bold text-slate-900">
                          ${Number(stage.totalValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stage.stage === 'closed_won'
                              ? 'bg-emerald-500'
                              : stage.stage === 'closed_lost'
                              ? 'bg-rose-400'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.max(barWidth, stage.dealCount > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Financial Cashflow Trend */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span>Monthly Inflows vs Outflows (Cash Flow)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Realized operational income and expenses
                  </p>
                </div>
                {kpis.isFinanceRestricted && (
                  <Badge variant="destructive" className="text-[10px] gap-1">
                    <Lock className="h-3 w-3" /> Restricted
                  </Badge>
                )}
              </div>

              {kpis.isFinanceRestricted ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Lock className="h-8 w-8 mx-auto text-slate-300 mb-1" />
                  <p>Financial transaction trends require Administrator or Owner permissions</p>
                </div>
              ) : charts.monthlyCashFlow.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No financial ledger entries in the selected time horizon
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {charts.monthlyCashFlow.map((m) => {
                    const inc = Number(m.income);
                    const exp = Number(m.expense);
                    const maxMonthly = Math.max(inc, exp, 1);
                    const incWidth = Math.round((inc / maxMonthly) * 100);
                    const expWidth = Math.round((exp / maxMonthly) * 100);

                    return (
                      <div key={m.month} className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold text-slate-900 text-[11px]">
                          <span>{m.month}</span>
                          <span className={`font-mono ${Number(m.net) < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                            Net: ${Number(m.net).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-12 text-[10px] text-emerald-700 font-medium">Income:</span>
                            <div className="flex-1 bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${incWidth}%` }} />
                            </div>
                            <span className="w-20 text-right text-[10px] font-mono text-slate-700">${inc.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-12 text-[10px] text-rose-700 font-medium">Expense:</span>
                            <div className="flex-1 bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${expWidth}%` }} />
                            </div>
                            <span className="w-20 text-right text-[10px] font-mono text-slate-700">${exp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2: Inbound Sources & Marketing Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Inbound Lead Sources */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-purple-600" />
                <span>Inbound Lead Acquisition Sources</span>
              </h4>
              {charts.leadSources.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No leads recorded</div>
              ) : (
                <div className="space-y-2">
                  {charts.leadSources.map((ls) => (
                    <div key={ls.source} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-700 font-medium">{ls.sourceLabel}</span>
                      <span className="font-bold text-purple-700">{ls.leadCount} lead(s)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task Delivery Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span>Project Task Status Breakdown</span>
              </h4>
              {charts.taskStatusDistribution.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No tasks logged</div>
              ) : (
                <div className="space-y-2">
                  {charts.taskStatusDistribution.map((ts) => (
                    <div key={ts.status} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-700 font-medium">{ts.statusLabel}</span>
                      <span className="font-bold text-slate-900">{ts.taskCount} task(s)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Marketing Channels */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Megaphone className="h-4 w-4 text-purple-600" />
                <span>Marketing Channel Investments</span>
              </h4>
              {charts.marketingChannelPerformance.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No campaigns logged</div>
              ) : (
                <div className="space-y-2">
                  {charts.marketingChannelPerformance.slice(0, 5).map((mc) => (
                    <div key={mc.channel} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <div>
                        <div className="font-medium text-slate-900">{mc.channelLabel}</div>
                        <div className="text-[10px] text-slate-400">${Number(mc.actualCost).toLocaleString()} spent</div>
                      </div>
                      <span className="font-bold text-purple-700">{mc.leadsCount} leads</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Recent Business Activity Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Realized Cross-Module Business Activity</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chronological operational events verified across organization domain boundaries
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {data.recentActivity.length} Recent Events
              </Badge>
            </div>

            {data.recentActivity.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent business activities recorded in this organization
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {data.recentActivity.map((ev) => (
                  <div key={ev.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 shrink-0">
                        {ev.module}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-slate-900">{ev.actorName}</span>
                        <span className="text-slate-600 ml-1.5">{ev.description}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
