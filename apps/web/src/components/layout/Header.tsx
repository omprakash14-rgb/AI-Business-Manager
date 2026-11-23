import { RefreshCw } from 'lucide-react';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { UserMenu } from './UserMenu';
import { NotificationDrawer } from '@/components/shared/NotificationDrawer';
import type { HealthCheckResult } from '@/lib/api-client';

interface HeaderProps {
  title: string;
  health: HealthCheckResult;
  isCheckingHealth: boolean;
  onRefreshHealth: () => void;
}

export function Header({ title, health, isCheckingHealth, onRefreshHealth }: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      {/* Left: Active Title & Workspace Indicator */}
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
          {title}
        </h1>
        <div className="hidden sm:block h-4 w-px bg-slate-200" />
        <div className="hidden sm:block">
          <OrganizationSwitcher />
        </div>
      </div>

      {/* Right: Health Badge, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Backend Connection Status Pill */}
        <div
          className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors ${
            health.isOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
          title={
            health.isOnline
              ? `Connected to Fastify backend (${health.latencyMs}ms)`
              : `Backend offline: ${health.error || 'Connection failed'}`
          }
        >
          <span
            className={`h-2 w-2 rounded-full ${
              health.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="font-medium text-[11px]">
            {health.isOnline ? `API Online (${health.latencyMs}ms)` : 'API Offline'}
          </span>
          <button
            onClick={onRefreshHealth}
            disabled={isCheckingHealth}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-0.5 focus:outline-none cursor-pointer disabled:opacity-50"
            title="Refresh backend status"
          >
            <RefreshCw className={`h-3 w-3 ${isCheckingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Phase 3 In-App Notification Drawer */}
        <NotificationDrawer />

        <div className="h-5 w-px bg-slate-200" />

        {/* User Profile */}
        <UserMenu />
      </div>
    </header>
  );
}
