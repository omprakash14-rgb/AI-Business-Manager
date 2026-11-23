import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  UserCheck,
  Calendar,
  Kanban,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { LeadsView } from './LeadsView';
import { ContactsView } from './ContactsView';
import { AccountsView } from './AccountsView';
import { CrmActivitiesView } from './CrmActivitiesView';
import { apiClient } from '@/lib/api-client';

type CrmTab = 'leads' | 'contacts' | 'accounts' | 'activities';

export function CrmModuleView() {
  const [activeTab, setActiveTab] = useState<CrmTab>('leads');
  const [stats, setStats] = useState({
    totalLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    totalContacts: 0,
    totalAccounts: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [leadsRes, contactsRes, accountsRes] = await Promise.all([
          apiClient.getLeads({ limit: 100 }),
          apiClient.getContacts({ limit: 1 }),
          apiClient.getAccounts({ limit: 1 })
        ]);
        const leads = leadsRes.items;
        setStats({
          totalLeads: leadsRes.pagination.totalItems,
          qualifiedLeads: leads.filter((l) => l.status === 'qualified').length,
          convertedLeads: leads.filter((l) => l.status === 'converted').length,
          totalContacts: contactsRes.pagination.totalItems,
          totalAccounts: accountsRes.pagination.totalItems
        });
      } catch (err) {
        console.error('Failed to load CRM stats', err);
      }
    }

    loadStats();
  }, [activeTab]);

  return (
    <div className="space-y-5">
      {/* Welcome Banner & KPI Bar */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Phase 4 Active — CRM Foundation
              </Badge>
              <span className="text-xs text-slate-500 font-medium">Customer Relationship Workspace</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              CRM & Lead Management
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
              Track inbound customer opportunities, manage qualifications, schedule follow-ups, and convert leads into verified Accounts and Contacts.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-2xs text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Leads</span>
              <span className="text-base font-bold text-slate-900">{stats.totalLeads}</span>
            </div>
            <div className="rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-2xs text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Qualified</span>
              <span className="text-base font-bold text-emerald-600">{stats.qualifiedLeads}</span>
            </div>
            <div className="rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-2xs text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Converted</span>
              <span className="text-base font-bold text-teal-700">{stats.convertedLeads}</span>
            </div>
            <div className="rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-2xs text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Accounts</span>
              <span className="text-base font-bold text-blue-600">{stats.totalAccounts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Navigation Tabs */}
      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium w-fit gap-1">
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
            activeTab === 'leads' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Kanban className="h-3.5 w-3.5 text-blue-600" />
          <span>Leads & Pipeline</span>
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
            activeTab === 'contacts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
          <span>Contacts</span>
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
            activeTab === 'accounts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          <span>Accounts & Companies</span>
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
            activeTab === 'activities' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
          <span>Follow-ups & Activities</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'leads' && <LeadsView />}
        {activeTab === 'contacts' && <ContactsView />}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'activities' && <CrmActivitiesView />}
      </div>
    </div>
  );
}
