import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  AccountDto,
  ContactDto,
  DetailedOpportunityDto,
  QuotationDto
} from '@ai-business-manager/shared';
import { formatCurrency } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  X,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  AlertCircle,
  Calculator,
  Calendar,
  Building2
} from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedQuotationId?: string;
}

interface LineItemState {
  description: string;
  quantity: number;
  unitPrice: string;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedQuotationId
}: CreateInvoiceModalProps) {
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [quotations, setQuotations] = useState<QuotationDto[]>([]);

  const [accountId, setAccountId] = useState('');
  const [contactId, setContactId] = useState('');
  const [opportunityId, setOpportunityId] = useState('');
  const [quotationId, setQuotationId] = useState(preselectedQuotationId || '');

  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().substring(0, 10);
  });
  const [currency, setCurrency] = useState('USD');
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<string>('0.00');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment due within 30 days of invoice date. Please remit via wire transfer or credit card.');

  const [items, setItems] = useState<LineItemState[]>([
    { description: 'Professional Services / Deliverables', quantity: 1, unitPrice: '5000.00' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  async function loadDependencies() {
    try {
      const [accRes, contRes, quotesRes] = await Promise.all([
        apiClient.getAccounts({ limit: 100 }),
        apiClient.getContacts({ limit: 100 }),
        apiClient.getQuotations({ limit: 50 })
      ]);
      setAccounts(accRes.items);
      setContacts(contRes.items);
      setQuotations(quotesRes.items);

      if (preselectedQuotationId) {
        handleQuotationSelect(preselectedQuotationId, quotesRes.items);
      }
    } catch (err: any) {
      console.error('Failed to load invoice dependencies', err);
    }
  }

  function handleQuotationSelect(selectedQId: string, quoteList = quotations) {
    setQuotationId(selectedQId);
    const q = quoteList.find((item) => item.id === selectedQId);
    if (q) {
      if (q.accountId) setAccountId(q.accountId);
      if (q.contactId) setContactId(q.contactId);
      if (q.opportunityId) setOpportunityId(q.opportunityId);
      setCurrency(q.currency || 'USD');
      setTaxPercent(q.taxPercent || 0);
      setDiscountAmount(q.discountAmount || '0.00');
      if (q.notes) setNotes(q.notes);
      if (q.terms) setTerms(q.terms);
      if (q.items && q.items.length > 0) {
        setItems(
          q.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice
          }))
        );
      }
    }
  }

  function handleAddItem() {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: '0.00' }]);
  }

  function handleRemoveItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: keyof LineItemState, value: any) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  // Live calculations
  const subtotal = items.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = parseFloat(item.unitPrice || '0');
    return sum + qty * price;
  }, 0);

  const discountNum = parseFloat(discountAmount || '0') || 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountNum);
  const taxAmount = (subtotalAfterDiscount * (taxPercent || 0)) / 100;
  const grandTotal = subtotalAfterDiscount + taxAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) {
      setError('Please select a customer account for this invoice.');
      return;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].description.trim()) {
        setError(`Line item #${i + 1} requires a description.`);
        return;
      }
      if (items[i].quantity <= 0) {
        setError(`Line item #${i + 1} quantity must be greater than zero.`);
        return;
      }
      const price = parseFloat(items[i].unitPrice);
      if (isNaN(price) || price < 0) {
        setError(`Line item #${i + 1} unit price must be a valid positive number.`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.createInvoice({
        accountId,
        contactId: contactId || undefined,
        opportunityId: opportunityId || undefined,
        quotationId: quotationId || undefined,
        issueDate: new Date(issueDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        currency,
        taxPercent,
        discountAmount: discountNum.toFixed(2),
        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: it.quantity,
          unitPrice: parseFloat(it.unitPrice).toFixed(2)
        }))
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Create Operational Invoice</h3>
              <p className="text-xs text-slate-500">Issue commercial bill to client with line items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quotation Conversion Helper */}
          {quotations.length > 0 && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-blue-900">Convert from Approved Quotation (Lead-to-Cash)</span>
                <p className="text-[11px] text-blue-700">Auto-fill customer and line items from a sales proposal</p>
              </div>
              <select
                value={quotationId}
                onChange={(e) => handleQuotationSelect(e.target.value)}
                className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs text-blue-900 font-medium focus:outline-none"
              >
                <option value="">Select Quotation...</option>
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} — {q.title} ({formatCurrency(parseFloat(q.totalAmount), q.currency)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer & Target Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Customer Account <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Account...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Billing Contact (Optional)</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">None</option>
                {contacts.map((cont) => (
                  <option key={cont.id} value={cont.id}>
                    {cont.firstName} {cont.lastName} {cont.email ? `(${cont.email})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Invoice Issue Date</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-blue-600" />
                Invoice Line Items
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-7 text-xs flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 w-24 text-center">Qty</th>
                    <th className="px-3 py-2 w-32 text-right">Unit Price</th>
                    <th className="px-3 py-2 w-32 text-right">Total</th>
                    <th className="px-2 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const lineTotal = (item.quantity || 0) * (parseFloat(item.unitPrice || '0') || 0);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            placeholder="Deliverable or product description..."
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full rounded border border-slate-200 px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            required
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full text-center rounded border border-slate-200 px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-full text-right rounded border border-slate-200 px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-slate-800">
                          {formatCurrency(lineTotal, currency)}
                        </td>
                        <td className="p-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end pt-1">
            <div className="w-72 space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal, currency)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Discount ({currency}):</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-24 text-right rounded border border-slate-200 bg-white px-2 py-1 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Tax (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-20 text-right rounded border border-slate-200 bg-white px-2 py-1 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Tax Amount:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(taxAmount, currency)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Due:</span>
                <span className="text-blue-700">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Invoice Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Client specific notes, purchase order references..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Terms</label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Invoice...' : 'Issue Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
