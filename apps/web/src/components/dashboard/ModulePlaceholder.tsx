import { Clock, ShieldAlert, ArrowLeft, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ModuleId } from '@ai-business-manager/shared';

interface ModulePlaceholderProps {
  moduleId: ModuleId;
  onReturnToDashboard: () => void;
}

const MODULE_DETAILS: Record<
  ModuleId,
  { name: string; phase: string; description: string; scope: string[] }
> = {
  dashboard: {
    name: 'Executive Dashboard',
    phase: 'Phase 1 / Phase 10',
    description: 'System overview and cross-module business intelligence.',
    scope: ['Platform status', 'KPI reconciliation', 'Role-based summaries']
  },
  crm: {
    name: 'CRM & Lead Management',
    phase: 'Phase 4',
    description: 'Capture inbound leads, qualify stages, track activities, and convert to Accounts and Contacts.',
    scope: ['Leads & Contact Directory', 'Activity History (Calls, Notes)', 'Safe Lead Conversion Workflow', 'Duplicate Detection']
  },
  sales: {
    name: 'Sales Management',
    phase: 'Phase 5',
    description: 'Visual deal pipelines, stage probability weighting, quotation generation, and conversion reports.',
    scope: ['Visual Sales Pipelines', 'Opportunity Stage Progression', 'Quotations & Proposals', 'Win/Loss Analytics']
  },
  finance: {
    name: 'Operational Finance',
    phase: 'Phase 6',
    description: 'Fixed-precision income and expense tracking, invoicing line items, payment status, and budgets.',
    scope: ['Invoices & Payments', 'Income/Expense Categorization', 'Budget vs Actuals', 'Fixed-Precision Decimal Math']
  },
  projects: {
    name: 'Project & Task Management',
    phase: 'Phase 7',
    description: 'Project portfolios, task hierarchies, assignees, milestones, dependencies, and Kanban boards.',
    scope: ['Project Portfolios', 'Task List & Kanban Views', 'Dependency Validation', 'Milestones & Due Dates']
  },
  marketing: {
    name: 'Marketing Management',
    phase: 'Phase 8',
    description: 'Campaign tracking, budget monitoring, channel attribution, and spend-to-revenue reporting.',
    scope: ['Campaign Management', 'Attribution to Leads/Deals', 'Budget vs Spend Tracking']
  },
  hr: {
    name: 'Human Resources (HR)',
    phase: 'Phase 9',
    description: 'Employee directory, departments, designations, attendance logs, and leave approval workflows.',
    scope: ['Employee Directory', 'Leave Requests & Approvals', 'Attendance Tracking', 'Isolated Salary Privacy']
  },
  analytics: {
    name: 'Executive Analytics',
    phase: 'Phase 10',
    description: 'Cross-module analytics, customizable date-range filters, and reconciled business reports.',
    scope: ['Reconciled KPI Formulas', 'Multi-tenant Reporting', 'Export Permissions']
  },
  automation: {
    name: 'Workflow Automation',
    phase: 'Phase 11',
    description: 'Event-Condition-Action (ECA) workflow engine with loop guards and execution audit logs.',
    scope: ['Trigger/Action Catalog', 'Idempotency Protection', 'Execution Logs & Retries']
  },
  settings: {
    name: 'AI Business Assistant & Settings',
    phase: 'Phase 12',
    description: 'Context-grounded natural language Q&A, drafting, and supervised write-action confirmations.',
    scope: ['Permission-Scoped Retrieval', 'Draft Generation', 'Mandatory Human Confirmation for Writes']
  }
};

export function ModulePlaceholder({ moduleId, onReturnToDashboard }: ModulePlaceholderProps) {
  const info = MODULE_DETAILS[moduleId] || {
    name: 'Module Placeholder',
    phase: 'Planned Phase',
    description: 'This module is scheduled for future implementation according to the roadmap.',
    scope: []
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onReturnToDashboard} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <Badge variant="outline" className="text-slate-600 gap-1.5 py-1 px-3">
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          <span>Scheduled for {info.phase}</span>
        </Badge>
      </div>

      <Card className="border-dashed border-slate-300 bg-white">
        <CardHeader className="text-center py-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
            <Layers className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">{info.name}</CardTitle>
          <CardDescription className="max-w-md mx-auto text-sm text-slate-600 mt-2">
            {info.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-lg mx-auto pb-8">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>Phase 1 Scope Notice</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with development principles, business records and functional models for{' '}
              <strong className="text-slate-900">{info.name}</strong> are intentionally deferred to{' '}
              <strong className="text-slate-900">{info.phase}</strong>. No mock data or premature database schemas
              are generated during Phase 1.
            </p>
            {info.scope.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Planned Module Scope:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {info.scope.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
