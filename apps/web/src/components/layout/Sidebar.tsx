import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Receipt,
  KanbanSquare,
  Briefcase,
  Megaphone,
  BarChart3,
  Workflow,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Boxes
} from 'lucide-react';
import type { ModuleId, NavItem } from '@ai-business-manager/shared';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '#', icon: 'LayoutDashboard', plannedPhase: 'Phase 1' },
  { id: 'crm', label: 'CRM & Leads', href: '#', icon: 'Users', isPlaceholder: false, plannedPhase: 'Phase 4' },
  { id: 'sales', label: 'Sales & Deals', href: '#', icon: 'TrendingUp', isPlaceholder: false, plannedPhase: 'Phase 5' },
  { id: 'finance', label: 'Finance & Invoices', href: '#', icon: 'Receipt', isPlaceholder: false, plannedPhase: 'Phase 6' },
  { id: 'projects', label: 'Projects & Tasks', href: '#', icon: 'KanbanSquare', isPlaceholder: false, plannedPhase: 'Phase 7' },
  { id: 'marketing', label: 'Marketing', href: '#', icon: 'Megaphone', isPlaceholder: false, plannedPhase: 'Phase 8' },
  { id: 'hr', label: 'Human Resources', href: '#', icon: 'Briefcase', isPlaceholder: true, plannedPhase: 'Phase 9' },
  { id: 'hr', label: 'Human Resources', href: '#', icon: 'Briefcase', isPlaceholder: false, plannedPhase: 'Phase 9' },
  { id: 'analytics', label: 'Analytics & KPIs', href: '#', icon: 'BarChart3', isPlaceholder: false, plannedPhase: 'Phase 10' },
  { id: 'automation', label: 'Automation', href: '#', icon: 'Workflow', isPlaceholder: true, plannedPhase: 'Phase 11' },
];

function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'LayoutDashboard': return LayoutDashboard;
    case 'Users': return Users;
    case 'TrendingUp': return TrendingUp;
    case 'Receipt': return Receipt;
    case 'KanbanSquare': return KanbanSquare;
    case 'Megaphone': return Megaphone;
    case 'Briefcase': return Briefcase;
    case 'BarChart3': return BarChart3;
    case 'Workflow': return Workflow;
    case 'Sparkles': return Sparkles;
    case 'Settings': return Settings;
    default: return Boxes;
  }
}

export function Sidebar({ currentModule, onSelectModule, collapsed, onToggleCollapse }: SidebarProps) {
  const { currentMembership } = useAuth();

  return (
    <aside
      className={`border-r border-slate-200 bg-slate-900 text-slate-100 flex flex-col justify-between transition-all duration-200 select-none ${collapsed ? 'w-16' : 'w-60'
        }`}
    >
      {/* Top: Logo & Platform Identity */}
      <div>
        <div className="h-14 border-b border-slate-800 flex items-center justify-between px-3.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm font-bold text-sm">
              AI
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-semibold text-xs tracking-tight text-white leading-tight">
                  Business Manager
                </span>
                <span className="text-[10px] text-blue-400 font-medium leading-tight">
                  SME Platform
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="p-2 space-y-1">
          {!collapsed && (
            <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Operations Suite
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = getIconComponent(item.icon);
            const isActive = currentModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer group ${isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                title={collapsed ? `${item.label} (${item.plannedPhase})` : undefined}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.isPlaceholder && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                        }`}>
                        {item.plannedPhase}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Settings & Role Tag */}
      <div className="p-2 border-t border-slate-800 space-y-1">
        <button
          onClick={() => onSelectModule('settings')}
          className={`w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${currentModule === 'settings'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          title={collapsed ? "Settings & Team" : undefined}
        >
          <Settings className="h-4 w-4 shrink-0 text-slate-400" />
          {!collapsed && (
            <div className="flex flex-1 items-center justify-between truncate">
              <span className="truncate">Settings & Team</span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60 uppercase">
                Phase 2
              </span>
            </div>
          )}
        </button>

        {!collapsed && (
          <div className="px-2 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Access Role:</span>
            <span className="capitalize font-semibold text-slate-300">
              {currentMembership?.role || 'Viewer'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
