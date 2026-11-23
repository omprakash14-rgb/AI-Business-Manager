import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  InvoiceDto,
  formatCurrency
} from '@ai-business-manager/shared';
import {
  Receipt,
  ArrowLeftRight,
  CreditCard,
  Target,
  Tags,
  BarChart3,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';
import { FinanceOverview } from './FinanceOverview';
import { InvoicesListView } from './InvoicesListView';
import { TransactionsListView } from './TransactionsListView';
import { PaymentRecordsListView } from './PaymentRecordsListView';
import { BudgetsView } from './BudgetsView';
import { CategoriesView } from './CategoriesView';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { CreateTransactionModal } from './CreateTransactionModal';
import { CreateBudgetModal } from './CreateBudgetModal';

export type FinanceTab =
  | 'overview'
  | 'invoices'
  | 'transactions'
  | 'payments'
  | 'budgets'
  | 'categories';

export function FinanceModuleView() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceDto | null>(null);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | null>(null);
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);

  const handleDataChanged = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleOpenPayment = (invoice: InvoiceDto) => {
    setPaymentInvoice(invoice);
  };

  const handleViewInvoiceFromPayment = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
  };

  return (
    <div className="space-y-6">
      {/* Module Header & Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Phase 6 Active — Operational Finance
              </Badge>
              <Badge variant="outline" className="text-xs text-slate-500 font-normal">
                Fixed-Precision Decimals
              </Badge>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Audited Ledger</span>
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Operational Finance & Invoicing
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
              Track operational income, business expenses, commercial invoices, payment reconciliations,
              and periodic category budgets for your SME workspace.
            </p>
          </div>

          {/* Global Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="gap-1.5 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Issue Invoice</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTransactionType('income')}
              className="gap-1.5 text-xs h-8 bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
              <span>Log Income</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTransactionType('expense')}
              className="gap-1.5 text-xs h-8 bg-white text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              <Plus className="h-3.5 w-3.5 text-rose-600" />
              <span>Log Expense</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Module Tabs Bar */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Overview & Reports</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'invoices'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Transactions Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payment Records</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('budgets')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'budgets'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Budgets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Tags className="h-4 w-4" />
            <span>Categories</span>
          </button>
        </nav>
      </div>

      {/* Active Tab Content */}
      <div key={refreshKey} className="transition-all duration-150">
        {activeTab === 'overview' && (
          <FinanceOverview
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
            onOpenCreateTransaction={(type) => setTransactionType(type)}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesListView
            onSelectInvoice={(inv) => setSelectedInvoiceId(inv.id)}
            onCreateInvoice={() => setIsCreateInvoiceOpen(true)}
            onRecordPayment={(invoice) => handleOpenPayment(invoice)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsListView
            onAddTransaction={(type) => setTransactionType(type)}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentRecordsListView
            onRefresh={handleDataChanged}
            onViewInvoice={handleViewInvoiceFromPayment}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView onRefreshFinance={handleDataChanged} />
        )}

        {activeTab === 'categories' && (
          <CategoriesView />
        )}
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onSuccess={() => {
          handleDataChanged();
          setActiveTab('invoices');
        }}
      />

      {/* Invoice Detail Modal */}
      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
          onRecordPayment={(inv) => {
            setSelectedInvoiceId(null);
            setPaymentInvoice(inv);
          }}
          onUpdated={handleDataChanged}
        />
      )}

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          isOpen={!!paymentInvoice}
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            handleDataChanged();
          }}
        />
      )}

      {/* Create Transaction Modal (Income / Expense) */}
      {transactionType && (
        <CreateTransactionModal
          isOpen={!!transactionType}
          initialType={transactionType}
          onClose={() => setTransactionType(null)}
          onSuccess={() => {
            handleDataChanged();
          }}
        />
      )}

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateBudgetOpen}
        onClose={() => setIsCreateBudgetOpen(false)}
        onSuccess={() => {
          handleDataChanged();
        }}
      />
    </div>
  );
}
