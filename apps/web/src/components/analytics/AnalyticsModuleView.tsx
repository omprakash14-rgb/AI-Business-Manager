import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ReportType } from '@ai-business-manager/shared';
import {
  BarChart3,
  FileSpreadsheet,
  BookOpen,
  Layers,
  Sparkles
} from 'lucide-react';
import { ExecutiveDashboardView } from './ExecutiveDashboardView';
import { ReportsExplorerView } from './ReportsExplorerView';
import { KpiDictionaryView } from './KpiDictionaryView';

type AnalyticsTab = 'overview' | 'reports' | 'dictionary';

export function AnalyticsModuleView() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('executive_summary');

  const handleNavigateReport = (reportType: string) => {
    setSelectedReportType(reportType as ReportType);
    setActiveTab('reports');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success" className="text-xs">
                Phase 10 Active — Executive Dashboard & Analytics
              </Badge>
              <span className="text-xs text-slate-500 font-medium">Reconciled Cross-Domain Intelligence</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>Executive Dashboard & Analytics</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-3xl">
              Cross-domain business intelligence reconciling verified records across CRM, Sales, Finance, Projects, Marketing, and Human Resources. Real-time calculations with strict tenant isolation and role-aware confidentiality.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="mt-5 pt-3 border-t border-slate-200/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Cross-Domain Reports & Exports</span>
          </button>

          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'dictionary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>KPI Methodology & Formulas</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'overview' && (
        <ExecutiveDashboardView onNavigateReport={handleNavigateReport} />
      )}

      {activeTab === 'reports' && (
        <ReportsExplorerView
          key={selectedReportType}
          initialReportType={selectedReportType}
        />
      )}

      {activeTab === 'dictionary' && (
        <KpiDictionaryView />
      )}
    </div>
  );
}
