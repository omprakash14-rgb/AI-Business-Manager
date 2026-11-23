import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  MarketingSummaryDto,
  CAMPAIGN_STATUS_LABELS,
  CampaignStatus
} from '@ai-business-manager/shared';
import {
  Megaphone,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Clock,
  Layers,
  Share2,
  Mail,
  Search,
  Globe,
  Award
} from 'lucide-react';

interface MarketingOverviewProps {
  summary: MarketingSummaryDto | null;
  isLoading: boolean;
  onCreateCampaign: () => void;
  onFilterByStatus?: (status: string) => void;
}

export function MarketingOverview({
  summary,
  isLoading,
  onCreateCampaign,
  onFilterByStatus
}: MarketingOverviewProps) {
  if (isLoading || !summary) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs">
        <Clock className="h-6 w-6 mx-auto animate-spin text-blue-500 mb-2" />
        <span>Loading marketing performance metrics...</span>
      </div>
    );
  }

  const totalBudgetNum = Number(summary.totalBudget || 0);
  const totalCostNum = Number(summary.totalActualCost || 0);
  const totalRemainingNum = Number(summary.totalRemainingBudget || 0);
  const avgUtilization = summary.averageBudgetUtilizationPercent || 0;

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'social_media': return <Share2 className="h-4 w-4 text-sky-500" />;
      case 'email': return <Mail className="h-4 w-4 text-indigo-500" />;
      case 'search': return <Search className="h-4 w-4 text-emerald-500" />;
      case 'paid_advertising': return <DollarSign className="h-4 w-4 text-amber-500" />;
      case 'website': return <Globe className="h-4 w-4 text-blue-500" />;
      case 'referral': return <Award className="h-4 w-4 text-purple-500" />;
      case 'events': return <Users className="h-4 w-4 text-rose-500" />;
      default: return <Layers className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Campaigns */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Campaigns</span>
              <Megaphone className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {summary.totalCampaigns}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">{summary.activeCampaigns} active</span>
              <span>•</span>
              <span>{summary.completedCampaigns} completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Budget */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Allocated Budget</span>
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${totalBudgetNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.currency} portfolio allocation
            </div>
          </CardContent>
        </Card>

        {/* Total Spent / Utilization */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Actual Cost / Spent</span>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${totalCostNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className={avgUtilization > 100 ? 'text-red-600 font-semibold' : 'text-slate-600 font-medium'}>
                {avgUtilization}% utilized
              </span>
              <span>•</span>
              <span className={totalRemainingNum < 0 ? 'text-red-500' : 'text-emerald-600 font-medium'}>
                ${Math.abs(totalRemainingNum).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                {totalRemainingNum < 0 ? 'over' : 'left'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Attributed Leads & Conversion */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Attributed CRM Leads</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {summary.totalAttributedLeads}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-600 font-semibold">
                {summary.totalConvertedLeads} converted
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                {summary.overallConversionRatePercent}% rate
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Status Distribution Pills */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-slate-900">Campaign Lifecycle Breakdown</div>
          <div className="text-[11px] text-slate-500">Status counts across marketing initiatives</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(['draft', 'planned', 'active', 'completed', 'cancelled'] as CampaignStatus[]).map((st) => {
            const count = summary.campaignsByStatus[st] || 0;
            return (
              <div
                key={st}
                onClick={() => onFilterByStatus && onFilterByStatus(st)}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors cursor-pointer text-center"
              >
                <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
                  {CAMPAIGN_STATUS_LABELS[st]}
                </div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel Performance Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span>Channel Performance & Attribution Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated spend, lead acquisition, and conversion velocity by marketing channel
            </p>
          </div>
          <Button
            onClick={onCreateCampaign}
            size="sm"
            className="bg-blue-600 text-white text-xs gap-1.5"
          >
            <Megaphone className="h-3.5 w-3.5" />
            <span>Launch Campaign</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Marketing Channel</th>
                <th className="py-2.5 px-4 font-semibold text-center">Campaigns</th>
                <th className="py-2.5 px-4 font-semibold text-right">Total Budget</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actual Cost</th>
                <th className="py-2.5 px-4 font-semibold text-center">Attributed Leads</th>
                <th className="py-2.5 px-4 font-semibold text-center">Converted</th>
                <th className="py-2.5 px-4 font-semibold text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.channelPerformance.map((ch) => {
                const bNum = Number(ch.totalBudget || 0);
                const cNum = Number(ch.totalActualCost || 0);

                return (
                  <tr key={ch.channel} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                      {getChannelIcon(ch.channel)}
                      <span>{ch.channelLabel}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">
                      {ch.campaignCount}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      ${bNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      ${cNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-purple-700">
                      {ch.totalLeads}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-700">
                      {ch.convertedLeads}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-slate-900">
                          {ch.conversionRatePercent}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(ch.conversionRatePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architectural Attribution Principles Note */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex items-start gap-3 text-xs text-blue-900">
        <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900">Traceable Attribution Guarantee</h4>
          <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
            Phase 8 delivers deterministic lead attribution directly linking CRM Leads to originating campaigns.
            No speculative multi-touch attribution or invasive third-party ad tracking pixels are used,
            ensuring strict tenant data sovereignty, privacy compliance, and clean pipeline accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
