import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PaymentRecordDto,
  PaginationMeta,
  formatCurrency
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  Receipt,
  Search,
  RefreshCw,
  Ban,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface PaymentRecordsListViewProps {
  onRefresh?: () => void;
  onViewInvoice?: (invoiceId: string) => void;
}

export function PaymentRecordsListView({
  onRefresh,
  onViewInvoice
}: PaymentRecordsListViewProps) {
  const [payments, setPayments] = useState<PaymentRecordDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isVoiding, setIsVoiding] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getPaymentRecords({
        page,
        limit: 15,
        search: search || undefined
      });
      setPayments(res.items);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load payment records', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleVoidPayment = async (id: string, paymentNumber: string) => {
    if (!window.confirm(`Are you sure you want to void payment ${paymentNumber}? This will reverse the settled balance on the linked invoice and ledger.`)) {
      return;
    }

    setIsVoiding(id);
    try {
      await apiClient.voidPaymentRecord(id);
      await loadPayments();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Failed to void payment: ${err.message || 'Unknown error'}`);
    } finally {
      setIsVoiding(null);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Bank Transfer</Badge>;
      case 'credit_card':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">Credit Card</Badge>;
      case 'check':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Check</Badge>;
      case 'cash':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Cash</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{method}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search & Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt #, reference, notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPayments()}
            disabled={isLoading}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Payment Table Card */}
      <Card className="border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Receipt Number</th>
                <th className="py-2.5 px-4">Linked Invoice</th>
                <th className="py-2.5 px-4">Customer Account</th>
                <th className="py-2.5 px-4">Payment Method</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Settled Amount</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No payment records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Payments recorded against invoices or customer accounts will automatically appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isVoid = p.status === 'void';
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isVoid ? 'opacity-60 bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5 text-blue-600" />
                          <span className={isVoid ? 'line-through' : ''}>{p.paymentNumber}</span>
                        </div>
                        {p.reference && (
                          <div className="text-[10px] text-slate-500 font-normal pl-5">
                            Ref: {p.reference}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.invoiceNumber ? (
                          <button
                            type="button"
                            onClick={() => p.invoiceId && onViewInvoice?.(p.invoiceId)}
                            className="text-blue-600 hover:underline flex items-center gap-1 font-medium text-xs cursor-pointer"
                          >
                            <FileText className="h-3 w-3" />
                            {p.invoiceNumber}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Direct Account Credit</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {p.accountName ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            <span>{p.accountName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getMethodBadge(p.paymentMethod)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{p.paymentDate.substring(0, 10)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                        <span className={isVoid ? 'line-through text-slate-400' : ''}>
                          {formatCurrency(parseFloat(p.amount) || 0, p.currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isVoid ? (
                          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-[10px]">
                            Voided
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px]">
                            Completed
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isVoid && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVoidPayment(p.id, p.paymentNumber)}
                            disabled={isVoiding === p.id}
                            className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Void this payment and reverse invoice settlement"
                          >
                            <Ban className="h-3.5 w-3.5 mr-1" />
                            {isVoiding === p.id ? 'Voiding...' : 'Void'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} payments
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.page <= 1 || isLoading}
                className="h-7 text-xs px-2.5"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="h-7 text-xs px-2.5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
