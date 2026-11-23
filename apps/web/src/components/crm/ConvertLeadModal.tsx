import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRightLeft,
  Building2,
  User,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import type {
  LeadDto,
  AccountDto,
  ContactDto,
  ConvertLeadInput,
  ConvertLeadResultDto
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';

interface ConvertLeadModalProps {
  lead: LeadDto;
  onClose: () => void;
  onSuccess: (result: ConvertLeadResultDto) => void;
}

export function ConvertLeadModal({ lead, onClose, onSuccess }: ConvertLeadModalProps) {
  const [createAccount, setCreateAccount] = useState(true);
  const [existingAccountId, setExistingAccountId] = useState('');
  const [accountName, setAccountName] = useState(lead.companyName || `${lead.firstName} ${lead.lastName}`);

  const [createContact, setCreateContact] = useState(true);
  const [existingContactId, setExistingContactId] = useState('');
  const [contactFirstName, setContactFirstName] = useState(lead.firstName);
  const [contactLastName, setContactLastName] = useState(lead.lastName || 'Contact');
  const [contactEmail, setContactEmail] = useState(lead.email || '');
  const [contactPhone, setContactPhone] = useState(lead.phone || '');
  const [contactJobTitle, setContactJobTitle] = useState('');

  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [opportunityName, setOpportunityName] = useState(`${lead.companyName || lead.title} - Opportunity`);
  const [opportunityAmount, setOpportunityAmount] = useState(lead.estimatedValue || '');
  const [opportunityExpectedCloseDate, setOpportunityExpectedCloseDate] = useState('');

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Duplicate warning detection
  const [duplicateWarning, setDuplicateWarning] = useState<{
    accounts: AccountDto[];
    contacts: ContactDto[];
  } | null>(null);

  useEffect(() => {
    async function loadOptionsAndDuplicates() {
      setIsLoadingEntities(true);
      try {
        const [accRes, conRes, dupRes] = await Promise.all([
          apiClient.getAccounts({ limit: 100 }),
          apiClient.getContacts({ limit: 100 }),
          apiClient.checkCrmDuplicates({
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            companyName: lead.companyName || undefined
          })
        ]);
        setAccounts(accRes.items);
        setContacts(conRes.items);

        if (dupRes.duplicateAccounts.length > 0 || dupRes.duplicateContacts.length > 0) {
          setDuplicateWarning({
            accounts: dupRes.duplicateAccounts,
            contacts: dupRes.duplicateContacts
          });

          // Pre-select existing account if exact match
          if (dupRes.duplicateAccounts.length > 0) {
            setCreateAccount(false);
            setExistingAccountId(dupRes.duplicateAccounts[0].id);
          }
          // Pre-select existing contact if exact match
          if (dupRes.duplicateContacts.length > 0) {
            setCreateContact(false);
            setExistingContactId(dupRes.duplicateContacts[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversion context', err);
      } finally {
        setIsLoadingEntities(false);
      }
    }

    loadOptionsAndDuplicates();
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: ConvertLeadInput = {
      createAccount,
      existingAccountId: !createAccount ? existingAccountId : undefined,
      accountName: createAccount ? accountName.trim() : undefined,

      createContact,
      existingContactId: !createContact ? existingContactId : undefined,
      contactFirstName: createContact ? contactFirstName.trim() : undefined,
      contactLastName: createContact ? contactLastName.trim() : undefined,
      contactEmail: createContact ? contactEmail.trim() || undefined : undefined,
      contactPhone: createContact ? contactPhone.trim() || undefined : undefined,
      contactJobTitle: createContact ? contactJobTitle.trim() || undefined : undefined,

      createOpportunity,
      opportunityName: createOpportunity ? opportunityName.trim() : undefined,
      opportunityAmount: createOpportunity && opportunityAmount.trim() ? opportunityAmount.trim() : undefined,
      opportunityExpectedCloseDate:
        createOpportunity && opportunityExpectedCloseDate ? new Date(opportunityExpectedCloseDate).toISOString() : undefined
    };

    try {
      const result = await apiClient.convertLead(lead.id, payload);
      onSuccess(result);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lead conversion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <Card className="w-full max-w-2xl border-slate-200 bg-white shadow-xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Convert Qualified Lead
              </CardTitle>
              <p className="text-xs text-slate-500">
                Convert &quot;{lead.title}&quot; into an Account, Contact, and optional Sales Opportunity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-4 text-xs max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {duplicateWarning && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Existing Records Detected</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Potential matching records were found. You can link this lead to existing records to prevent duplicates.
                </p>
                {duplicateWarning.accounts.length > 0 && (
                  <div className="text-[11px]">
                    Matching Account: <strong>{duplicateWarning.accounts[0].name}</strong>
                  </div>
                )}
                {duplicateWarning.contacts.length > 0 && (
                  <div className="text-[11px]">
                    Matching Contact: <strong>{duplicateWarning.contacts[0].firstName} {duplicateWarning.contacts[0].lastName}</strong> ({duplicateWarning.contacts[0].email})
                  </div>
                )}
              </div>
            )}

            {/* 1. Account / Company Section */}
            <div className="rounded-lg border border-slate-200 p-3.5 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Account (Company / Organization)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="accountMode"
                      checked={createAccount}
                      onChange={() => setCreateAccount(true)}
                    />
                    <span>Create New</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="accountMode"
                      checked={!createAccount}
                      onChange={() => setCreateAccount(false)}
                      disabled={accounts.length === 0}
                    />
                    <span>Link Existing</span>
                  </label>
                </div>
              </div>

              {createAccount ? (
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Account Name</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Select Existing Account</label>
                  <select
                    value={existingAccountId}
                    onChange={(e) => setExistingAccountId(e.target.value)}
                    required={!createAccount}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Account --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.industry || 'General'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 2. Contact Person Section */}
            <div className="rounded-lg border border-slate-200 p-3.5 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span>Contact (Key Person)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMode"
                      checked={createContact}
                      onChange={() => setCreateContact(true)}
                    />
                    <span>Create New</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMode"
                      checked={!createContact}
                      onChange={() => setCreateContact(false)}
                      disabled={contacts.length === 0}
                    />
                    <span>Link Existing</span>
                  </label>
                </div>
              </div>

              {createContact ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">First Name</label>
                      <input
                        type="text"
                        required
                        value={contactFirstName}
                        onChange={(e) => setContactFirstName(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Last Name</label>
                      <input
                        type="text"
                        required
                        value={contactLastName}
                        onChange={(e) => setContactLastName(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Phone</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. CTO, Director"
                        value={contactJobTitle}
                        onChange={(e) => setContactJobTitle(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Select Existing Contact</label>
                  <select
                    value={existingContactId}
                    onChange={(e) => setExistingContactId(e.target.value)}
                    required={!createContact}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Contact --</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.email || 'No email'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 3. Sales Opportunity Interface Section */}
            <div className="rounded-lg border border-slate-200 p-3.5 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>Sales Opportunity / Deal</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={createOpportunity}
                    onChange={(e) => setCreateOpportunity(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Create Deal</span>
                </label>
              </div>

              {createOpportunity && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Deal Name</label>
                    <input
                      type="text"
                      required={createOpportunity}
                      value={opportunityName}
                      onChange={(e) => setOpportunityName(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Estimated Value ({lead.currency})</label>
                      <input
                        type="text"
                        placeholder="e.g. 5000.00"
                        value={opportunityAmount}
                        onChange={(e) => setOpportunityAmount(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Expected Close Date</label>
                      <input
                        type="date"
                        value={opportunityExpectedCloseDate}
                        onChange={(e) => setOpportunityExpectedCloseDate(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5 text-[11px] text-slate-500">
              ℹ️ <strong>History Preservation:</strong> All historical activities, notes, and calls logged under this lead will automatically transfer to the converted Contact and Account.
            </div>
          </CardContent>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-3.5 bg-slate-50/70">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isLoadingEntities}
              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Converting Lead...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Confirm & Convert</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
