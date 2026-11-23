import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LeaveRequestDto,
  EmployeeDto,
  PaginationMeta,
  LeaveType,
  LeaveStatus,
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface LeaveManagementViewProps {
  employees: EmployeeDto[];
  isAdmin: boolean;
  myEmployee: EmployeeDto | null;
}

export function LeaveManagementView({
  employees,
  isAdmin,
  myEmployee
}: LeaveManagementViewProps) {
  const [leaves, setLeaves] = useState<LeaveRequestDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Request Leave Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqEmpId, setReqEmpId] = useState('');
  const [reqType, setReqType] = useState<LeaveType>('annual');
  const [reqStartDate, setReqStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [reqEndDate, setReqEndDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [reqDays, setReqDays] = useState('1.0');
  const [reqReason, setReqReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Review / Decision Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequestDto | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadLeaves = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getLeaveRequests({
        page,
        limit: 20,
        status: statusFilter || undefined,
        leaveType: leaveTypeFilter || undefined,
        employeeId: employeeFilter || undefined
      });
      setLeaves(res.items);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load leave requests', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, leaveTypeFilter, employeeFilter]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // Open Request Leave Modal
  const handleOpenRequestModal = () => {
    if (myEmployee && !isAdmin) {
      setReqEmpId(myEmployee.id);
    } else {
      setReqEmpId(employees.length > 0 ? employees[0].id : '');
    }
    setReqType('annual');
    setReqStartDate(new Date().toISOString().substring(0, 10));
    setReqEndDate(new Date().toISOString().substring(0, 10));
    setReqDays('1.0');
    setReqReason('');
    setRequestError(null);
    setIsRequestModalOpen(true);
  };

  // Submit Leave Request
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEmpId) {
      setRequestError('Please select an employee.');
      return;
    }
    if (reqEndDate < reqStartDate) {
      setRequestError('End date cannot be earlier than start date.');
      return;
    }

    setIsSubmitting(true);
    setRequestError(null);
    try {
      await apiClient.createLeaveRequest({
        employeeId: reqEmpId,
        leaveType: reqType,
        startDate: reqStartDate,
        endDate: reqEndDate,
        daysCount: Number(reqDays),
        reason: reqReason.trim() || undefined
      });
      setIsRequestModalOpen(false);
      loadLeaves();
    } catch (err: any) {
      setRequestError(err.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Review Modal
  const handleOpenReviewModal = (leave: LeaveRequestDto) => {
    setReviewingLeave(leave);
    setReviewNotes('');
    setReviewError(null);
    setIsReviewModalOpen(true);
  };

  // Decision (Approve / Reject)
  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!reviewingLeave) return;

    setIsDeciding(true);
    setReviewError(null);
    try {
      await apiClient.updateLeaveStatus(reviewingLeave.id, {
        status,
        approvalNotes: reviewNotes.trim() || undefined
      });
      setIsReviewModalOpen(false);
      loadLeaves();
    } catch (err: any) {
      setReviewError(err.message || `Failed to ${status} leave request`);
    } finally {
      setIsDeciding(false);
    }
  };

  // Cancel Leave
  const handleCancelLeave = async (id: string) => {
    if (!window.confirm('Cancel this pending leave request?')) return;
    try {
      await apiClient.cancelLeaveRequest(id);
      loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel leave request');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Review Statuses</option>
              {Object.entries(LEAVE_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {/* Leave Type filter */}
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Leave Types</option>
              {Object.entries(LEAVE_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {/* Employee filter */}
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeNumber})
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleOpenRequestModal}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs ml-auto"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Request Leave</span>
          </Button>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Clock className="h-6 w-6 mx-auto animate-spin text-purple-500 mb-2" />
            <span>Loading leave requests...</span>
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-800 text-sm">No leave requests found</div>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              {statusFilter || leaveTypeFilter || employeeFilter
                ? 'Try clearing your filters.'
                : 'Submit a leave request for planned time off or view team requests.'}
            </p>
            <Button
              onClick={handleOpenRequestModal}
              size="sm"
              className="mt-4 bg-purple-600 text-white text-xs gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Submit Leave Request</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Leave Type</th>
                  <th className="py-3 px-4 font-semibold">Dates & Duration</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Reason / Approver Notes</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{l.employeeName}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {l.employeeNumber} {l.departmentName ? `• ${l.departmentName}` : ''}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {LEAVE_TYPE_LABELS[l.leaveType]}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-mono text-[11px] text-slate-900">
                        {l.startDate} to {l.endDate}
                      </div>
                      <div className="text-[11px] font-semibold text-purple-700">
                        {l.daysCount} day(s)
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
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

                    <td className="py-2.5 px-4 text-slate-500 text-[11px] max-w-sm truncate">
                      {l.reason ? <span>{l.reason}</span> : null}
                      {l.approvalNotes && (
                        <span className="text-slate-700 italic ml-1">
                          (Note: {l.approvalNotes})
                        </span>
                      )}
                      {!l.reason && !l.approvalNotes && '—'}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && l.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReviewModal(l)}
                            className="h-7 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                          >
                            Review
                          </Button>
                        )}
                        {l.status === 'pending' && (
                          <button
                            onClick={() => handleCancelLeave(l.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded text-xs transition-colors"
                            title="Cancel request"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page <span className="font-medium text-slate-900">{pagination.page}</span> of{' '}
              <span className="font-medium text-slate-900">{pagination.totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage(page - 1)}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(page + 1)}
                className="h-7 px-2 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Request Leave */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Submit Leave Request</h3>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="p-5 space-y-3.5 text-xs">
              {requestError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{requestError}</span>
                </div>
              )}

              {/* Employee selector */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Requesting Employee *</label>
                <select
                  disabled={!isAdmin && !!myEmployee}
                  value={reqEmpId}
                  onChange={(e) => setReqEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Leave Category *</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as LeaveType)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.entries(LEAVE_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={reqStartDate}
                    onChange={(e) => setReqStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">End Date *</label>
                  <input
                    type="date"
                    required
                    value={reqEndDate}
                    onChange={(e) => setReqEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Days count */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Total Days Requested *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={reqDays}
                  onChange={(e) => setReqDays(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reason / Notes</label>
                <textarea
                  rows={2}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Reason for requested leave..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRequestModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review / Approval */}
      {isReviewModalOpen && reviewingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Review Leave Request</h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              {reviewError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee:</span>
                  <span className="font-semibold text-slate-900">{reviewingLeave.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Leave Type:</span>
                  <span className="font-medium text-slate-800">{LEAVE_TYPE_LABELS[reviewingLeave.leaveType]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-semibold text-purple-700">
                    {reviewingLeave.startDate} to {reviewingLeave.endDate} ({reviewingLeave.daysCount} days)
                  </span>
                </div>
                {reviewingLeave.reason && (
                  <div className="pt-1 border-t border-slate-200 text-slate-600">
                    Reason: {reviewingLeave.reason}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Approval / Rejection Comments</label>
                <input
                  type="text"
                  placeholder="Optional review notes for employee..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReviewModalOpen(false)}
                  disabled={isDeciding}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleDecision('rejected')}
                  disabled={isDeciding}
                  className="bg-red-600 hover:bg-red-700 text-white gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleDecision('approved')}
                  disabled={isDeciding}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
