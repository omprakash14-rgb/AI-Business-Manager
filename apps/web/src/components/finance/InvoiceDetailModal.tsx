import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  InvoiceDto,
  PaymentRecordDto,
  InvoiceStatus
} from '@ai-business-manager/shared';
import { formatCurrency, formatDateTime } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Ban,
  Clock
} from 'lucide-react';

interface InvoiceDetailModalProps {
  invoiceId: string | null;
  onClose: () => void;
  onUpdated: () => void;
  onRecordPayment: (invoice: InvoiceDto) => void;
}

export function InvoiceDetailModal({
  invoiceId,
  onClose,
  onUpdated,
  onRecordPayment
}: InvoiceDetailModalProps) {
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [payments, setPayments] = useState<PaymentRecordDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceData(invoiceId);
    }
  }, [invoiceId]);

  async function loadInvoiceData(id: string) {
    setIsLoading(true);
    setError(null);
    try {
      const [invRes, payRes] = await Promise.all([
        apiClient.getInvoice(id),
        apiClient.getPaymentRecords({ invoiceId: id, limit: 50 })
      ]);
      setInvoice(invRes);
      setPayments(payRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice details');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(newStatus: InvoiceStatus) {
    if (!invoice) return;
    try {
      await apiClient.updateInvoiceStatus(invoice.id, newStatus);
      loadInvoiceData(invoice.id);
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update invoice status');
    }
  }

  async function handleDelete() {
    if (!invoice) return;
    if (!window.confirm(`Are you sure you want to delete invoice "${invoice.invoiceNumber}"?`)) return;
    try {
      await apiClient.deleteInvoice(invoice.id);
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete invoice');
    }
  }

  if (!invoiceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-600 text-sm">
                {invoice ? invoice.invoiceNumber : 'Loading...'}
              </span>
              {invoice && (
                <Badge
                  variant={
                    invoice.status === 'paid'
                      ? 'success'
                      : invoice.isOverdue
                      ? 'destructive'
                      : invoice.status === 'partially_paid'
                      ? 'default'
                      : invoice.status === 'void'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className="text-[10px] capitalize font-bold"
                >
                  {invoice.isOverdue ? 'Overdue' : invoice.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900">Commercial Invoice</h2>
          </div>

          <div className="flex items-center gap-2">
            {invoice && parseFloat(invoice.paidAmount) <= 0 && invoice.status !== 'void' && (
              <button
                onClick={handleDelete}
                title="Delete invoice"
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {invoice && (
            <>
              {/* Overdue Warning */}
              {invoice.isOverdue && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">
                  <Clock className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>
                    <strong>Invoice Overdue:</strong> Due date was{' '}
                    {new Date(invoice.dueDate).toLocaleDateString()}. Balance of{' '}
                    {formatCurrency(parseFloat(invoice.balanceDue), invoice.currency)} remains
                    unsettled.
                  </span>
                </div>
              )}

              {/* Bill To & Dates Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Billed To
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>{invoice.accountName}</span>
                  </div>
                  {invoice.contactName && (
                    <div className="text-slate-600">Attn: {invoice.contactName}</div>
                  )}
                  {invoice.quotationNumber && (
                    <div className="text-[10px] text-slate-400">
                      From Proposal: {invoice.quotationNumber}
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Timeline
                  </span>
                  <div>
                    <span className="text-slate-500">Issue Date: </span>
                    <strong className="text-slate-800">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Due Date: </span>
                    <strong
                      className={invoice.isOverdue ? 'text-rose-600' : 'text-slate-800'}
                    >
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Created by: {invoice.createdByName || 'System'}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Invoice Line Items</h4>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                      <tr>
                        <th className="px-3 py-2">Item Description</th>
                        <th className="px-3 py-2 text-center w-20">Qty</th>
                        <th className="px-3 py-2 text-right w-28">Unit Price</th>
                        <th className="px-3 py-2 text-right w-28">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoice.items.map((it) => (
                        <tr key={it.id}>
                          <td className="px-3 py-2 font-medium text-slate-800">{it.description}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{it.quantity}</td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            {formatCurrency(parseFloat(it.unitPrice), invoice.currency)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">
                            {formatCurrency(parseFloat(it.totalPrice), invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(parseFloat(invoice.subtotal), invoice.currency)}
                    </span>
                  </div>

                  {parseFloat(invoice.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>
                        -{formatCurrency(parseFloat(invoice.discountAmount), invoice.currency)}
                      </span>
                    </div>
                  )}

                  {parseFloat(invoice.taxAmount) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({invoice.taxPercent}%):</span>
                      <span>{formatCurrency(parseFloat(invoice.taxAmount), invoice.currency)}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Grand Total:</span>
                    <span className="text-slate-900">
                      {formatCurrency(parseFloat(invoice.totalAmount), invoice.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Amount Paid:</span>
                    <span>{formatCurrency(parseFloat(invoice.paidAmount), invoice.currency)}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-blue-700 text-sm">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(parseFloat(invoice.balanceDue), invoice.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Settlement & Payment Records ({payments.length})
                  </h4>
                  {parseFloat(invoice.balanceDue) > 0 && invoice.status !== 'void' && (
                    <Button
                      size="sm"
                      onClick={() => onRecordPayment(invoice)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs h-7 flex items-center gap-1"
                    >
                      <DollarSign className="h-3 w-3" />
                      Record Payment
                    </Button>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-slate-400">
                    No payment records logged yet.
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                        <tr>
                          <th className="px-3 py-2">Payment #</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Method</th>
                          <th className="px-3 py-2">Reference</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 font-mono font-bold text-blue-600">
                              {p.paymentNumber}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {new Date(p.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 capitalize text-slate-600">
                              {p.paymentMethod.replace('_', ' ')}
                            </td>
                            <td className="px-3 py-2 text-slate-500">{p.reference || '—'}</td>
                            <td className="px-3 py-2 text-right font-bold text-emerald-600">
                              {formatCurrency(parseFloat(p.amount), p.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Terms and notes */}
              {(invoice.notes || invoice.terms) && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  {invoice.notes && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
                      <p className="text-slate-600 leading-relaxed">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Terms:</span>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        {invoice && (
          <div className="flex items-center justify-between border-t border-slate-100 p-4">
            <div className="flex items-center gap-2">
              {invoice.status === 'issued' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('void')}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <Ban className="h-3.5 w-3.5 mr-1" />
                  Void Invoice
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {parseFloat(invoice.balanceDue) > 0 && invoice.status !== 'void' && (
                <Button
                  size="sm"
                  onClick={() => onRecordPayment(invoice)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  Record Payment
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
