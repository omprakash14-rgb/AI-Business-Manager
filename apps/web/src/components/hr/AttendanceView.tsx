import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AttendanceRecordDto,
  EmployeeDto,
  PaginationMeta,
  AttendanceStatus,
  ATTENDANCE_STATUS_LABELS
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  Trash2,
  Filter,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface AttendanceViewProps {
  employees: EmployeeDto[];
  isAdmin: boolean;
  myEmployee: EmployeeDto | null;
}

export function AttendanceView({
  employees,
  isAdmin,
  myEmployee
}: AttendanceViewProps) {
  const [records, setRecords] = useState<AttendanceRecordDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Record Attendance Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [attDate, setAttDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('present');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [attNotes, setAttNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getAttendance({
        page,
        limit: 20,
        date: dateFilter || undefined,
        status: statusFilter || undefined,
        employeeId: employeeFilter || undefined
      });
      setRecords(res.items);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load attendance', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, dateFilter, statusFilter, employeeFilter]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleOpenModal = () => {
    if (myEmployee && !isAdmin) {
      setSelectedEmpId(myEmployee.id);
    } else {
      setSelectedEmpId(employees.length > 0 ? employees[0].id : '');
    }
    setAttDate(new Date().toISOString().substring(0, 10));
    setAttStatus('present');
    setCheckInTime(new Date().toISOString().substring(11, 16));
    setCheckOutTime('');
    setAttNotes('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setModalError('Please select an employee.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      const checkInIso = checkInTime ? `${attDate}T${checkInTime}:00.000Z` : undefined;
      const checkOutIso = checkOutTime ? `${attDate}T${checkOutTime}:00.000Z` : undefined;

      await apiClient.recordAttendance({
        employeeId: selectedEmpId,
        date: attDate,
        status: attStatus,
        checkInTime: checkInIso,
        checkOutTime: checkOutIso,
        notes: attNotes.trim() || undefined
      });

      setIsModalOpen(false);
      loadAttendance();
    } catch (err: any) {
      setModalError(err.message || 'Failed to record attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this attendance entry?')) return;
    try {
      await apiClient.deleteAttendance(id);
      loadAttendance();
    } catch (err: any) {
      alert(err.message || 'Failed to delete attendance record');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-blue-600 hover:underline"
              >
                Clear Date
              </button>
            )}

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Attendance Statuses</option>
              {Object.entries(ATTENDANCE_STATUS_LABELS).map(([val, label]) => (
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
            onClick={handleOpenModal}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs ml-auto"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Record Attendance</span>
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Clock className="h-6 w-6 mx-auto animate-spin text-blue-500 mb-2" />
            <span>Loading attendance records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Clock className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-800 text-sm">No attendance records logged</div>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              {dateFilter || statusFilter || employeeFilter
                ? 'Try clearing your filters.'
                : 'Log daily attendance to track active workforce and presence.'}
            </p>
            <Button
              onClick={handleOpenModal}
              size="sm"
              className="mt-4 bg-blue-600 text-white text-xs gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Record Today's Attendance</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Time Log</th>
                  <th className="py-3 px-4 font-semibold">Notes</th>
                  {isAdmin && <th className="py-3 px-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                      {rec.date}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{rec.employeeName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{rec.employeeNumber}</div>
                    </td>

                    <td className="py-2.5 px-4 text-slate-600">
                      {rec.departmentName || '—'}
                    </td>

                    <td className="py-2.5 px-4">
                      <Badge
                        variant={
                          rec.status === 'present'
                            ? 'success'
                            : rec.status === 'remote'
                            ? 'default'
                            : rec.status === 'half_day'
                            ? 'outline'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {ATTENDANCE_STATUS_LABELS[rec.status]}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-4 text-slate-700 text-[11px]">
                      {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      {' to '}
                      {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {rec.notes || '—'}
                    </td>

                    {isAdmin && (
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
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

      {/* Record Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Record Daily Attendance</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAttendance} className="p-5 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Employee selector */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Employee *</label>
                <select
                  disabled={!isAdmin && !!myEmployee}
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Date *</label>
                  <input
                    type="date"
                    required
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status *</label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.entries(ATTENDANCE_STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Check-In & Check-Out Time */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Check-In Time</label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Check-Out Time</label>
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Working from home, morning dental appointment..."
                  value={attNotes}
                  onChange={(e) => setAttNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white"
                >
                  {isSubmitting ? 'Recording...' : 'Save Attendance'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
