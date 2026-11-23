import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  HrSummaryDto,
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS
} from '@ai-business-manager/shared';
import {
  Users,
  Building,
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface HrOverviewProps {
  summary: HrSummaryDto | null;
  isLoading: boolean;
  onNavigateTab: (tab: 'employees' | 'departments' | 'attendance' | 'leaves') => void;
  onAddEmployee: () => void;
  isAdmin: boolean;
}

export function HrOverview({
  summary,
  isLoading,
  onNavigateTab,
  onAddEmployee,
  isAdmin
}: HrOverviewProps) {
  if (isLoading || !summary) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs">
        <Clock className="h-6 w-6 mx-auto animate-spin text-blue-500 mb-2" />
        <span>Loading HR workforce metrics...</span>
      </div>
    );
  }

  const { todayAttendance } = summary;

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Workforce</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {summary.totalEmployees}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">{summary.activeEmployees} active</span>
              <span>•</span>
              <span className="text-amber-600 font-medium">{summary.onLeaveEmployees} on leave</span>
            </div>
          </CardContent>
        </Card>

        {/* Departments & Roles */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Departments & Roles</span>
              <Building className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {summary.departmentsCount} <span className="text-xs font-normal text-slate-500">Depts</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{summary.designationsCount} designated job positions</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Rate */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Today's Presence Rate</span>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {todayAttendance.attendanceRatePercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-medium">
                {todayAttendance.presentCount + todayAttendance.remoteCount} of {todayAttendance.totalExpected} present
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Leaves */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Pending Leave Requests</span>
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {summary.pendingLeavesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className={summary.pendingLeavesCount > 0 ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                {summary.pendingLeavesCount > 0 ? 'Action required' : 'All reviews current'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Today's Attendance Breakdown & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Attendance Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Today's Workforce Attendance Status</span>
            </h4>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-0.5"
            >
              <span>View Log</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded text-center">
              <div className="text-[10px] text-emerald-800 uppercase font-semibold">Office Present</div>
              <div className="text-lg font-bold text-emerald-900 mt-0.5">{todayAttendance.presentCount}</div>
            </div>
            <div className="p-2.5 bg-sky-50/70 border border-sky-100 rounded text-center">
              <div className="text-[10px] text-sky-800 uppercase font-semibold">Remote / WFH</div>
              <div className="text-lg font-bold text-sky-900 mt-0.5">{todayAttendance.remoteCount}</div>
            </div>
            <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded text-center">
              <div className="text-[10px] text-purple-800 uppercase font-semibold">On Leave</div>
              <div className="text-lg font-bold text-purple-900 mt-0.5">{todayAttendance.onLeaveCount}</div>
            </div>
            <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded text-center">
              <div className="text-[10px] text-rose-800 uppercase font-semibold">Absent</div>
              <div className="text-lg font-bold text-rose-900 mt-0.5">{todayAttendance.absentCount}</div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Expected workforce today: <strong>{todayAttendance.totalExpected} active members</strong></span>
            <span>Recorded presence: <strong>{todayAttendance.attendanceRatePercent}%</strong></span>
          </div>
        </div>

        {/* Department Distribution Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-600" />
              <span>Department Workforce Distribution</span>
            </h4>
            <button
              onClick={() => onNavigateTab('departments')}
              className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-0.5"
            >
              <span>Manage Depts</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {summary.departmentDistribution.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No departments configured yet
            </div>
          ) : (
            <div className="space-y-2 pt-1 max-h-44 overflow-y-auto pr-1">
              {summary.departmentDistribution.map((d) => {
                const percent =
                  summary.totalEmployees > 0
                    ? Math.round((d.employeeCount / summary.totalEmployees) * 100)
                    : 0;

                return (
                  <div key={d.departmentId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{d.departmentName}</span>
                      <span className="text-[11px] text-slate-500">
                        {d.employeeCount} member(s) ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leave Requests Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Recent Time-Off & Leave Submissions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workforce leave requests requiring management review or currently active
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('leaves')}
            className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1"
          >
            <span>All Requests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {summary.recentLeaves.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No recent leave requests
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Employee</th>
                  <th className="py-2.5 px-4 font-semibold">Leave Type</th>
                  <th className="py-2.5 px-4 font-semibold">Dates</th>
                  <th className="py-2.5 px-4 font-semibold">Days</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.recentLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-4 font-medium text-slate-900">
                      {l.employeeName}
                    </td>
                    <td className="py-2 px-4 text-slate-700">
                      {LEAVE_TYPE_LABELS[l.leaveType]}
                    </td>
                    <td className="py-2 px-4 text-[11px] text-slate-600">
                      {l.startDate} to {l.endDate}
                    </td>
                    <td className="py-2 px-4 font-semibold text-purple-700">
                      {l.daysCount} d
                    </td>
                    <td className="py-2 px-4">
                      <Badge
                        variant={
                          l.status === 'approved'
                            ? 'success'
                            : l.status === 'pending'
                            ? 'outline'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {LEAVE_STATUS_LABELS[l.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sensitive Data Protection Callout */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900">Sensitive HR Data Governance</h4>
          <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
            Operational HR management safeguards employee privacy. Platform login credentials and employee
            profiles remain decoupled entities. Personal employee data and leave approvals are scoped strictly to
            organization roles. In compliance with the Phase 9 specification, statutory payroll, salary calculations,
            and tax filings are excluded from this operational baseline.
          </p>
        </div>
      </div>
    </div>
  );
}
