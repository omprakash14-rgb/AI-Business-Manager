import { useState, useEffect } from 'react';
import {
  SalesForecastSummaryDto,
  OpportunityStage,
  STAGE_DISPLAY_NAMES
} from '@ai-business-manager/shared';
import { formatCurrency } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  Percent,
  Layers,
  Calendar,
  AlertCircle,
  Info
} from 'lucide-react';

export function SalesForecastView() {
  const [forecast, setForecast] = useState<SalesForecastSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForecast();
  }, []);

  async function loadForecast() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getSalesForecast();
      setForecast(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales forecast');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-xs font-medium">Calculating forecast and pipeline summaries...</span>
        </div>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error || 'Unable to load forecast data.'}</span>
      </div>
    );
  }

  const totalOpenValue = parseFloat(forecast.totalPipelineValue);
  const weightedValue = parseFloat(forecast.weightedForecastValue);
  const wonRevenue = parseFloat(forecast.wonRevenue);
  const lostValue = parseFloat(forecast.lostValue);

  return (
    <div className="space-y-6">
      {/* Top Advisory Banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900">
        <Info className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block">Sales Forecasting & Probability Modeling</span>
          <p className="text-indigo-700 leading-relaxed text-[11px]">
            Weighted forecast is calculated as <strong>Σ(Deal Value × Stage Win Probability)</strong> across active pipeline opportunities.
            This metric provides a risk-adjusted forecast estimate and does not represent audited revenue.
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Pipeline</span>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(totalOpenValue, forecast.currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Across {forecast.openDealsCount} open deals
          </div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Weighted Forecast</span>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-700">
            {formatCurrency(weightedValue, forecast.currency)}
          </div>
          <div className="mt-1 text-[11px] text-indigo-600/80">
            Probability-adjusted projection
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Won Revenue</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            {formatCurrency(wonRevenue, forecast.currency)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600/80">
            {forecast.wonDealsCount} closed won deals
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Lost Value</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-700">
            {formatCurrency(lostValue, forecast.currency)}
          </div>
          <div className="mt-1 text-[11px] text-rose-600/80">
            {forecast.lostDealsCount} closed lost deals
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Win Rate</span>
            <Percent className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {forecast.winRatePercent}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Based on {forecast.wonDealsCount + forecast.lostDealsCount} closed deals
          </div>
        </div>
      </div>

      {/* Pipeline Stage Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            Pipeline Distribution by Stage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deal volume, cumulative nominal value, and probabilistic weighted yield across stages
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3 text-center">Deals</th>
                <th className="px-4 py-3 text-right">Nominal Value</th>
                <th className="px-4 py-3 text-right">Avg Prob</th>
                <th className="px-4 py-3 text-right">Weighted Value</th>
                <th className="px-4 py-3 w-40">Pipeline Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {forecast.stageSummaries.map((stg) => {
                const stageVal = parseFloat(stg.totalValue);
                const percentOfPipeline =
                  totalOpenValue > 0 && stg.stage !== 'closed_won' && stg.stage !== 'closed_lost'
                    ? Math.round((stageVal / totalOpenValue) * 100)
                    : 0;

                return (
                  <tr key={stg.stage} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {stg.label}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {stg.dealCount}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(stageVal, forecast.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-600">
                      {stg.averageProbability}%
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-700">
                      {formatCurrency(parseFloat(stg.weightedValue), forecast.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {stg.stage !== 'closed_won' && stg.stage !== 'closed_lost' ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{ width: `${Math.min(100, percentOfPipeline)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium w-8 text-right">
                            {percentOfPipeline}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expected Closing Forecast by Month */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Monthly Closing Projections
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Active open deals grouped by target expected closing date
          </p>
        </div>

        {forecast.monthlyForecast.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No upcoming close dates scheduled on open opportunities.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Target Month</th>
                  <th className="px-4 py-3 text-center">Closing Deals</th>
                  <th className="px-4 py-3 text-right">Unweighted Value</th>
                  <th className="px-4 py-3 text-right">Probabilistic Weighted Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {forecast.monthlyForecast.map((m) => (
                  <tr key={m.month} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 font-mono">
                      {m.month}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {m.dealCount}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(parseFloat(m.unweightedValue), forecast.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-700">
                      {formatCurrency(parseFloat(m.weightedValue), forecast.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
