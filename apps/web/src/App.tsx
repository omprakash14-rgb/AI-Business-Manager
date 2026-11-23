import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { OrganizationSettingsView } from '@/components/organization/OrganizationSettingsView';
import { CrmModuleView } from '@/components/crm/CrmModuleView';
import { SalesModuleView } from '@/components/sales/SalesModuleView';
import { FinanceModuleView } from '@/components/finance/FinanceModuleView';
import { ProjectsModuleView } from '@/components/projects/ProjectsModuleView';
import { MarketingModuleView } from '@/components/marketing/MarketingModuleView';
import { HrModuleView } from '@/components/hr/HrModuleView';
import { AnalyticsModuleView } from '@/components/analytics/AnalyticsModuleView';
import { ModulePlaceholder } from '@/components/dashboard/ModulePlaceholder';
import type { ModuleId } from '@ai-business-manager/shared';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentModule, setCurrentModule] = useState<ModuleId>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
        <span className="text-xs text-slate-400">Verifying security session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <AppShell currentModule={currentModule} onSelectModule={(id) => setCurrentModule(id)}>
      {({ health, refreshHealth, isChecking }) => (
        <>
          {currentModule === 'dashboard' && (
            <DashboardOverview
              health={health}
              onRefreshHealth={refreshHealth}
              isChecking={isChecking}
              onSelectModule={(id) => setCurrentModule(id)}
            />
          )}

          {currentModule === 'settings' && <OrganizationSettingsView />}

          {currentModule === 'crm' && <CrmModuleView />}

          {currentModule === 'sales' && <SalesModuleView />}

          {currentModule === 'finance' && <FinanceModuleView />}

          {currentModule === 'projects' && <ProjectsModuleView />}

          {currentModule === 'marketing' && <MarketingModuleView />}

          {currentModule === 'hr' && <HrModuleView />}

          {currentModule === 'analytics' && <AnalyticsModuleView />}

          {currentModule !== 'dashboard' && currentModule !== 'settings' && currentModule !== 'crm' && currentModule !== 'sales' && currentModule !== 'finance' && currentModule !== 'projects' && currentModule !== 'marketing' && currentModule !== 'hr' && currentModule !== 'analytics' && (
            <ModulePlaceholder
              moduleId={currentModule}
              onReturnToDashboard={() => setCurrentModule('dashboard')}
            />
          )}
        </>
      )}
    </AppShell>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
