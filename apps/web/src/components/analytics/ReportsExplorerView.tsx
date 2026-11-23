import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ReportType,
  REPORT_TYPE_LABELS,
  CrossModuleReportDto,
  AnalyticsDateRange,
  ANALYTICS_DATE_RANGE_LABELS,
  AnalyticsFilterQuery
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Calendar,
  Filter
} from 'lucide-react';

interface ReportsExplorerViewProps {
  initialReportType?: ReportType;
}

const REPORT_DESCRIPTIONS: Record<ReportType, string> = {
  executive_summary: 'Comprehensive cross-domain KPI synthesis across CRM, Sales, Finance, Projects, Marketing, and HR.',
  sales_pipeline: 'Granular sales pipeline breakdown with deal values, probability-weighted forecasts, and win rates by stage.',
  financial_cashflow: 'Operational financial summary of verified income, expenses, net operating balance, and unpaid invoice balances.',
  project_delivery: 'Project health, milestone delivery progress, and open task distribution across all active projects.',
  marketing_attribution: 'Campaign expenditure, budget utilization rates, and direct CRM lead attribution performance by channel.',
  workforce_overview: 'Workforce headcount distribution across departments, active presence, and leave approval tracking.'
};

export function ReportsExplorerView({ initialReportType = 'executive_summary' }: ReportsExplorerViewProps) {
  const { currentMembership } = useAuth();
  const [reportType, setReportType] = useState<ReportType>(initialReportType);
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<CrossModuleReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPermissionRestricted, setIsPermissionRestricted] = useState(false);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsPermissionRestricted(false);

    try {
      const query: AnalyticsFilterQuery = { dateRange };
      if (dateRange === 'custom') {
        if (startDate) query.startDate = startDate;
        if (endDate) query.endDate = endDate;
      }

      const res = await apiClient.getReport(reportType, query);
      setData(res);
    } catch (err: any) {
      if (err.status === 403 || err.message?.toLowerCase().includes('forbidden') || err.message?.toLowerCase().includes('permission')) {
        setIsPermissionRestricted(true);
        setError('Restricted: You do not have permission to view this report. Only Workspace Owners and Administrators can access financial and workforce reports.');
      } else {
        setError(err.message || 'Failed to generate cross-module report.');
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [reportType, dateRange, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCsv = () => {
    const query: AnalyticsFilterQuery = { dateRange };
    if (dateRange === 'custom') {
      if (startDate) query.startDate = startDate;
      if (endDate) query.endDate = endDate;
    }
    const exportUrl = apiClient.getReportExportUrl(reportType, query);
    window.open(exportUrl, '_blank');
  };

  const isRoleRestricted =
    (reportType === 'financial_cashflow' || reportType === 'workforce_overview') &&
    (currentMembership?.role === 'member' || currentMembership?.role === 'viewer');

  return (
    <div className="space-y-6">
      {/* Control Bar: Report Selection, Filters, Export */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-base">
                  {REPORT_TYPE_LABELS[reportType]}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {REPORT_DESCRIPTIONS[reportType]}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReport}
                disabled={isLoading}
                className="gap-1.5 text-xs bg-white"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button
                size="sm"
                onClick={handleExportCsv}
                disabled={isLoading || isPermissionRestricted || isRoleRestricted || !data || data.rows.length === 0}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Report Type Pills */}
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-2">
              Select Business Domain Report
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map((type) => {
                const isSelected = reportType === type;
                const requiresAdmin =
                  (type === 'financial_cashflow' || type === 'workforce_overview') &&
                  (currentMembership?.role === 'member' || currentMembership?.role === 'viewer');

                return (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{REPORT_TYPE_LABELS[type]}</span>
                    {requiresAdmin && (
                      <span className="text-[10px] bg-amber-200 text-amber-800 px-1 py-0.2 rounded font-normal">
                        Admin
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Selector Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Time Horizon:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(ANALYTICS_DATE_RANGE_LABELS) as AnalyticsDateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
                    dateRange === range
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ANALYTICS_DATE_RANGE_LABELS[range]}
                </button>
              ))}
            </div>

            {dateRange === 'custom' && (
              <div className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 rounded-md border border-slate-200">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permission Warning if Member accessing Admin Report */}
      {isRoleRestricted && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-950">Restricted Report Access</h4>
            <p>
              The selected report (<strong>{REPORT_TYPE_LABELS[reportType]}</strong>) contains sensitive operational financial or workforce data.
              Your current membership role (<strong>{currentMembership?.role}</strong>) does not have access to these figures. Please select another report or contact your workspace administrator.
            </p>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {error && !isRoleRestricted && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Unable to Load Report</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <Card className="border-slate-200 bg-white p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="text-xs font-medium text-slate-600">
              Aggregating verified records for {REPORT_TYPE_LABELS[reportType]}...
            </span>
          </div>
        </Card>
      )}

      {/* Report Data Table */}
      {!isLoading && data && !isRoleRestricted && (
        <Card className="border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-900">
                {data.title}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {data.rows.length} {data.rows.length === 1 ? 'record' : 'records'}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-500">
              Generated: {new Date(data.generatedAt).toLocaleString()}
            </div>
          </div>

          {data.rows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching records found for the selected time horizon and criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    {data.headers.map((hdr) => (
                      <th
                        key={hdr}
                        className={`py-3 px-3.5 ${
                          hdr.includes('($)') || hdr.includes('(%)') || hdr.includes('Rate') || hdr.includes('Value')
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {hdr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {data.headers.map((hdr) => {
                        const val = row[hdr];
                        return (
                          <td
                            key={hdr}
                            className={`py-2.5 px-3.5 text-slate-700 ${
                              hdr.includes('($)') || hdr.includes('(%)') || hdr.includes('Rate') || hdr.includes('Value')
                                ? 'text-right font-mono'
                                : 'text-left'
                            }`}
                          >
                            {val !== null && val !== undefined ? String(val) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>

                {/* Summary Row if available */}
                {data.summaryRow && (
                  <tfoot>
                    <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-semibold text-slate-900">
                      {data.headers.map((hdr) => {
                        const val = data.summaryRow![hdr];
                        return (
                          <td
                            key={hdr}
                            className={`py-3 px-3.5 ${
                              hdr.includes('($)') || hdr.includes('(%)') || hdr.includes('Rate') || hdr.includes('Value')
                                ? 'text-right font-mono'
                                : 'text-left'
                            }`}
                          >
                            {val !== null && val !== undefined ? String(val) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
