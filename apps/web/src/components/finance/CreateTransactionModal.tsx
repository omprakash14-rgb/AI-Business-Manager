import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  TransactionType,
  PaymentMethod,
  FinancialCategoryDto,
  AccountDto
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, DollarSign, Calendar, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: TransactionType;
}

export function CreateTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'expense'
}: CreateTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  const [categories, setCategories] = useState<FinancialCategoryDto[]>([]);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      loadDependencies(initialType);
    }
  }, [isOpen, initialType]);

  async function loadDependencies(targetType: TransactionType) {
    try {
      const [cats, accs] = await Promise.all([
        apiClient.getFinancialCategories(targetType),
        apiClient.getAccounts({ limit: 100 })
      ]);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
      setAccounts(accs.items);
    } catch (err: any) {
      console.error('Failed to load transaction dependencies', err);
    }
  }

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    loadDependencies(newType);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    if (!categoryId) {
      setError('Please select a financial category.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.createFinancialTransaction({
        type,
        status: 'completed',
        categoryId,
        amount: parsedAmount.toFixed(2),
        currency,
        date: new Date(date).toISOString(),
        description: description.trim(),
        counterparty: counterparty.trim() || undefined,
        reference: reference.trim() || undefined,
        paymentMethod,
        accountId: accountId || undefined,
        notes: notes.trim() || undefined
      });

      onSuccess();
      onClose();
      // Reset fields
      setAmount('');
      setDescription('');
      setCounterparty('');
      setReference('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to record transaction');
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
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {type === 'income' ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Log {type === 'income' ? 'Income' : 'Expense'}
              </h3>
              <p className="text-xs text-slate-500">Record a financial transaction into operational ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-bold transition-all ${
                type === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <ArrowDownLeft className="h-3.5 w-3.5" />
              Income (+)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-bold transition-all ${
                type === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Expense (-)
            </button>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                type === 'income' ? 'e.g. Q4 Consulting Retainer' : 'e.g. Monthly AWS Cloud Hosting'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-3 pr-16 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="absolute right-1 top-1 bottom-1 rounded border-none bg-slate-50 text-[11px] font-semibold text-slate-700 focus:ring-0"
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
              <label className="block font-medium text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Transaction Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="bank_transfer">Bank Transfer / Wire</option>
                <option value="credit_card">Credit Card</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {type === 'income' ? 'Payer / Client' : 'Vendor / Payee'}
              </label>
              <input
                type="text"
                placeholder={type === 'income' ? 'e.g. Acme Corp' : 'e.g. Amazon Web Services'}
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Reference / Receipt #
              </label>
              <input
                type="text"
                placeholder="e.g. RCP-4412, Wire Ref..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Associated CRM Customer Account (Optional)
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="">None</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Additional bookkeeping details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className={type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {isSubmitting
                ? 'Recording...'
                : `Record ${type === 'income' ? 'Income' : 'Expense'}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
