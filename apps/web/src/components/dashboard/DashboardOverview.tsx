import {
  Server,
  Layers,
  CheckCircle2,
  AlertCircle,
  Code2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { HealthCheckResult } from '@/lib/api-client';
import type { ModuleId } from '@ai-business-manager/shared';

interface DashboardOverviewProps {
  health: HealthCheckResult;
  onRefreshHealth: () => void;
  isChecking: boolean;
  onSelectModule: (id: ModuleId) => void;
}

const ROADMAP_MODULES: {
  id: ModuleId;
  name: string;
  phase: string;
  status: 'active' | 'next' | 'planned';
  description: string;
}[] = [
    { id: 'dashboard', name: 'App Shell & Foundation', phase: 'Phase 1', status: 'active', description: 'Monorepo, Fastify API, React 19 UI, design tokens & health check.' },
    { id: 'settings', name: 'Identity & Access Control', phase: 'Phase 2', status: 'active', description: 'User registration, login, secure sessions, multi-tenancy & RBAC.' },
    { id: 'settings', name: 'Shared Platform Services', phase: 'Phase 3', status: 'active', description: 'Pagination, file storage metadata, notifications, and activity audit.' },
    { id: 'crm', name: 'CRM & Lead Management', phase: 'Phase 4', status: 'active', description: 'Inbound lead capture, activities, and safe conversion to Accounts/Contacts.' },
    { id: 'sales', name: 'Sales Pipelines & Deals', phase: 'Phase 5', status: 'active', description: 'Visual deal stages, probability weighting, and quotation tracking.' },
    { id: 'finance', name: 'Operational Finance', phase: 'Phase 6', status: 'active', description: 'Invoices, payments, expense records, and fixed-precision decimals.' },
    { id: 'projects', name: 'Projects & Tasks', phase: 'Phase 7', status: 'active', description: 'Portfolios, task boards, milestones, and cyclic dependency checks.' },
    { id: 'marketing', name: 'Marketing & Campaigns', phase: 'Phase 8', status: 'active', description: 'Campaign planning, channel budget allocation, and traceable CRM lead attribution.' },
    { id: 'hr', name: 'Human Resources', phase: 'Phase 9', status: 'active', description: 'Employee directory, department & position hierarchy, attendance tracking, and leave request workflows.' },
    { id: 'analytics', name: 'Executive Analytics', phase: 'Phase 10', status: 'active', description: 'Reconciled KPI dashboards, cross-domain reporting, and CSV exports.' },
    { id: 'automation', name: 'Automation & AI Workflows', phase: 'Phase 11', status: 'next', description: 'Event-driven triggers, background jobs, and automated alerts.' },
  ];

export function DashboardOverview({
  health,
  onRefreshHealth,
  isChecking,
  onSelectModule
}: DashboardOverviewProps) {
  const { user, activeOrganization, currentMembership } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Phase 5 Active — Sales Management
                Phase 8 Active — Marketing Management
                Phase 10 Active — Executive Dashboard & Analytics
              </Badge>
              <span className="text-xs text-slate-500 font-medium">Tenant Isolated Workspace</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.fullName || 'User'}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
              {activeOrganization ? (
                <>
                  Currently operating in workspace <strong>{activeOrganization.name}</strong> with role{' '}
                  <span className="capitalize font-semibold text-blue-600">{currentMembership?.role || 'Viewer'}</span>.
                  All operations are scoped to this organization with server-side authorization.
                </>
              ) : (
                <>
                  No active organization assigned. Your account currently has default{' '}
                  <span className="font-semibold text-blue-600">Viewer</span> access. Accept an invitation token or create a workspace to begin collaborating.
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshHealth}
              disabled={isChecking}
              className="gap-2 bg-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Verify Health</span>
            </Button>
            <Button
              size="sm"
              onClick={() => onSelectModule('settings')}
              className="gap-2 bg-blue-600 text-white"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>{activeOrganization ? 'Manage Team' : 'Join or Create Org'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid: Health Check Card & Identity Security Baseline Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Backend Connection Status */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                <span>Backend REST API Status</span>
              </CardTitle>
              <Badge
                variant={health.isOnline ? 'success' : 'destructive'}
                className="gap-1.5"
              >
                {health.isOnline ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>Offline</span>
                  </>
                )}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Live communication with the Fastify backend server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                  Service Name
                </span>
                <span className="font-medium text-slate-800">
                  {health.data?.service || 'ai-business-manager-api'}
                </span>
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                  Environment
                </span>
                <span className="font-medium text-slate-800 capitalize">
                  {health.data?.environment || 'development'}
                </span>
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                  Roundtrip Latency
                </span>
                <span className="font-medium text-slate-800">
                  {health.latencyMs} ms
                </span>
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                  Process Uptime
                </span>
                <span className="font-medium text-slate-800">
                  {health.data?.uptime !== undefined ? `${health.data.uptime}s` : 'N/A'}
                </span>
              </div>
            </div>

            {health.error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <span className="font-semibold block">Connection Error:</span>
                  <span>{health.error}</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Endpoint: <code>/api/health</code></span>
              <span>Last checked: {health.data?.timestamp ? new Date(health.data.timestamp).toLocaleTimeString() : 'Just now'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Identity & Security Baseline */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Phase 2 Identity & Tenant Isolation</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Authentication, organization membership, and server-side RBAC safeguards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-1 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Session Security</span>
                <span className="font-medium text-slate-800">HttpOnly, SameSite=Lax, SHA-256 Token Hash</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Password Security</span>
                <span className="font-medium text-slate-800">Bcrypt Salted Hash (10 rounds)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tenant Scoping</span>
                <span className="font-medium text-slate-800">Verified server-side via session organization context</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Access Control Model</span>
                <span className="font-medium text-slate-800">Role-Based (Owner, Admin, Manager, Member, Viewer) with owner guards</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Database Schema</span>
                <span className="font-medium text-slate-800">PostgreSQL 16+ via Drizzle ORM (6 tables, foreign keys, indexes)</span>
              </div>
            </div>
            <div className="rounded-md bg-emerald-50/70 border border-emerald-100 p-2 text-[11px] text-emerald-900 leading-relaxed">
              <strong>Tenant Isolation:</strong> Client-supplied organization IDs are never trusted. All requests validate active membership server-side.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: Modular Delivery Roadmap */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Modular Delivery Roadmap</span>
            </h3>
            <p className="text-xs text-slate-500">
              Phased development rollout according to the authoritative Implementation Plan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ROADMAP_MODULES.map((mod, idx) => (
            <div
              key={idx}
              onClick={() => onSelectModule(mod.id)}
              className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                  {mod.name}
                </span>
                <Badge
                  variant={
                    mod.status === 'active'
                      ? 'success'
                      : mod.status === 'next'
                        ? 'default'
                        : 'outline'
                  }
                  className="text-[10px] py-0 px-2"
                >
                  {mod.phase}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal line-clamp-2">
                {mod.description}
              </p>
              <div className="mt-2.5 flex items-center gap-1 text-[10px] text-blue-600 font-medium group-hover:underline">
                <span>View module scope</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
