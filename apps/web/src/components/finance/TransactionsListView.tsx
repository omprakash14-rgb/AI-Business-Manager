import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FinancialTransactionDto,
  TransactionType,
  FinancialCategoryDto,
  PaginationMeta
} from '@ai-business-manager/shared';
import { formatCurrency, formatDateTime } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Receipt,
  CreditCard
} from 'lucide-react';

interface TransactionsListViewProps {
  onAddTransaction: (type: TransactionType) => void;
}

export function TransactionsListView({ onAddTransaction }: TransactionsListViewProps) {
  const [transactions, setTransactions] = useState<FinancialTransactionDto[]>([]);
  const [categories, setCategories] = useState<FinancialCategoryDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const loadData = useCallback(
    async (targetPage = page, targetSearch = search, targetType = typeFilter, targetCat = categoryFilter) => {
      setIsLoading(true);
      try {
        const [txRes, catsRes] = await Promise.all([
          apiClient.getFinancialTransactions({
            page: targetPage,
            limit: 15,
            search: targetSearch || undefined,
            type: targetType || undefined,
            categoryId: targetCat || undefined
          }),
          apiClient.getFinancialCategories()
        ]);
        setTransactions(txRes.items);
        setPagination(txRes.pagination);
        setCategories(catsRes);
      } catch (err: any) {
        console.error('Failed to load transactions', err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, search, typeFilter, categoryFilter]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(id: string, desc: string) {
    if (!window.confirm(`Delete transaction "${desc}"?`)) return;
    try {
      await apiClient.deleteFinancialTransaction(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchFilterBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
              loadData(1, val, typeFilter, categoryFilter);
            }}
            placeholder="Search by description, counterparty, reference..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
              loadData(1, search, e.target.value, categoryFilter);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="income">Income (+)</option>
            <option value="expense">Expense (-)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
              loadData(1, search, typeFilter, e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none max-w-[150px] truncate"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={() => onAddTransaction('income')}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs flex items-center gap-1 h-8"
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            Add Income
          </Button>

          <Button
            size="sm"
            onClick={() => onAddTransaction('expense')}
            className="bg-rose-600 hover:bg-rose-700 text-xs flex items-center gap-1 h-8"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Counterparty / Ref</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No transactions found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Log income from clients or business operational expenses.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const amountNum = parseFloat(tx.amount);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                          </span>
                          <span className="font-semibold text-slate-900">{tx.description}</span>
                        </div>
                        {tx.notes && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5 pl-7">
                            {tx.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200/80 bg-slate-50"
                        >
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: tx.categoryColor || '#94a3b8' }}
                          />
                          {tx.categoryName || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {tx.counterparty && (
                          <div className="font-medium text-slate-800 truncate">{tx.counterparty}</div>
                        )}
                        {tx.reference && (
                          <div className="text-[10px] text-slate-400 truncate">Ref: {tx.reference}</div>
                        )}
                        {tx.accountName && (
                          <div className="text-[10px] text-blue-600 truncate flex items-center gap-1">
                            <Building2 className="h-2.5 w-2.5" />
                            {tx.accountName}
                          </div>
                        )}
                        {!tx.counterparty && !tx.reference && !tx.accountName && (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600 whitespace-nowrap">
                        {tx.paymentMethod.replace('_', ' ')}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(amountNum, tx.currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          title="Delete transaction"
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-slate-100 p-3">
            <PaginationBar
              pagination={pagination}
              onPageChange={(p) => {
                setPage(p);
                loadData(p, search, typeFilter, categoryFilter);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
