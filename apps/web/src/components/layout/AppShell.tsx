import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { apiClient, type HealthCheckResult } from '@/lib/api-client';
import type { ModuleId } from '@ai-business-manager/shared';

interface AppShellProps {
  currentModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  children: (props: { health: HealthCheckResult; refreshHealth: () => void; isChecking: boolean }) => React.ReactNode;
}

const MODULE_TITLES: Record<ModuleId, string> = {
  dashboard: 'Executive Overview',
  crm: 'CRM & Lead Management',
  sales: 'Sales & Deal Pipeline',
  finance: 'Operational Finance',
  projects: 'Project & Task Management',
  marketing: 'Marketing Campaigns',
  hr: 'Human Resources',
  analytics: 'Business Analytics & Reports',
  automation: 'Workflow Automation',
  settings: 'Workspace Settings'
};

export function AppShell({ currentModule, onSelectModule, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [health, setHealth] = useState<HealthCheckResult>({
    isOnline: false,
    data: null,
    error: null,
    latencyMs: 0
  });
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);

  const checkBackendHealth = async () => {
    setIsCheckingHealth(true);
    const result = await apiClient.checkHealth();
    setHealth(result);
    setIsCheckingHealth(false);
  };

  useEffect(() => {
    checkBackendHealth();
    // Poll health status gently every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={onSelectModule}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <Header
          title={MODULE_TITLES[currentModule] || 'AI Business Manager'}
          health={health}
          isCheckingHealth={isCheckingHealth}
          onRefreshHealth={checkBackendHealth}
        />

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children({ health, refreshHealth: checkBackendHealth, isChecking: isCheckingHealth })}
          </div>
        </main>
      </div>
    </div>
  );
}
