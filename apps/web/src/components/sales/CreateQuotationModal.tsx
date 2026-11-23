import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DetailedOpportunityDto,
  CreateQuotationInput,
  QuotationItemInput
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
  Calculator
} from 'lucide-react';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedOpportunity?: DetailedOpportunityDto | null;
}

interface LineItemState {
  description: string;
  quantity: number;
  unitPrice: string;
}

export function CreateQuotationModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedOpportunity
}: CreateQuotationModalProps) {
  const [opportunities, setOpportunities] = useState<DetailedOpportunityDto[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('');
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [validUntil, setValidUntil] = useState('');
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<string>('0.00');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Standard payment terms: Net 30 days. Proposal valid for 30 days from issuance.');

  const [items, setItems] = useState<LineItemState[]>([
    { description: 'Professional Services / Implementation', quantity: 1, unitPrice: '5000.00' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadOpportunities();
      if (preselectedOpportunity) {
        setSelectedOpportunityId(preselectedOpportunity.id);
        setTitle(`Quotation for ${preselectedOpportunity.name}`);
        setCurrency(preselectedOpportunity.currency || 'USD');
      } else {
        setSelectedOpportunityId('');
        setTitle('');
      }
    }
  }, [isOpen, preselectedOpportunity]);

  async function loadOpportunities() {
    try {
      const res = await apiClient.getOpportunities({ limit: 100 });
      setOpportunities(res.items);
    } catch (err: any) {
      console.error('Failed to load opportunities', err);
    }
  }

  function handleOpportunityChange(oppId: string) {
    setSelectedOpportunityId(oppId);
    const opp = opportunities.find((o) => o.id === oppId);
    if (opp) {
      setTitle(`Proposal: ${opp.name}`);
      setCurrency(opp.currency || 'USD');
    }
  }

  function handleAddItem() {
    setItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unitPrice: '0.00' }
    ]);
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

  // Calculations
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
    if (!selectedOpportunityId) {
      setError('Please select an opportunity for this quotation.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a quotation title.');
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

    const selectedOpp = opportunities.find((o) => o.id === selectedOpportunityId);

    try {
      await apiClient.createQuotation({
        opportunityId: selectedOpportunityId,
        accountId: selectedOpp?.accountId || undefined,
        contactId: selectedOpp?.contactId || undefined,
        title: title.trim(),
        currency,
        taxPercent,
        discountAmount: discountNum.toFixed(2),
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
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
      setError(err.message || 'Failed to create quotation');
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Create Formal Quotation</h3>
              <p className="text-xs text-slate-500">Generate structured commercial proposal with line items</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Deal & General Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Opportunity / Deal <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedOpportunityId}
                onChange={(e) => handleOpportunityChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Opportunity...</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.name} ({formatCurrency(parseFloat(opp.amount), opp.currency)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Quotation Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise License & Onboarding Proposal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Valid Until Date
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-blue-600" />
                Line Items
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
                    <th className="px-3 py-2">Item Description</th>
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
                            placeholder="Description of product or service..."
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
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
                            className="w-full text-center rounded border border-slate-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
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
                            className="w-full text-right rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
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

          {/* Pricing Summary Calculation */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
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
                  className="w-24 text-right rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
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
                  className="w-20 text-right rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Tax Amount:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(taxAmount, currency)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-blue-700">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes to Client</label>
              <textarea
                rows={2}
                placeholder="Additional details, scope highlights..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Terms & Conditions</label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Generating Quotation...' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
