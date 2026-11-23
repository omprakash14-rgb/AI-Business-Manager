import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DetailedOpportunityDto,
  OpportunityStage,
  STAGE_DISPLAY_NAMES,
  STAGE_DEFAULT_PROBABILITIES,
  OpportunityStageHistoryDto,
  QuotationDto
} from '@ai-business-manager/shared';
import { formatCurrency, formatDateTime } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  X,
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface OpportunityDetailModalProps {
  opportunityId: string | null;
  onClose: () => void;
  onUpdated: () => void;
  onCreateQuote?: (opportunity: DetailedOpportunityDto) => void;
}

const STAGES: OpportunityStage[] = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
];

export function OpportunityDetailModal({
  opportunityId,
  onClose,
  onUpdated,
  onCreateQuote
}: OpportunityDetailModalProps) {
  const [opportunity, setOpportunity] = useState<DetailedOpportunityDto | null>(null);
  const [history, setHistory] = useState<OpportunityStageHistoryDto[]>([]);
  const [quotations, setQuotations] = useState<QuotationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stage transition win/loss dialog state
  const [pendingStage, setPendingStage] = useState<OpportunityStage | null>(null);
  const [winLossReason, setWinLossReason] = useState('');
  const [stageNotes, setStageNotes] = useState('');
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Active sub-tab in modal
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'quotes'>('overview');

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity(opportunityId);
    }
  }, [opportunityId]);

  async function loadOpportunity(id: string) {
    setIsLoading(true);
    setError(null);
    try {
      const [oppRes, quotesRes] = await Promise.all([
        apiClient.getOpportunity(id),
        apiClient.getQuotations({ opportunityId: id, limit: 20 })
      ]);
      setOpportunity(oppRes);
      setHistory(oppRes.stageHistory || []);
      setQuotations(quotesRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load opportunity details');
    } finally {
      setIsLoading(false);
    }
  }

  function handleStageClick(targetStage: OpportunityStage) {
    if (!opportunity || opportunity.stage === targetStage) return;

    if (targetStage === 'closed_won' || targetStage === 'closed_lost') {
      setPendingStage(targetStage);
      setWinLossReason('');
      setStageNotes('');
    } else {
      executeStageTransition(targetStage);
    }
  }

  async function executeStageTransition(newStage: OpportunityStage, reason?: string, notes?: string) {
    if (!opportunity) return;
    setIsUpdatingStage(true);
    try {
      const updated = await apiClient.updateOpportunityStage(opportunity.id, {
        stage: newStage,
        winLossReason: reason || undefined,
        notes: notes || undefined
      });
      setOpportunity(updated);
      setHistory(updated.stageHistory || []);
      setPendingStage(null);
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to transition stage');
    } finally {
      setIsUpdatingStage(false);
    }
  }

  async function handleDelete() {
    if (!opportunity) return;
    if (!window.confirm(`Are you sure you want to delete opportunity "${opportunity.name}"?`)) return;

    try {
      await apiClient.deleteOpportunity(opportunity.id);
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete opportunity');
    }
  }

  if (!opportunityId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Opportunity
              </span>
              <Badge
                variant={
                  opportunity?.stage === 'closed_won'
                    ? 'success'
                    : opportunity?.stage === 'closed_lost'
                    ? 'destructive'
                    : 'secondary'
                }
                className="text-xs"
              >
                {opportunity ? STAGE_DISPLAY_NAMES[opportunity.stage] : 'Loading...'}
              </Badge>
              {opportunity && (
                <span className="text-xs text-slate-500 font-medium">
                  Probability: {opportunity.probability}%
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {opportunity ? opportunity.name : 'Loading Opportunity...'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              title="Delete Opportunity"
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {opportunity && (
            <>
              {/* Interactive Stage Pipeline Bar */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
                  <span>Sales Pipeline Progress</span>
                  <span className="text-[11px] text-slate-400">Click a stage to transition deal</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
                  {STAGES.map((stg) => {
                    const isCurrent = opportunity.stage === stg;
                    const isClosedWon = stg === 'closed_won';
                    const isClosedLost = stg === 'closed_lost';

                    let btnClass = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100';
                    if (isCurrent) {
                      if (isClosedWon) {
                        btnClass = 'border-emerald-600 bg-emerald-600 text-white shadow-xs';
                      } else if (isClosedLost) {
                        btnClass = 'border-rose-600 bg-rose-600 text-white shadow-xs';
                      } else {
                        btnClass = 'border-blue-600 bg-blue-600 text-white shadow-xs';
                      }
                    }

                    return (
                      <button
                        key={stg}
                        disabled={isUpdatingStage}
                        onClick={() => handleStageClick(stg)}
                        className={`group relative flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${btnClass}`}
                      >
                        <span className="text-[11px] font-semibold leading-tight block">
                          {STAGE_DISPLAY_NAMES[stg]}
                        </span>
                        <span className="text-[10px] opacity-75 mt-0.5 block">
                          {STAGE_DEFAULT_PROBABILITIES[stg]}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <DollarSign className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-[10px] font-semibold uppercase">Deal Value</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {formatCurrency(parseFloat(opportunity.amount), opportunity.currency)}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="text-[10px] font-semibold uppercase">Weighted Value</span>
                  </div>
                  <div className="text-base font-bold text-indigo-700">
                    {formatCurrency(
                      (parseFloat(opportunity.amount) * opportunity.probability) / 100,
                      opportunity.currency
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-[10px] font-semibold uppercase">Close Date</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {opportunity.expectedCloseDate
                      ? new Date(opportunity.expectedCloseDate).toLocaleDateString()
                      : 'Not set'}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <User className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] font-semibold uppercase">Owner</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {opportunity.assignedToName || 'Unassigned'}
                  </div>
                </div>
              </div>

              {/* Win/Loss Reason Notice if closed */}
              {opportunity.winLossReason && (
                <div
                  className={`rounded-lg p-3 text-xs border ${
                    opportunity.stage === 'closed_won'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  <span className="font-semibold block mb-0.5">
                    {opportunity.stage === 'closed_won' ? 'Winning Reason:' : 'Loss Reason:'}
                  </span>
                  <span>{opportunity.winLossReason}</span>
                </div>
              )}

              {/* Sub-tab Navigation */}
              <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 transition-colors border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Overview & CRM Links
                </button>
                <button
                  onClick={() => setActiveTab('quotes')}
                  className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'quotes'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Quotations & Proposals ({quotations.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Stage History ({history.length})
                </button>
              </div>

              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                    <div>
                      <span className="text-slate-400 block mb-1">Associated Account (Company)</span>
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span>{opportunity.accountName || 'None'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Associated Contact</span>
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{opportunity.contactName || 'None'}</span>
                      </div>
                    </div>
                    {opportunity.leadTitle && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block mb-1">Source Lead</span>
                        <div className="font-medium text-slate-800">
                          Converted from "{opportunity.leadTitle}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Notes & Description</h4>
                    <p className="rounded-lg border border-slate-200 bg-white p-3 text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {opportunity.notes || 'No description provided for this deal.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: Quotations & Proposals */}
              {activeTab === 'quotes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      Quotes associated with this opportunity
                    </span>
                    {onCreateQuote && (
                      <Button
                        size="sm"
                        onClick={() => onCreateQuote(opportunity)}
                        className="h-7 text-xs flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        New Quotation
                      </Button>
                    )}
                  </div>

                  {quotations.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
                      <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No quotations created yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Generate official proposals with line items, tax, and discount.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quotations.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-600">{q.quotationNumber}</span>
                              <Badge
                                variant={
                                  q.status === 'approved'
                                    ? 'success'
                                    : q.status === 'rejected' || q.status === 'expired'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-[10px] capitalize"
                              >
                                {q.status}
                              </Badge>
                            </div>
                            <div className="font-medium text-slate-800">{q.title}</div>
                            <div className="text-[11px] text-slate-400">
                              Issued: {new Date(q.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 block">
                              {formatCurrency(parseFloat(q.totalAmount), q.currency)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {q.items.length} line item{q.items.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Stage History */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No stage transition history recorded.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {history.map((h) => (
                        <div key={h.id} className="relative text-xs">
                          <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600" />
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-900">
                              {h.fromStage ? (
                                <>
                                  <span className="text-slate-400">{STAGE_DISPLAY_NAMES[h.fromStage]}</span>
                                  <span className="mx-1 text-slate-300">→</span>
                                  <span className="text-blue-600">{STAGE_DISPLAY_NAMES[h.toStage]}</span>
                                </>
                              ) : (
                                <span className="text-emerald-600">Initial creation: {STAGE_DISPLAY_NAMES[h.toStage]}</span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {formatDateTime(h.createdAt)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            By {h.changedByName || 'System'}
                            {h.notes && <span className="block italic text-slate-600 mt-0.5">"{h.notes}"</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Win/Loss Modal Dialog Overlay */}
        {pendingStage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-2 mb-3">
                {pendingStage === 'closed_won' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600" />
                )}
                <h4 className="text-sm font-bold text-slate-900">
                  Mark Deal as {STAGE_DISPLAY_NAMES[pendingStage]}
                </h4>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Please document the {pendingStage === 'closed_won' ? 'winning factors' : 'loss reason'} for sales audit and reporting:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {pendingStage === 'closed_won' ? 'Win Reason / Notes' : 'Loss Reason / Competitor Info'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={
                      pendingStage === 'closed_won'
                        ? 'e.g. Superior product demo, customer budget approved, strong executive relationship...'
                        : 'e.g. Budget cuts, chosen competitor (Competitor X), delayed project...'
                    }
                    value={winLossReason}
                    onChange={(e) => setWinLossReason(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingStage}
                    onClick={() => setPendingStage(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={pendingStage === 'closed_won' ? 'default' : 'destructive'}
                    disabled={isUpdatingStage}
                    onClick={() => executeStageTransition(pendingStage, winLossReason, stageNotes)}
                  >
                    Confirm {STAGE_DISPLAY_NAMES[pendingStage]}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
