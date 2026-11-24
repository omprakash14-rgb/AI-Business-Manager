import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, User, Mail, Shield, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { user, currentMembership, activeOrganization, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    const res = await updateProfile({ fullName });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } else {
      setErrorMsg(res.error || 'Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">User Profile</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Manage your personal identity and account settings.
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="space-y-4 pt-4 text-xs">
            {successMsg && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-800 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Profile updated successfully</span>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-medium text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">Email cannot be changed directly in this phase.</span>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Active Workspace</span>
                <span className="font-semibold text-slate-800">{activeOrganization?.name || 'None'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Role in Active Org</span>
                <Badge variant="default" className="text-[10px] uppercase capitalize">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>{currentMembership?.role || 'Viewer'}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Account Created</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
