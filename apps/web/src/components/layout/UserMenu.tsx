import { useState } from 'react';
import { User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/avatar';
import { ProfileDialog } from '@/components/layout/ProfileDialog';

export function UserMenu() {
  const { user, currentMembership, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const role = currentMembership?.role || 'Viewer';

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-md p-1 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          title="User Account Menu"
        >
          <Avatar fallback={initials} className="h-7 w-7 text-xs bg-blue-100 text-blue-700 border-blue-200" />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-900 leading-tight">
              {user.fullName}
            </span>
            <span className="text-[10px] text-slate-500 leading-tight capitalize">
              {role}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-slate-400 hidden md:block" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-1.5 w-56 rounded-md border border-slate-200 bg-white p-2 shadow-lg z-30">
              <div className="border-b border-slate-100 pb-2 mb-2 px-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-600 font-semibold uppercase">
                  <Shield className="h-3 w-3" />
                  <span>{role}</span>
                </div>
              </div>

              <div className="space-y-0.5 text-xs text-slate-700">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                >
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>My Profile</span>
                </button>

                <div className="border-t border-slate-100 my-1 pt-1" />

                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProfileDialog
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}
