import { useState } from 'react';
import {
  DetailedOpportunityDto,
  OpportunityStage,
  STAGE_DISPLAY_NAMES,
  STAGE_DEFAULT_PROBABILITIES
} from '@ai-business-manager/shared';
import { formatCurrency } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  DollarSign,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  User,
  Plus
} from 'lucide-react';

interface OpportunitiesPipelineViewProps {
  opportunities: DetailedOpportunityDto[];
  onSelectOpportunity: (opp: DetailedOpportunityDto) => void;
  onRefresh: () => void;
  onCreateOpportunity: (stage: OpportunityStage) => void;
}

const STAGES: OpportunityStage[] = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
];

export function OpportunitiesPipelineView({
  opportunities,
  onSelectOpportunity,
  onRefresh,
  onCreateOpportunity
}: OpportunitiesPipelineViewProps) {
  const [movingId, setMovingId] = useState<string | null>(null);

  async function handleQuickMove(
    e: React.MouseEvent,
    opp: DetailedOpportunityDto,
    direction: 'prev' | 'next'
  ) {
    e.stopPropagation();
    const currentIndex = STAGES.indexOf(opp.stage);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0 || newIndex >= STAGES.length) return;
    const targetStage = STAGES[newIndex];

    if (targetStage === 'closed_won' || targetStage === 'closed_lost') {
      // Open detail modal to capture reason
      onSelectOpportunity(opp);
      return;
    }

    setMovingId(opp.id);
    try {
      await apiClient.updateOpportunityStage(opp.id, {
        stage: targetStage
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to move deal');
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
      {STAGES.map((stg, stgIdx) => {
        const stageDeals = opportunities.filter((o) => o.stage === stg);
        const totalAmount = stageDeals.reduce((sum, o) => sum + parseFloat(o.amount || '0'), 0);
        const weightedAmount = (totalAmount * STAGE_DEFAULT_PROBABILITIES[stg]) / 100;

        const isWon = stg === 'closed_won';
        const isLost = stg === 'closed_lost';

        let headerColor = 'border-slate-200 bg-slate-50 text-slate-800';
        if (isWon) headerColor = 'border-emerald-200 bg-emerald-50 text-emerald-900';
        if (isLost) headerColor = 'border-rose-200 bg-rose-50 text-rose-900';

        return (
          <div
            key={stg}
            className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50/60 shadow-2xs"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b rounded-t-xl ${headerColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider">{STAGE_DISPLAY_NAMES[stg]}</h3>
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs">
                    {stageDeals.length}
                  </span>
                </div>
                <button
                  onClick={() => onCreateOpportunity(stg)}
                  title={`Add deal to ${STAGE_DISPLAY_NAMES[stg]}`}
                  className="rounded-md p-1 hover:bg-black/5 text-slate-500 hover:text-slate-900"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] font-medium">
                <span className="text-slate-600">Total: {formatCurrency(totalAmount, 'USD')}</span>
                <span className="text-slate-400">
                  {STAGE_DEFAULT_PROBABILITIES[stg]}% prob
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 space-y-2.5 p-2.5 min-h-[350px]">
              {stageDeals.length === 0 ? (
                <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/40 text-center p-3">
                  <span className="text-xs text-slate-400">No deals in this stage</span>
                </div>
              ) : (
                stageDeals.map((opp) => {
                  const oppAmount = parseFloat(opp.amount || '0');
                  const isMoving = movingId === opp.id;

                  return (
                    <div
                      key={opp.id}
                      onClick={() => onSelectOpportunity(opp)}
                      className={`group cursor-pointer rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all ${
                        isMoving ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600">
                          {opp.name}
                        </h4>
                      </div>

                      {opp.accountName && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                          <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{opp.accountName}</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                        <div className="text-xs font-bold text-slate-900">
                          {formatCurrency(oppAmount, opp.currency)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {opp.probability}% win
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1 truncate">
                          <Calendar className="h-2.5 w-2.5 text-slate-400" />
                          <span>
                            {opp.expectedCloseDate
                              ? new Date(opp.expectedCloseDate).toLocaleDateString()
                              : 'No date'}
                          </span>
                        </div>

                        {/* Quick Move Buttons */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {stgIdx > 0 && (
                            <button
                              onClick={(e) => handleQuickMove(e, opp, 'prev')}
                              title="Move to previous stage"
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                          )}
                          {stgIdx < STAGES.length - 1 && (
                            <button
                              onClick={(e) => handleQuickMove(e, opp, 'next')}
                              title="Move to next stage"
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
