import { useState } from 'react';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CreateOrganizationDialog } from '@/components/organization/CreateOrganizationDialog';

export function OrganizationSwitcher() {
  const { activeOrganization, currentMembership, organizations, switchOrganization } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSelectOrg = async (orgId: string) => {
    if (orgId === activeOrganization?.id) {
      setIsOpen(false);
      return;
    }
    setIsSwitching(true);
    await switchOrganization(orgId);
    setIsSwitching(false);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching}
          className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs hover:bg-slate-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-60"
          title="Switch Active Organization"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-blue-600">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-slate-900 leading-tight truncate max-w-[150px]">
              {activeOrganization ? activeOrganization.name : 'No Organization'}
            </span>
            <span className="text-[10px] text-slate-500 leading-tight capitalize">
              Role: {currentMembership ? currentMembership.role : 'Viewer'}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 mt-1.5 w-60 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg z-30">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Your Organizations ({organizations.length})
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {organizations.map((org) => {
                  const isCurrent = activeOrganization?.id === org.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSelectOrg(org.id)}
                      className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs transition-colors cursor-pointer ${
                        isCurrent ? 'bg-blue-50 text-blue-900 font-medium' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex flex-col text-left truncate mr-2">
                        <span className="truncate">{org.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{org.slug}</span>
                      </div>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-1 border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Organization</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateOrganizationDialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
