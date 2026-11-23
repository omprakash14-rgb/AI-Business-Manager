import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  OpportunityStage,
  STAGE_DEFAULT_PROBABILITIES,
  STAGE_DISPLAY_NAMES,
  AccountDto,
  ContactDto,
  OrganizationMembershipDto,
  UserDto
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStage?: OpportunityStage;
}

export function CreateOpportunityModal({
  isOpen,
  onClose,
  onSuccess,
  initialStage = 'prospecting'
}: CreateOpportunityModalProps) {
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [contactId, setContactId] = useState('');
  const [amount, setAmount] = useState('10000.00');
  const [currency, setCurrency] = useState('USD');
  const [stage, setStage] = useState<OpportunityStage>(initialStage);
  const [probability, setProbability] = useState<number>(STAGE_DEFAULT_PROBABILITIES[initialStage]);
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [notes, setNotes] = useState('');

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [members, setMembers] = useState<(OrganizationMembershipDto & { user: UserDto })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStage(initialStage);
      setProbability(STAGE_DEFAULT_PROBABILITIES[initialStage] ?? 20);
      loadDependencies();
    }
  }, [isOpen, initialStage]);

  async function loadDependencies() {
    try {
      const [accRes, contRes, memRes] = await Promise.all([
        apiClient.getAccounts({ limit: 100 }),
        apiClient.getContacts({ limit: 100 }),
        apiClient.getMembers()
      ]);
      setAccounts(accRes.items);
      setContacts(contRes.items);
      setMembers(memRes);
    } catch (err: any) {
      console.error('Failed to load dependencies', err);
    }
  }

  function handleStageChange(newStage: OpportunityStage) {
    setStage(newStage);
    setProbability(STAGE_DEFAULT_PROBABILITIES[newStage]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a deal / opportunity name.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('Amount must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.createOpportunity({
        name: name.trim(),
        accountId: accountId || undefined,
        contactId: contactId || undefined,
        amount: parsedAmount.toFixed(2),
        currency,
        stage,
        probability,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : undefined,
        assignedToId: assignedToId || undefined,
        notes: notes.trim() || undefined
      });

      onSuccess();
      onClose();
      // Reset
      setName('');
      setAccountId('');
      setContactId('');
      setAmount('10000.00');
      setNotes('');
      setExpectedCloseDate('');
    } catch (err: any) {
      setError(err.message || 'Failed to create opportunity');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Create New Opportunity</h3>
              <p className="text-xs text-slate-500">Track and manage a prospective sales deal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Opportunity / Deal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp Enterprise License"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estimated Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-3 pr-16 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="absolute right-1 top-1 bottom-1 rounded border-none bg-slate-50 text-xs font-semibold text-slate-700 focus:ring-0"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sales Stage</label>
              <select
                value={stage}
                onChange={(e) => handleStageChange(e.target.value as OpportunityStage)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(STAGE_DISPLAY_NAMES).map(([stg, label]) => (
                  <option key={stg} value={stg}>
                    {label} ({STAGE_DEFAULT_PROBABILITIES[stg as OpportunityStage]}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Win Probability (%): {probability}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={probability}
                onChange={(e) => setProbability(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Expected Close Date
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Associated Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None (Standalone)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Associated Contact</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None</option>
                {contacts.map((cont) => (
                  <option key={cont.id} value={cont.id}>
                    {cont.firstName} {cont.lastName} {cont.jobTitle ? `(${cont.jobTitle})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Opportunity Owner</label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.fullName} ({m.user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Description</label>
            <textarea
              rows={3}
              placeholder="Key requirements, client objectives, or next steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Deal...' : 'Create Opportunity'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
