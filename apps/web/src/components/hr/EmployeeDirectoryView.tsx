import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  EmployeeDto,
  DepartmentDto,
  PaginationMeta,
  EmploymentStatus,
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS
} from '@ai-business-manager/shared';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Mail,
  Phone,
  Briefcase,
  Building,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface EmployeeDirectoryViewProps {
  employees: EmployeeDto[];
  departments: DepartmentDto[];
  pagination: PaginationMeta | null;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  employmentTypeFilter: string;
  onEmploymentTypeFilterChange: (val: string) => void;
  onSelectEmployee: (id: string) => void;
  onEditEmployee: (emp: EmployeeDto) => void;
  onAddEmployee: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export function EmployeeDirectoryView({
  employees,
  departments,
  pagination,
  page,
  onPageChange,
  search,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  employmentTypeFilter,
  onEmploymentTypeFilterChange,
  onSelectEmployee,
  onEditEmployee,
  onAddEmployee,
  isAdmin,
  isLoading
}: EmployeeDirectoryViewProps) {
  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, or work email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Department */}
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>

            {/* Employment Type */}
            <select
              value={employmentTypeFilter}
              onChange={(e) => onEmploymentTypeFilterChange(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>

            {isAdmin && (
              <Button
                onClick={onAddEmployee}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 ml-auto text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Employee</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <UserCheck className="h-6 w-6 mx-auto animate-bounce text-blue-500 mb-2" />
            <span>Loading employee directory...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <UserCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-800 text-sm">No employees found</div>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              {search || departmentFilter || statusFilter || employmentTypeFilter
                ? 'Try clearing your filters or search terms.'
                : 'Add employee records to build your organization workforce directory.'}
            </p>
            {isAdmin && !search && !departmentFilter && !statusFilter && !employmentTypeFilter && (
              <Button
                onClick={onAddEmployee}
                size="sm"
                className="mt-4 bg-blue-600 text-white text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add First Employee</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Position & Department</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Work Contact</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectEmployee(emp.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {emp.fullName}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {emp.employeeNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {emp.designationTitle || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {emp.departmentName || 'General Workforce'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          emp.status === 'active'
                            ? 'success'
                            : emp.status === 'on_leave'
                            ? 'default'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {EMPLOYMENT_STATUS_LABELS[emp.status]}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{emp.workEmail}</div>
                      {emp.workPhone && <div className="text-[11px] text-slate-400">{emp.workPhone}</div>}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {EMPLOYMENT_TYPE_LABELS[emp.employmentType]}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(emp.joiningDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectEmployee(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="View profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => onEditEmployee(emp)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Edit employee"
                          >
                            <Edit2 className="h-4 w-4" />
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
              <span className="font-medium text-slate-900">{pagination.totalPages}</span> (
              {pagination.totalItems} total employees)
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => onPageChange(page - 1)}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => onPageChange(page + 1)}
                className="h-7 px-2 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
