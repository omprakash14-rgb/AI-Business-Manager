import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  X,
  AlertTriangle,
  Users,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Loader2
} from 'lucide-react';
import type {
  CreateLeadInput,
  LeadSource,
  LeadStatus,
  DuplicateCheckResultDto,
  OrganizationMembershipDto,
  UserDto
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';

interface CreateLeadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  members: (OrganizationMembershipDto & { user: UserDto })[];
}

export function CreateLeadModal({ onClose, onSuccess, members }: CreateLeadModalProps) {
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [source, setSource] = useState<LeadSource>('website');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [assignedToId, setAssignedToId] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Duplicate check state
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResultDto | null>(null);

  const checkDuplicates = async () => {
    if (!email && !phone && !companyName) return;
    setIsCheckingDuplicates(true);
    try {
      const res = await apiClient.checkCrmDuplicates({
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        companyName: companyName.trim() || undefined
      });
      if (res.hasPotentialDuplicates) {
        setDuplicateResult(res);
      } else {
        setDuplicateResult(null);
      }
    } catch {
      // Ignore duplicate check errors
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !firstName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: CreateLeadInput = {
      title: title.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim() || '',
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      companyName: companyName.trim() || undefined,
      source,
      status,
      assignedToId: assignedToId ? assignedToId : null,
      estimatedValue: estimatedValue.trim() || undefined,
      currency: currency || 'USD',
      notes: notes.trim() || undefined
    };

    try {
      await apiClient.createLead(payload);
      onSuccess();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <Card className="w-full max-w-xl border-slate-200 bg-white shadow-xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Create New Inbound Lead</span>
          </CardTitle>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4 text-xs max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            {/* Duplicate detection banner */}
            {duplicateResult && duplicateResult.hasPotentialDuplicates && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Potential Duplicate Records Found</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Matches were detected for this email, phone, or company:
                </p>
                {duplicateResult.duplicateLeads.length > 0 && (
                  <div className="text-[11px]">
                    • Existing Lead: <strong>{duplicateResult.duplicateLeads[0].title}</strong> ({duplicateResult.duplicateLeads[0].status})
                  </div>
                )}
                {duplicateResult.duplicateAccounts.length > 0 && (
                  <div className="text-[11px]">
                    • Existing Account: <strong>{duplicateResult.duplicateAccounts[0].name}</strong>
                  </div>
                )}
                {duplicateResult.duplicateContacts.length > 0 && (
                  <div className="text-[11px]">
                    • Existing Contact: <strong>{duplicateResult.duplicateContacts[0].firstName} {duplicateResult.duplicateContacts[0].lastName}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Lead Title / Subject *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp — Cloud Platform Migration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Connor"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="sarah@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={checkDuplicates}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={checkDuplicates}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Innovations Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onBlur={checkDuplicates}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Lead Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="website">Website Inbound</option>
                  <option value="referral">Customer Referral</option>
                  <option value="cold_outreach">Cold Outreach</option>
                  <option value="event">Conference / Event</option>
                  <option value="partner">Partner Channel</option>
                  <option value="inbound">Direct Phone / Email</option>
                  <option value="advertisement">Paid Ads</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Initial Pipeline Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="new">New (Uncontacted)</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="unqualified">Unqualified</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Assigned Team Member</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="">-- Unassigned --</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.fullName || m.userId} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="font-medium text-slate-700">Estimated Deal Value</label>
                <input
                  type="text"
                  placeholder="e.g. 12500.00"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Notes & Background</label>
              <textarea
                rows={3}
                placeholder="Key requirements, budget hints, timeline..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
          </CardContent>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-3.5 bg-slate-50/70">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim() || !firstName.trim()}
              className="gap-1.5 bg-blue-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Lead...</span>
                </>
              ) : (
                <span>Create Lead</span>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
