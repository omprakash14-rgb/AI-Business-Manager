import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  QuotationDto,
  QuotationStatus,
  PaginationMeta
} from '@ai-business-manager/shared';
import { formatCurrency, formatDateTime } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import {
  FileText,
  DollarSign,
  Building2,
  Calendar,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Send,
  Clock,
  Plus,
  AlertCircle,
  X
} from 'lucide-react';

interface QuotationsViewProps {
  onCreateQuote: () => void;
}

export function QuotationsView({ onCreateQuote }: QuotationsViewProps) {
  const [quotations, setQuotations] = useState<QuotationDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<QuotationDto | null>(null);

  const loadQuotations = useCallback(
    async (targetPage = page, targetSearch = search, targetStatus = statusFilter) => {
      setIsLoading(true);
      try {
        const res = await apiClient.getQuotations({
          page: targetPage,
          limit: 15,
          search: targetSearch || undefined,
          status: targetStatus || undefined
        });
        setQuotations(res.items);
        setPagination(res.pagination);
      } catch (err: any) {
        console.error('Failed to load quotations', err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, search, statusFilter]
  );

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  async function handleStatusChange(id: string, newStatus: QuotationStatus) {
    try {
      const updated = await apiClient.updateQuotationStatus(id, {
        status: newStatus
      });
      setQuotations((prev) => prev.map((q) => (q.id === id ? updated : q)));
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update quotation status');
    }
  }

  async function handleDelete(id: string, num: string) {
    if (!window.confirm(`Are you sure you want to delete quotation "${num}"?`)) return;
    try {
      await apiClient.deleteQuotation(id);
      loadQuotations();
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete quotation');
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchFilterBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
              loadQuotations(1, val, statusFilter);
            }}
            placeholder="Search by quote #, title, deal, account..."
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              loadQuotations(1, search, e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>

          <Button size="sm" onClick={onCreateQuote} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Quote #</th>
                <th className="px-4 py-3">Title / Opportunity</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3">Valid Until</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span>Loading quotations...</span>
                    </div>
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No quotations found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Create structured proposals and track quote statuses.
                    </p>
                  </td>
                </tr>
              ) : (
                quotations.map((q) => {
                  return (
                    <tr
                      key={q.id}
                      onClick={() => setSelectedQuote(q)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">
                        {q.quotationNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{q.title}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          Deal: {q.opportunityName || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {q.accountName ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <span>{q.accountName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            q.status === 'approved'
                              ? 'success'
                              : q.status === 'rejected' || q.status === 'expired'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-[10px] capitalize font-semibold"
                        >
                          {q.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatCurrency(parseFloat(q.totalAmount), q.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {q.status === 'draft' && (
                            <button
                              onClick={() => handleStatusChange(q.id, 'sent')}
                              title="Mark as Sent to client"
                              className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {q.status === 'sent' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(q.id, 'approved')}
                                title="Mark Approved / Accepted"
                                className="rounded p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(q.id, 'rejected')}
                                title="Mark Rejected"
                                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedQuote(q)}
                            title="View quote details"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id, q.quotationNumber)}
                            title="Delete quotation"
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
                loadQuotations(p, search, statusFilter);
              }}
            />
          </div>
        )}
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 text-sm">
                    {selectedQuote.quotationNumber}
                  </span>
                  <Badge
                    variant={
                      selectedQuote.status === 'approved'
                        ? 'success'
                        : selectedQuote.status === 'rejected' || selectedQuote.status === 'expired'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="text-[10px] capitalize"
                  >
                    {selectedQuote.status}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedQuote.title}</h3>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <div>
                  <span className="text-slate-400 block mb-0.5">Target Opportunity</span>
                  <span className="font-semibold text-slate-800">{selectedQuote.opportunityName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Account / Client</span>
                  <span className="font-semibold text-slate-800">{selectedQuote.accountName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Valid Until</span>
                  <span className="font-semibold text-slate-800">
                    {selectedQuote.validUntil ? new Date(selectedQuote.validUntil).toLocaleDateString() : 'Open'}
                  </span>
                </div>
              </div>

              {/* Line items list */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Quotation Line Items</h4>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2 text-center w-20">Qty</th>
                        <th className="px-3 py-2 text-right w-28">Unit Price</th>
                        <th className="px-3 py-2 text-right w-28">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedQuote.items.map((it) => (
                        <tr key={it.id}>
                          <td className="px-3 py-2 font-medium text-slate-800">{it.description}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{it.quantity}</td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            {formatCurrency(parseFloat(it.unitPrice), selectedQuote.currency)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">
                            {formatCurrency(parseFloat(it.totalPrice), selectedQuote.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(parseFloat(selectedQuote.subtotal), selectedQuote.currency)}</span>
                  </div>
                  {parseFloat(selectedQuote.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(parseFloat(selectedQuote.discountAmount), selectedQuote.currency)}</span>
                    </div>
                  )}
                  {parseFloat(selectedQuote.taxAmount) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({selectedQuote.taxPercent}%):</span>
                      <span>{formatCurrency(parseFloat(selectedQuote.taxAmount), selectedQuote.currency)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total:</span>
                    <span className="text-blue-700">
                      {formatCurrency(parseFloat(selectedQuote.totalAmount), selectedQuote.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms and notes */}
              {(selectedQuote.notes || selectedQuote.terms) && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  {selectedQuote.notes && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
                      <p className="text-slate-600 leading-relaxed">{selectedQuote.notes}</p>
                    </div>
                  )}
                  {selectedQuote.terms && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Terms:</span>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{selectedQuote.terms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 p-4">
              <div className="flex items-center gap-1.5">
                {selectedQuote.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(selectedQuote.id, 'sent')}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Mark as Sent
                  </Button>
                )}
                {selectedQuote.status === 'sent' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedQuote.id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Approved
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange(selectedQuote.id, 'rejected')}
                      className="text-xs flex items-center gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Mark Rejected
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuote(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
