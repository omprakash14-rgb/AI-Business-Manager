import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  EmployeeDto,
  DepartmentDto,
  DesignationDto,
  EmploymentType,
  EmploymentStatus,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_STATUS_LABELS
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, UserPlus, Briefcase, Mail, Phone, Calendar, Building, AlertCircle } from 'lucide-react';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (emp: EmployeeDto) => void;
  initialEmployee?: EmployeeDto | null;
}

export function CreateEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee
}: CreateEmployeeModalProps) {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time');
  const [status, setStatus] = useState<EmploymentStatus>('active');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');

  // Dropdown data
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [designations, setDesignations] = useState<DesignationDto[]>([]);
  const [managers, setManagers] = useState<EmployeeDto[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (initialEmployee) {
        setEmployeeNumber(initialEmployee.employeeNumber);
        setFirstName(initialEmployee.firstName);
        setLastName(initialEmployee.lastName);
        setWorkEmail(initialEmployee.workEmail);
        setWorkPhone(initialEmployee.workPhone || '');
        setDepartmentId(initialEmployee.departmentId || '');
        setDesignationId(initialEmployee.designationId || '');
        setReportingManagerId(initialEmployee.reportingManagerId || '');
        setEmploymentType(initialEmployee.employmentType);
        setStatus(initialEmployee.status);
        setJoiningDate(initialEmployee.joiningDate ? initialEmployee.joiningDate.substring(0, 10) : new Date().toISOString().substring(0, 10));
        setNotes(initialEmployee.notes || '');
      } else {
        // Reset defaults
        setEmployeeNumber('');
        setFirstName('');
        setLastName('');
        setWorkEmail('');
        setWorkPhone('');
        setDepartmentId('');
        setDesignationId('');
        setReportingManagerId('');
        setEmploymentType('full_time');
        setStatus('active');
        setJoiningDate(new Date().toISOString().substring(0, 10));
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialEmployee]);

  async function loadDropdowns() {
    try {
      const [deptList, desList, empListRes] = await Promise.all([
        apiClient.getDepartments(),
        apiClient.getDesignations(),
        apiClient.getEmployees({ limit: 100 })
      ]);
      setDepartments(deptList);
      setDesignations(desList);
      // Filter out self as manager if editing
      setManagers(
        empListRes.items.filter((e) => !initialEmployee || e.id !== initialEmployee.id)
      );
    } catch (err: any) {
      console.error('Failed to load HR dropdowns', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeNumber.trim()) {
      setError('Employee Number / ID is required.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (!workEmail.trim()) {
      setError('Work email is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let result: EmployeeDto;
      if (initialEmployee) {
        result = await apiClient.updateEmployee(initialEmployee.id, {
          employeeNumber: employeeNumber.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          workEmail: workEmail.trim().toLowerCase(),
          workPhone: workPhone.trim() || undefined,
          departmentId: departmentId || undefined,
          designationId: designationId || undefined,
          reportingManagerId: reportingManagerId || undefined,
          employmentType,
          status,
          joiningDate,
          notes: notes.trim() || undefined
        });
      } else {
        result = await apiClient.createEmployee({
          employeeNumber: employeeNumber.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          workEmail: workEmail.trim().toLowerCase(),
          workPhone: workPhone.trim() || undefined,
          departmentId: departmentId || undefined,
          designationId: designationId || undefined,
          reportingManagerId: reportingManagerId || undefined,
          employmentType,
          status,
          joiningDate,
          notes: notes.trim() || undefined
        });
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
              </h3>
              <p className="text-xs text-slate-500">
                Manage organization workforce profile and organizational assignments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Number & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="e.g. EMP-101"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Work Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="jane.doe@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Work Phone
              </label>
              <input
                type="text"
                value={workPhone}
                onChange={(e) => setWorkPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department & Designation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">-- No Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                Designation / Position
              </label>
              <select
                value={designationId}
                onChange={(e) => setDesignationId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">-- No Designation --</option>
                {designations.map((des) => (
                  <option key={des.id} value={des.id}>{des.title} {des.departmentName ? `(${des.departmentName})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reporting Manager & Joining Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reporting Manager</label>
              <select
                value={reportingManagerId}
                onChange={(e) => setReportingManagerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">-- No Reporting Manager --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.employeeNumber}) {m.designationTitle ? `— ${m.designationTitle}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Operational workforce notes, emergency contacts, office location..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : initialEmployee ? 'Update Profile' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
