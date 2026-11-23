import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  InvoiceDto,
  InvoiceStatus,
  PaginationMeta
} from '@ai-business-manager/shared';
import { formatCurrency } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import {
  FileText,
  DollarSign,
  Building2,
  Calendar,
  Eye,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  CreditCard
} from 'lucide-react';

interface InvoicesListViewProps {
  onSelectInvoice: (invoice: InvoiceDto) => void;
  onCreateInvoice: () => void;
  onRecordPayment: (invoice: InvoiceDto) => void;
}

export function InvoicesListView({
  onSelectInvoice,
  onCreateInvoice,
  onRecordPayment
}: InvoicesListViewProps) {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadInvoices = useCallback(
    async (targetPage = page, targetSearch = search, targetStatus = statusFilter) => {
      setIsLoading(true);
      try {
        const res = await apiClient.getInvoices({
          page: targetPage,
          limit: 15,
          search: targetSearch || undefined,
          status: targetStatus || undefined,
          isOverdue: targetStatus === 'overdue' ? true : undefined
        });
        setInvoices(res.items);
        setPagination(res.pagination);
      } catch (err: any) {
        console.error('Failed to load invoices', err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, search, statusFilter]
  );

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  async function handleDelete(id: string, num: string) {
    if (!window.confirm(`Delete invoice "${num}"?`)) return;
    try {
      await apiClient.deleteInvoice(id);
      loadInvoices();
    } catch (err: any) {
      alert(err.message || 'Cannot delete invoice');
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchFilterBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
              loadInvoices(1, val, statusFilter);
            }}
            placeholder="Search by invoice #, customer account..."
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              loadInvoices(1, search, e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="issued">Issued / Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
            <option value="void">Void</option>
          </select>

          <Button size="sm" onClick={onCreateInvoice} className="flex items-center gap-1.5 text-xs h-8">
            <Plus className="h-3.5 w-3.5" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Customer Account</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No invoices found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Issue client invoices or convert approved sales proposals.
                    </p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => onSelectInvoice(inv)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>{inv.accountName || '—'}</span>
                        </div>
                        {inv.contactName && (
                          <div className="text-[10px] text-slate-400 mt-0.5 pl-4.5">
                            {inv.contactName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${
                          inv.isOverdue ? 'font-bold text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            inv.status === 'paid'
                              ? 'success'
                              : inv.isOverdue
                              ? 'destructive'
                              : inv.status === 'partially_paid'
                              ? 'default'
                              : inv.status === 'void'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-[10px] capitalize font-semibold"
                        >
                          {inv.isOverdue ? 'Overdue' : inv.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 whitespace-nowrap">
                        {formatCurrency(parseFloat(inv.totalAmount), inv.currency)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                          parseFloat(inv.balanceDue) > 0.001 ? 'text-blue-700' : 'text-emerald-600'
                        }`}
                      >
                        {formatCurrency(parseFloat(inv.balanceDue), inv.currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {parseFloat(inv.balanceDue) > 0.001 && inv.status !== 'void' && (
                            <button
                              onClick={() => onRecordPayment(inv)}
                              title="Record Payment"
                              className="rounded p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectInvoice(inv)}
                            title="View Invoice"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {parseFloat(inv.paidAmount) <= 0 && inv.status !== 'void' && (
                            <button
                              onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                              title="Delete Invoice"
                              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
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
                loadInvoices(p, search, statusFilter);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
