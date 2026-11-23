import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  DollarSign,
  Users,
  TrendingUp,
  CheckSquare,
  Megaphone,
  Briefcase,
  ShieldCheck,
  Lock,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface KpiDefinition {
  code: string;
  name: string;
  domain: string;
  formula: string;
  sourceEntities: string[];
  dateHorizonField: string;
  roleRestriction: 'All Workspace Members' | 'Owner & Admin Only' | 'All Workspace Members (Aggregates) / Details Restricted';
  description: string;
}

const KPI_DEFINITIONS: KpiDefinition[] = [
  // CRM
  {
    code: 'CRM_INBOUND_LEADS',
    name: 'Total Inbound Leads',
    domain: 'CRM & Lead Management',
    formula: 'COUNT(leads WHERE organizationId = activeOrg AND isDeleted = false)',
    sourceEntities: ['leads'],
    dateHorizonField: 'createdAt (falls within selected date range)',
    roleRestriction: 'All Workspace Members',
    description: 'Volume of business inquiries and leads captured within the selected time horizon.'
  },
  {
    code: 'CRM_CONVERSION_RATE',
    name: 'Lead Conversion Rate',
    domain: 'CRM & Lead Management',
    formula: '(COUNT(converted leads) / COUNT(total leads)) * 100',
    sourceEntities: ['leads'],
    dateHorizonField: 'createdAt',
    roleRestriction: 'All Workspace Members',
    description: 'Percentage of leads successfully converted into customer accounts and sales contacts.'
  },

  // Sales
  {
    code: 'SALES_PIPELINE_VALUE',
    name: 'Open Sales Pipeline Value',
    domain: 'Sales Management',
    formula: 'SUM(dealValue WHERE stage NOT IN (won, lost))',
    sourceEntities: ['opportunities'],
    dateHorizonField: 'createdAt or expectedCloseDate',
    roleRestriction: 'All Workspace Members',
    description: 'Gross monetary value of all currently open and actively negotiated sales opportunities.'
  },
  {
    code: 'SALES_WEIGHTED_FORECAST',
    name: 'Weighted Sales Forecast',
    domain: 'Sales Management',
    formula: 'SUM(dealValue * (probability / 100)) for open opportunities',
    sourceEntities: ['opportunities'],
    dateHorizonField: 'expectedCloseDate (or createdAt)',
    roleRestriction: 'All Workspace Members',
    description: 'Expected probability-adjusted revenue from open deals in the sales funnel.'
  },
  {
    code: 'SALES_WIN_RATE',
    name: 'Sales Win Rate',
    domain: 'Sales Management',
    formula: '(COUNT(won deals) / (COUNT(won deals) + COUNT(lost deals))) * 100',
    sourceEntities: ['opportunities'],
    dateHorizonField: 'createdAt or actualCloseDate',
    roleRestriction: 'All Workspace Members',
    description: 'Proportion of completed sales deals that closed successfully as Won.'
  },

  // Finance
  {
    code: 'FIN_CASH_INFLOW',
    name: 'Operational Cash Inflow',
    domain: 'Operational Finance',
    formula: 'SUM(amount WHERE type = income)',
    sourceEntities: ['financialTransactions'],
    dateHorizonField: 'date (transaction date)',
    roleRestriction: 'Owner & Admin Only',
    description: 'Total verified receipts and revenues received into organization accounts.'
  },
  {
    code: 'FIN_CASH_OUTFLOW',
    name: 'Operational Cash Outflow',
    domain: 'Operational Finance',
    formula: 'SUM(amount WHERE type = expense)',
    sourceEntities: ['financialTransactions'],
    dateHorizonField: 'date (transaction date)',
    roleRestriction: 'Owner & Admin Only',
    description: 'Total verified operating expenses, payroll, and vendor disbursements paid out.'
  },
  {
    code: 'FIN_NET_OPERATING_BALANCE',
    name: 'Net Operating Cash Flow',
    domain: 'Operational Finance',
    formula: 'Operational Cash Inflow - Operational Cash Outflow',
    sourceEntities: ['financialTransactions'],
    dateHorizonField: 'date (transaction date)',
    roleRestriction: 'Owner & Admin Only',
    description: 'Net cash generated or consumed by operations over the selected period.'
  },
  {
    code: 'FIN_OVERDUE_RECEIVABLES',
    name: 'Overdue Receivables',
    domain: 'Operational Finance',
    formula: 'SUM(amountDue - amountPaid WHERE status = overdue OR (status = sent AND dueDate < NOW()))',
    sourceEntities: ['invoices'],
    dateHorizonField: 'dueDate or issueDate',
    roleRestriction: 'Owner & Admin Only',
    description: 'Total past-due customer invoices requiring immediate collection follow-up.'
  },

  // Projects
  {
    code: 'PRJ_ACTIVE_PROJECTS',
    name: 'Active Delivery Projects',
    domain: 'Project Management',
    formula: 'COUNT(projects WHERE status IN (planning, in_progress, on_hold))',
    sourceEntities: ['projects'],
    dateHorizonField: 'createdAt or targetEndDate',
    roleRestriction: 'All Workspace Members',
    description: 'Number of client delivery or internal execution projects currently underway.'
  },
  {
    code: 'PRJ_TASK_COMPLETION_RATE',
    name: 'Task Completion Rate',
    domain: 'Project Management',
    formula: '(COUNT(tasks WHERE status = done) / COUNT(total tasks)) * 100',
    sourceEntities: ['tasks'],
    dateHorizonField: 'createdAt or dueDate',
    roleRestriction: 'All Workspace Members',
    description: 'Proportion of work packages and tasks delivered to completion.'
  },

  // Marketing
  {
    code: 'MKT_BUDGET_UTILIZATION',
    name: 'Campaign Budget Utilization',
    domain: 'Marketing Management',
    formula: '(SUM(actualSpend) / SUM(allocatedBudget)) * 100',
    sourceEntities: ['campaigns'],
    dateHorizonField: 'startDate to endDate (or createdAt)',
    roleRestriction: 'All Workspace Members',
    description: 'Pacing and adherence of marketing disbursements relative to planned allocations.'
  },
  {
    code: 'MKT_ATTRIBUTED_LEADS',
    name: 'Campaign Attributed Leads',
    domain: 'Marketing Management',
    formula: 'COUNT(campaignLeads JOIN leads)',
    sourceEntities: ['campaigns', 'campaignLeads', 'leads'],
    dateHorizonField: 'leads.createdAt',
    roleRestriction: 'All Workspace Members',
    description: 'Verified inbound inquiries directly connected to distinct marketing campaigns.'
  },

  // HR
  {
    code: 'HR_ACTIVE_HEADCOUNT',
    name: 'Active Workforce Headcount',
    domain: 'Human Resources',
    formula: 'COUNT(employees WHERE status = active)',
    sourceEntities: ['employees'],
    dateHorizonField: 'hireDate / Current State',
    roleRestriction: 'All Workspace Members (Aggregates) / Details Restricted',
    description: 'Total active staff and personnel employed in the organization.'
  },
  {
    code: 'HR_ATTENDANCE_RATE',
    name: 'Workforce Attendance Rate',
    domain: 'Human Resources',
    formula: '(COUNT(attendance WHERE status = present) / COUNT(total attendance)) * 100',
    sourceEntities: ['attendanceRecords'],
    dateHorizonField: 'date (attendance date)',
    roleRestriction: 'Owner & Admin Only',
    description: 'Percentage of scheduled work days marked present vs absent/on-leave.'
  }
];

export function KpiDictionaryView() {
  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-base">
              Verified KPI Methodology & Governance
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
            Every metric displayed in the Executive Dashboard and Cross-Domain Reports is computed in real time directly from primary tenant records.
            The system avoids simulated forecasts, external approximations, or duplicate data stores. The table below documents the transparent formula, source tables, and role-based access rules for each indicator.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Multi-tenant database isolation enforced on all queries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>Sensitive financial balances and workforce details restricted to Owner & Admin</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards / Table */}
      <div className="space-y-3">
        {KPI_DEFINITIONS.map((kpi) => (
          <Card key={kpi.code} className="border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-colors">
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-sm text-slate-900">{kpi.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono text-slate-500">
                    {kpi.code}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {kpi.domain}
                  </Badge>
                  {kpi.roleRestriction.includes('Owner') ? (
                    <Badge variant="destructive" className="text-[10px] gap-1 bg-amber-100 text-amber-900 border-amber-300">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Admin Only</span>
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px] gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      <span>Workspace Member</span>
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-normal">
                {kpi.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="rounded-md bg-slate-50 border border-slate-100 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Mathematical Formula
                  </span>
                  <span className="font-mono text-slate-800 text-[11px] block break-words">
                    {kpi.formula}
                  </span>
                </div>

                <div className="rounded-md bg-slate-50 border border-slate-100 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Source Entity Tables
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {kpi.sourceEntities.map((ent) => (
                      <span key={ent} className="font-mono text-[11px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-blue-700">
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-md bg-slate-50 border border-slate-100 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Time Horizon Filtering
                  </span>
                  <span className="text-slate-700 text-[11px] block">
                    {kpi.dateHorizonField}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
