import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BudgetDto,
  formatCurrency
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  Target,
  Plus,
  RefreshCw,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Tag
} from 'lucide-react';
import { CreateBudgetModal } from './CreateBudgetModal';

interface BudgetsViewProps {
  onRefreshFinance?: () => void;
}

export function BudgetsView({ onRefreshFinance }: BudgetsViewProps) {
  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getBudgets({ limit: 50 });
      setBudgets(res.items);
    } catch (err: any) {
      console.error('Failed to load budgets', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleDeleteBudget = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete budget "${name}"?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await apiClient.deleteBudget(id);
      await loadBudgets();
      if (onRefreshFinance) onRefreshFinance();
    } catch (err: any) {
      alert(`Failed to delete budget: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + (parseFloat(b.budgetAmount) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (parseFloat(b.actualSpent) || 0), 0);
  const overallUtilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const getStatusBadge = (status: 'on_track' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'on_track':
        return (
          <Badge variant="success" className="text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" />
            On Track
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="text-[10px] gap-1">
            <AlertTriangle className="h-3 w-3" />
            Near Limit
          </Badge>
        );
      case 'exceeded':
        return (
          <Badge variant="destructive" className="text-[10px] gap-1">
            <AlertTriangle className="h-3 w-3" />
            Exceeded
          </Badge>
        );
    }
  };

  const getProgressBarColor = (status: 'on_track' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'on_track':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'exceeded':
        return 'bg-rose-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Budget Allocation</span>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalAllocated, 'USD')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across {budgets.length} configured {budgets.length === 1 ? 'target' : 'targets'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Actual Spending</span>
              <PieChart className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalSpent, 'USD')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Reconciled against recorded expenses
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Overall Utilization</span>
              <div
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  overallUtilization > 100
                    ? 'bg-rose-100 text-rose-700'
                    : overallUtilization > 80
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {overallUtilization}%
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(Math.max(0, totalAllocated - totalSpent), 'USD')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Remaining organizational buffer
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Operational Budgets</h3>
          <p className="text-xs text-slate-500">
            Set and monitor periodic spending thresholds mapped to financial categories or overall operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadBudgets()}
            disabled={isLoading}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading && budgets.length === 0 ? (
        <Card className="border-slate-200 bg-white p-12 text-center text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-xs">Loading operational budgets...</p>
        </Card>
      ) : budgets.length === 0 ? (
        <Card className="border-slate-200 bg-white p-12 text-center text-slate-400">
          <Target className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <h4 className="font-semibold text-slate-700 text-sm">No operational budgets defined</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Create monthly, quarterly, or yearly spending budgets to monitor burn rates and prevent cost overruns.
          </p>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Create First Budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const budgetAmt = parseFloat(b.budgetAmount) || 0;
            const spentAmt = parseFloat(b.actualSpent) || 0;
            const remainingAmt = parseFloat(b.remainingAmount) || 0;
            const percent = Math.min(100, Math.max(0, b.utilizationPercent));

            return (
              <Card
                key={b.id}
                className="border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900 leading-snug">
                        {b.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span>{b.categoryName ? b.categoryName : 'All Categories'}</span>
                        <span>•</span>
                        <span className="capitalize">{b.period}</span>
                      </div>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>
                </CardHeader>

                <CardContent className="pt-3 pb-4 space-y-3">
                  {/* Progress Bar & Percent */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Utilization</span>
                      <span className="font-bold text-slate-800">{b.utilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(b.status)}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Spent</div>
                      <div className="font-semibold text-slate-800">
                        {formatCurrency(spentAmt, b.currency)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Allocation</div>
                      <div className="font-semibold text-slate-800">
                        {formatCurrency(budgetAmt, b.currency)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 rounded-md p-2 text-xs">
                    <span className="text-slate-500 font-medium">Remaining Buffer:</span>
                    <span
                      className={`font-bold ${
                        remainingAmt < 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {remainingAmt < 0 ? '-' : ''}
                      {formatCurrency(Math.abs(remainingAmt), b.currency)}
                    </span>
                  </div>

                  {/* Period Dates */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{b.startDate} to {b.endDate}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudget(b.id, b.name)}
                      disabled={isDeleting === b.id}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete budget"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          loadBudgets();
          if (onRefreshFinance) onRefreshFinance();
        }}
      />
    </div>
  );
}
