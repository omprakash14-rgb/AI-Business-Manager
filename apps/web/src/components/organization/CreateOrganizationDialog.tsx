import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Building2, Loader2, AlertCircle } from 'lucide-react';

interface CreateOrganizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrganizationDialog({ isOpen, onClose }: CreateOrganizationDialogProps) {
  const { createOrganization } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug suggestion if not manually customized
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await createOrganization(name, slug.trim() || undefined);
    setIsSubmitting(false);

    if (res.success) {
      setName('');
      setSlug('');
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create organization');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Create Organization</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Initialize a new isolated multi-tenant business workspace.
              </CardDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4 text-xs">
            {errorMsg && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Organization Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Innovations Corp"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700">Workspace Slug</label>
                <span className="text-[10px] text-slate-400">URL-safe identifier</span>
              </div>
              <input
                type="text"
                placeholder="e.g. acme-innovations"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-md bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
              <strong>Owner Assignment:</strong> You will automatically be granted the <strong>Owner</strong> role
              with full authority to invite team members and configure module settings.
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !name.trim()} className="gap-2">
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Create Workspace</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
