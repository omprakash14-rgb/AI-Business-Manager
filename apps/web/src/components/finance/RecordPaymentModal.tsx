import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  InvoiceDto,
  PaymentMethod
} from '@ai-business-manager/shared';
import { formatCurrency } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, DollarSign, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice: InvoiceDto | null;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  invoice
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && invoice) {
      setAmount(invoice.balanceDue);
      setError(null);
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const balanceDueNum = parseFloat(invoice.balanceDue);
  const totalAmountNum = parseFloat(invoice.totalAmount);
  const paidAmountNum = parseFloat(invoice.paidAmount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    if (parsedAmount > balanceDueNum + 0.001) {
      setError(
        `Overpayment prevented: Entered amount (${parsedAmount.toFixed(2)}) exceeds invoice balance due (${balanceDueNum.toFixed(2)}).`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.recordPayment({
        invoiceId: invoice.id,
        accountId: invoice.accountId,
        amount: parsedAmount.toFixed(2),
        currency: invoice.currency,
        paymentDate: new Date(paymentDate).toISOString(),
        paymentMethod,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Record Invoice Payment</h3>
              <p className="text-[11px] text-slate-500 font-mono">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs mb-4">
          <div className="flex justify-between text-slate-600">
            <span>Customer:</span>
            <span className="font-semibold text-slate-900">{invoice.accountName || '—'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Invoiced:</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(totalAmountNum, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Already Settled:</span>
            <span className="text-emerald-600 font-semibold">
              {formatCurrency(paidAmountNum, invoice.currency)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
            <span>Remaining Balance Due:</span>
            <span className="text-blue-700 font-bold">
              {formatCurrency(balanceDueNum, invoice.currency)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700">
                Payment Amount ({invoice.currency}) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAmount(invoice.balanceDue)}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Pay Full Balance
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              required
              max={balanceDueNum}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="bank_transfer">Bank Transfer / Wire</option>
                <option value="credit_card">Credit Card</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Transaction Ref / Check # (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Wire TX-99214, Check #402..."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Any details concerning payment reconciliation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
