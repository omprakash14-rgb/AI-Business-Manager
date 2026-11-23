import { z } from 'zod';

// ==========================================
// 1. Date Ranges & Filtering Schemas
// ==========================================

export const AnalyticsDateRangeSchema = z.enum([
  'all',
  'today',
  'this_week',
  'this_month',
  'this_quarter',
  'this_year',
  'custom'
]);
export type AnalyticsDateRange = z.infer<typeof AnalyticsDateRangeSchema>;

export const ANALYTICS_DATE_RANGE_LABELS: Record<AnalyticsDateRange, string> = {
  all: 'All Time',
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  this_quarter: 'This Quarter',
  this_year: 'This Year (YTD)',
  custom: 'Custom Date Range'
};

export const AnalyticsFilterQuerySchema = z.object({
  dateRange: AnalyticsDateRangeSchema.optional().default('all'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  currency: z.string().length(3).optional().default('USD')
});
export type AnalyticsFilterQuery = z.input<typeof AnalyticsFilterQuerySchema>;
export type AnalyticsFilterParsed = z.output<typeof AnalyticsFilterQuerySchema>;

// ==========================================
// 2. KPI Definitions & Metadata
// ==========================================

export interface KpiMetricDto {
  key: string;
  name: string;
  value: number | string;
  formattedValue: string;
  description: string;
  category: 'crm' | 'sales' | 'finance' | 'projects' | 'marketing' | 'hr' | 'executive';
  formula: string;
  sourceModule: string;
  isRestricted: boolean;
  currency?: string;
}

// ==========================================
// 3. Executive Dashboard DTO
// ==========================================

export interface ExecutiveDashboardDto {
  generatedAt: string;
  dateRange: AnalyticsDateRange;
  periodStart: string;
  periodEnd: string;
  currency: string;
  userRole: string;

  kpis: {
    // CRM
    activeLeadsCount: number;
    totalLeadsCount: number;
    convertedLeadsCount: number;
    leadConversionRatePercent: number;

    // Sales Pipeline
    openOpportunitiesCount: number;
    openPipelineValue: string;
    weightedForecastValue: string;
    closedWonValue: string;
    closedWonCount: number;
    winRatePercent: number;

    // Finance (Restricted for regular members)
    totalIncome: string | null;
    totalExpenses: string | null;
    netOperatingBalance: string | null;
    outstandingInvoicesAmount: string | null;
    overdueInvoicesAmount: string | null;
    overdueInvoicesCount: number | null;
    isFinanceRestricted: boolean;

    // Projects Delivery
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasksCount: number;
    taskCompletionRatePercent: number;

    // Marketing Performance
    activeCampaignsCount: number;
    totalMarketingSpend: string;
    totalMarketingBudget: string;
    marketingBudgetUtilizationPercent: number;
    attributedLeadsCount: number;
    marketingConversionRatePercent: number;

    // HR Workforce (Restricted for non-admin members where appropriate)
    totalEmployees: number | null;
    activeEmployees: number | null;
    onLeaveEmployees: number | null;
    todayAttendancePresencePercent: number | null;
    pendingLeaveRequestsCount: number | null;
    isHrRestricted: boolean;
  };

  charts: {
    // Financial Monthly Trend (Restricted if not authorized)
    monthlyCashFlow: Array<{
      month: string;
      income: string;
      expense: string;
      net: string;
    }>;

    // Sales Funnel Breakdown
    salesPipelineFunnel: Array<{
      stage: string;
      stageName: string;
      dealCount: number;
      totalValue: string;
      probability: number;
    }>;

    // Lead Sources
    leadSources: Array<{
      source: string;
      sourceLabel: string;
      leadCount: number;
    }>;

    // Project Task Distribution
    taskStatusDistribution: Array<{
      status: string;
      statusLabel: string;
      taskCount: number;
    }>;

    // Marketing Channels
    marketingChannelPerformance: Array<{
      channel: string;
      channelLabel: string;
      budget: string;
      actualCost: string;
      leadsCount: number;
    }>;

    // Department Distribution
    departmentDistribution: Array<{
      departmentId: string;
      departmentName: string;
      employeeCount: number;
    }>;
  };

  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    actorName: string;
    timestamp: string;
    module: string;
  }>;
}

// ==========================================
// 4. Cross-Module Reports & Exports
// ==========================================

export const ReportTypeSchema = z.enum([
  'executive_summary',
  'sales_pipeline',
  'financial_cashflow',
  'project_delivery',
  'marketing_attribution',
  'workforce_overview'
]);
export type ReportType = z.infer<typeof ReportTypeSchema>;

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  executive_summary: 'Executive Business Performance Summary',
  sales_pipeline: 'Sales Pipeline & Deal Valuation Report',
  financial_cashflow: 'Operational Cash Flow & Invoices Report',
  project_delivery: 'Project Deliverables & Task Velocity Report',
  marketing_attribution: 'Marketing Campaigns & Lead Attribution Report',
  workforce_overview: 'Workforce Directory & Attendance Report'
};

export interface CrossModuleReportDto {
  reportType: ReportType;
  title: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  headers: string[];
  rows: Array<Record<string, string | number>>;
  summaryRow?: Record<string, string | number>;
}
