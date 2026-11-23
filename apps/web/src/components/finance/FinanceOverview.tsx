import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FinancialSummaryDto,
  formatCurrency
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Calendar,
  Layers,
  PieChart,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface FinanceOverviewProps {
  onNavigateTab: (tab: 'invoices' | 'transactions' | 'payments' | 'budgets' | 'categories') => void;
  onOpenCreateInvoice: () => void;
  onOpenCreateTransaction: (type: 'income' | 'expense') => void;
}

export function FinanceOverview({
  onNavigateTab,
  onOpenCreateInvoice,
  onOpenCreateTransaction
}: FinanceOverviewProps) {
  const [summary, setSummary] = useState<FinancialSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getFinancialSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load financial summary', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (isLoading && !summary) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-3 text-blue-500" />
        <p className="text-sm font-medium text-slate-600">Calculating financial ledgers & cash flow...</p>
      </div>
    );
  }

  const totalInc = parseFloat(summary?.totalIncome || '0');
  const totalExp = parseFloat(summary?.totalExpenses || '0');
  const netIncome = parseFloat(summary?.netOperatingIncome || '0');
  const totalReceivables = parseFloat(summary?.totalReceivables || '0');
  const overdueAmt = parseFloat(summary?.overdueInvoicesAmount || '0');
  const currency = summary?.currency || 'USD';

  const isNetPositive = netIncome >= 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Income */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Income</span>
              <div className="h-7 w-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalInc, currency)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Operating receipts</span>
              <button
                type="button"
                onClick={() => onNavigateTab('transactions')}
                className="text-blue-600 hover:underline font-medium"
              >
                View
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
              <div className="h-7 w-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalExp, currency)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Operational costs</span>
              <button
                type="button"
                onClick={() => onNavigateTab('transactions')}
                className="text-blue-600 hover:underline font-medium"
              >
                View
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Net Operating Income */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Net Operating Flow</span>
              <div
                className={`h-7 w-7 rounded-md flex items-center justify-center ${
                  isNetPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}
              >
                {isNetPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </div>
            </div>
            <div
              className={`text-xl font-bold mt-2 ${
                isNetPositive ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {isNetPositive ? '+' : ''}
              {formatCurrency(netIncome, currency)}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              {isNetPositive ? 'Profitable cash buffer' : 'Operating cash deficit'}
            </div>
          </CardContent>
        </Card>

        {/* Receivables / Outstanding Invoices */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Receivables</span>
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalReceivables, currency)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Unpaid balance</span>
              <button
                type="button"
                onClick={() => onNavigateTab('invoices')}
                className="text-blue-600 hover:underline font-medium"
              >
                Invoices
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Overdue Invoices</span>
              <div
                className={`h-7 w-7 rounded-md flex items-center justify-center ${
                  summary?.overdueInvoicesCount ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div
              className={`text-xl font-bold mt-2 ${
                summary?.overdueInvoicesCount ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {formatCurrency(overdueAmt, currency)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">
                {summary?.overdueInvoicesCount || 0} overdue {summary?.overdueInvoicesCount === 1 ? 'bill' : 'bills'}
              </span>
              {summary && summary.overdueInvoicesCount > 0 && (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  Action Req.
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white text-slate-700 text-xs font-normal">
            Operational Desk
          </Badge>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Direct bookkeeping, invoicing & budget control
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenCreateInvoice}
            className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Receipt className="h-3.5 w-3.5 mr-1" /> Issue Invoice
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenCreateTransaction('income')}
            className="text-xs h-8 bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200"
          >
            <Plus className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Log Income
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenCreateTransaction('expense')}
            className="text-xs h-8 bg-white text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <Plus className="h-3.5 w-3.5 mr-1 text-rose-600" /> Log Expense
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadSummary()}
            disabled={isLoading}
            className="text-xs h-8 text-slate-600"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Grid: Cash Flow Trend & Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Monthly Cash Flow & Budget Overview */}
        <div className="space-y-6">
          {/* Monthly Cash Flow Table */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Monthly Cash Flow Breakdown
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reconciled inflow vs outflow by month
                </p>
              </div>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-0">
              {!summary || summary.monthlyCashFlow.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No monthly transaction data available yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4">Period</th>
                        <th className="py-2.5 px-4 text-right">Income</th>
                        <th className="py-2.5 px-4 text-right">Expenses</th>
                        <th className="py-2.5 px-4 text-right">Net Flow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.monthlyCashFlow.map((cf) => {
                        const net = parseFloat(cf.net) || 0;
                        const inc = parseFloat(cf.income) || 0;
                        const exp = parseFloat(cf.expense) || 0;
                        return (
                          <tr key={cf.month} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-slate-800">
                              {cf.month}
                            </td>
                            <td className="py-2.5 px-4 text-right text-emerald-600 font-medium">
                              +{formatCurrency(inc, currency)}
                            </td>
                            <td className="py-2.5 px-4 text-right text-rose-600 font-medium">
                              -{formatCurrency(exp, currency)}
                            </td>
                            <td
                              className={`py-2.5 px-4 text-right font-bold ${
                                net >= 0 ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              {net >= 0 ? '+' : ''}
                              {formatCurrency(net, currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Utilization Widget */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Operational Budget Health
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Aggregate spending against configured financial budgets
                </p>
              </div>
              <Target className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {summary?.budgetUtilizationSummary ? (
                <>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Allocated</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {formatCurrency(parseFloat(summary.budgetUtilizationSummary.totalBudgeted) || 0, currency)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Actual Spent</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {formatCurrency(parseFloat(summary.budgetUtilizationSummary.totalActualSpent) || 0, currency)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Avg Utilization</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {summary.budgetUtilizationSummary.averageUtilizationPercent}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Average Budget Consumption</span>
                      <span className="font-bold text-slate-800">
                        {summary.budgetUtilizationSummary.averageUtilizationPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          summary.budgetUtilizationSummary.averageUtilizationPercent > 100
                            ? 'bg-rose-500'
                            : summary.budgetUtilizationSummary.averageUtilizationPercent > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, summary.budgetUtilizationSummary.averageUtilizationPercent))}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateTab('budgets')}
                      className="text-xs h-7 gap-1"
                    >
                      <Target className="h-3 w-3" />
                      Manage Detailed Budgets
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No budgets configured.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Category Breakdowns (Expenses & Income) */}
        <div className="space-y-6">
          {/* Expenses by Category */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Expenses by Category
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Operational expenditure breakdown
                </p>
              </div>
              <PieChart className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {!summary || summary.expensesByCategory.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No recorded expenses yet.
                </div>
              ) : (
                summary.expensesByCategory.map((cat) => {
                  const amt = parseFloat(cat.totalAmount) || 0;
                  return (
                    <div key={cat.categoryId} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color || '#64748b' }}
                          />
                          <span className="font-semibold text-slate-800">{cat.categoryName}</span>
                          <span className="text-[10px] text-slate-400">
                            ({cat.transactionCount} entries)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <span className="text-slate-800">{formatCurrency(amt, currency)}</span>
                          <span className="text-slate-400 text-[11px] w-10 text-right">
                            {cat.percentageOfTotal}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, cat.percentageOfTotal)}%`,
                            backgroundColor: cat.color || '#64748b'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Income by Category */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Income Streams by Category
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Revenue sources and client billing streams
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {!summary || summary.incomeByCategory.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No recorded income yet.
                </div>
              ) : (
                summary.incomeByCategory.map((cat) => {
                  const amt = parseFloat(cat.totalAmount) || 0;
                  return (
                    <div key={cat.categoryId} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color || '#10b981' }}
                          />
                          <span className="font-semibold text-slate-800">{cat.categoryName}</span>
                          <span className="text-[10px] text-slate-400">
                            ({cat.transactionCount} entries)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <span className="text-slate-800">{formatCurrency(amt, currency)}</span>
                          <span className="text-slate-400 text-[11px] w-10 text-right">
                            {cat.percentageOfTotal}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, cat.percentageOfTotal)}%`,
                            backgroundColor: cat.color || '#10b981'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
