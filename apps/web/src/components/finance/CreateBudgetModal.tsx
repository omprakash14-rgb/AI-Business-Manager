import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  BudgetPeriod,
  FinancialCategoryDto
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, Target, Calendar, AlertCircle } from 'lucide-react';

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBudgetModal({
  isOpen,
  onClose,
  onSuccess
}: CreateBudgetModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('quarterly');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().substring(0, 10);
  });
  const [budgetAmount, setBudgetAmount] = useState('10000.00');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState<FinancialCategoryDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  async function loadCategories() {
    try {
      const data = await apiClient.getFinancialCategories('expense');
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load expense categories for budget', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a budget title.');
      return;
    }
    const amountNum = parseFloat(budgetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Budget amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.createBudget({
        name: name.trim(),
        categoryId: categoryId || undefined,
        period,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        budgetAmount: amountNum.toFixed(2),
        currency,
        description: description.trim() || undefined
      });

      onSuccess();
      onClose();
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Operational Budget</h3>
              <p className="text-[11px] text-slate-500">Track target spending vs actual expenses</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Budget Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 2026 Marketing & Ad Spend"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Expense Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Categories (General)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Period Cycle</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Target Allocation <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
            <label className="block font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Strategic purpose or cost centers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
