import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MilestoneDto } from '@ai-business-manager/shared';
import {
  Milestone,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Plus,
  Target
} from 'lucide-react';

interface MilestonesListViewProps {
  milestones: MilestoneDto[];
  onToggleStatus: (milestoneId: string, currentStatus: 'pending' | 'completed') => Promise<void>;
  onDeleteMilestone: (milestoneId: string, title: string) => Promise<void>;
  onAddMilestone: () => void;
}

export function MilestonesListView({
  milestones,
  onToggleStatus,
  onDeleteMilestone,
  onAddMilestone
}: MilestonesListViewProps) {
  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Project Milestones</h3>
          <p className="text-xs text-slate-500">Track target completion goals across key project phases</p>
        </div>
        <Button
          size="sm"
          onClick={onAddMilestone}
          className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Milestone
        </Button>
      </div>

      {/* Grid of Milestones */}
      {milestones.length === 0 ? (
        <Card className="border-slate-200 bg-white p-10 text-center text-slate-400">
          <Milestone className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-700 text-sm">No milestones defined</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Break this project into high-level phases or release deliverables.
          </p>
          <Button
            size="sm"
            onClick={onAddMilestone}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Milestone
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m) => {
            const isDone = m.status === 'completed';
            const percent = m.progressPercentage;

            return (
              <Card
                key={m.id}
                className={`border-slate-200 bg-white shadow-xs transition-all ${
                  isDone ? 'border-emerald-200 bg-emerald-50/20' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
                          isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Milestone className="h-4 w-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-900 leading-tight">
                          {m.title}
                        </CardTitle>
                        {m.targetDate && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>Target: {m.targetDate.substring(0, 10)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(m.id, m.status)}
                      className="cursor-pointer"
                    >
                      {isDone ? (
                        <Badge variant="success" className="text-[10px]">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-600 bg-slate-50">
                          Pending
                        </Badge>
                      )}
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-1 pb-4">
                  {m.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  {/* Progress Bar & Task Count */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-500">Tasks Completed</span>
                      <span className="font-bold text-slate-800">
                        {m.completedTasks} / {m.totalTasks} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isDone ? 'bg-emerald-500' : percent > 50 ? 'bg-purple-600' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(m.id, m.status)}
                      className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      {isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteMilestone(m.id, m.title)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete milestone"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
