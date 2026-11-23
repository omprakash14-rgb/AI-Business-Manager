import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  EmployeeDto,
  AttendanceRecordDto,
  LeaveRequestDto,
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  ATTENDANCE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  X,
  User,
  Briefcase,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employeeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (emp: EmployeeDto) => void;
  onEmployeeDeleted: () => void;
  isAdmin: boolean;
}

type TabType = 'overview' | 'attendance' | 'leaves';

export function EmployeeDetailModal({
  employeeId,
  isOpen,
  onClose,
  onEdit,
  onEmployeeDeleted,
  isAdmin
}: EmployeeDetailModalProps) {
  const [employee, setEmployee] = useState<EmployeeDto | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecordDto[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequestDto[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!employeeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [emp, attRes, leaveRes] = await Promise.all([
        apiClient.getEmployee(employeeId),
        apiClient.getAttendance({ employeeId, limit: 30 }),
        apiClient.getLeaveRequests({ employeeId, limit: 30 })
      ]);
      setEmployee(emp);
      setAttendance(attRes.items);
      setLeaves(leaveRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (isOpen && employeeId) {
      loadData();
      setActiveTab('overview');
    }
  }, [isOpen, employeeId, loadData]);

  const handleDelete = async () => {
    if (!employeeId || !employee) return;
    if (
      !window.confirm(
        `Are you sure you want to terminate/archive employee ${employee.fullName} (${employee.employeeNumber})?`
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteEmployee(employeeId);
      onEmployeeDeleted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to archive employee');
    }
  };

  if (!isOpen || !employeeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {employee ? `${employee.firstName[0]}${employee.lastName[0]}` : 'EM'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {employee ? employee.fullName : 'Employee Profile'}
                </h3>
                {employee && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {employee.employeeNumber}
                  </Badge>
                )}
                {employee && (
                  <Badge
                    variant={
                      employee.status === 'active'
                        ? 'success'
                        : employee.status === 'on_leave'
                        ? 'default'
                        : 'destructive'
                    }
                    className="text-[10px]"
                  >
                    {EMPLOYMENT_STATUS_LABELS[employee.status]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{employee?.designationTitle || 'No Designation'}</span>
                <span>•</span>
                <span>{employee?.departmentName || 'No Department'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-white shrink-0 space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Profile & Organizational Info
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'attendance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Attendance Log</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600">
              {attendance.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'leaves'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Leave Requests</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-[10px] text-purple-700">
              {leaves.length}
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-slate-500">
              <Clock className="h-5 w-5 animate-spin mr-2" />
              <span>Loading employee record...</span>
            </div>
          ) : employee ? (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Employment & Assignment */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <span>Workforce Details</span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Employment Type</span>
                          <span className="font-medium text-slate-900">
                            {EMPLOYMENT_TYPE_LABELS[employee.employmentType]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Department</span>
                          <span className="font-medium text-slate-900">
                            {employee.departmentName || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Designation / Role</span>
                          <span className="font-medium text-slate-900">
                            {employee.designationTitle || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Reporting Manager</span>
                          <span className="font-medium text-slate-900">
                            {employee.reportingManagerName || 'None (Direct Report / Exec)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-500">Joining Date</span>
                          <span className="font-medium text-slate-900">
                            {new Date(employee.joiningDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Identity */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span>Work Contact & Access</span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Work Email</span>
                          <span className="font-medium text-blue-600">{employee.workEmail}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Work Phone</span>
                          <span className="font-medium text-slate-900">
                            {employee.workPhone || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Platform User Account</span>
                          <span className="font-medium">
                            {employee.userId ? (
                              <Badge variant="success" className="text-[10px]">
                                Linked Account
                              </Badge>
                            ) : (
                              <span className="text-slate-400">Not Linked</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-500">Record Created</span>
                          <span className="font-medium text-slate-700">
                            {new Date(employee.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {employee.notes && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-1">Internal Notes</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {employee.notes}
                      </p>
                    </div>
                  )}

                  {/* Data Sovereignty Notice */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                    <strong>HR Confidentiality Notice:</strong> Employee records and platform user accounts are
                    strictly separated. Statutory payroll calculations and compensation figures are excluded
                    from operational HR management.
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-3">
                  {attendance.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Clock className="h-8 w-8 mx-auto text-slate-300 mb-1" />
                      <p>No attendance records logged for this employee</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs bg-white">
                        <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Date</th>
                            <th className="py-2.5 px-3 font-semibold">Status</th>
                            <th className="py-2.5 px-3 font-semibold">Check-In / Check-Out</th>
                            <th className="py-2.5 px-3 font-semibold">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attendance.map((att) => (
                            <tr key={att.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono text-[11px] font-medium text-slate-900">
                                {att.date}
                              </td>
                              <td className="py-2 px-3">
                                <Badge
                                  variant={
                                    att.status === 'present'
                                      ? 'success'
                                      : att.status === 'remote'
                                      ? 'default'
                                      : att.status === 'half_day'
                                      ? 'outline'
                                      : 'destructive'
                                  }
                                  className="text-[10px]"
                                >
                                  {ATTENDANCE_STATUS_LABELS[att.status]}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-[11px] text-slate-600">
                                {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                {' - '}
                                {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </td>
                              <td className="py-2 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                                {att.notes || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'leaves' && (
                <div className="space-y-3">
                  {leaves.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Calendar className="h-8 w-8 mx-auto text-slate-300 mb-1" />
                      <p>No leave requests recorded for this employee</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs bg-white">
                        <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Leave Type</th>
                            <th className="py-2.5 px-3 font-semibold">Date Range</th>
                            <th className="py-2.5 px-3 font-semibold">Days</th>
                            <th className="py-2.5 px-3 font-semibold">Status</th>
                            <th className="py-2.5 px-3 font-semibold">Approver / Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leaves.map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium text-slate-900">
                                {LEAVE_TYPE_LABELS[l.leaveType]}
                              </td>
                              <td className="py-2 px-3 text-[11px] text-slate-700">
                                {l.startDate} to {l.endDate}
                              </td>
                              <td className="py-2 px-3 text-[11px] font-semibold text-purple-700">
                                {l.daysCount} d
                              </td>
                              <td className="py-2 px-3">
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
                              <td className="py-2 px-3 text-[11px] text-slate-500">
                                {l.reason || (l.approverName ? `Decided by ${l.approverName}` : '—')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <div>
            {isAdmin && employee && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-50 border-red-200 text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Terminate / Archive</span>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && employee && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onEdit(employee);
                  onClose();
                }}
                className="text-xs gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={onClose}
              className="bg-slate-800 text-white hover:bg-slate-900 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
