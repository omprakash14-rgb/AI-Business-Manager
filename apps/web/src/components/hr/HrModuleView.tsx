import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  EmployeeDto,
  DepartmentDto,
  DesignationDto,
  HrSummaryDto,
  PaginationMeta
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Building,
  Clock,
  Calendar,
  BarChart3,
  Plus,
  RefreshCw,
  Briefcase
} from 'lucide-react';
import { HrOverview } from './HrOverview';
import { EmployeeDirectoryView } from './EmployeeDirectoryView';
import { DepartmentsView } from './DepartmentsView';
import { AttendanceView } from './AttendanceView';
import { LeaveManagementView } from './LeaveManagementView';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { EmployeeDetailModal } from './EmployeeDetailModal';

type HrTab = 'overview' | 'employees' | 'departments' | 'attendance' | 'leaves';

export function HrModuleView() {
  const { currentMembership } = useAuth();
  const isAdmin = currentMembership?.role === 'owner' || currentMembership?.role === 'admin';

  const [activeTab, setActiveTab] = useState<HrTab>('overview');

  // Summary Metrics
  const [summary, setSummary] = useState<HrSummaryDto | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Employees Directory
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);

  // Departments & Designations
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [designations, setDesignations] = useState<DesignationDto[]>([]);

  // My linked employee profile
  const [myEmployee, setMyEmployee] = useState<EmployeeDto | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDto | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const data = await apiClient.getHrSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load HR summary', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const loadDepartmentsAndDesignations = useCallback(async () => {
    try {
      const [depts, des] = await Promise.all([
        apiClient.getDepartments(),
        apiClient.getDesignations()
      ]);
      setDepartments(depts);
      setDesignations(des);
    } catch (err: any) {
      console.error('Failed to load departments/designations', err);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setIsEmployeesLoading(true);
    try {
      const res = await apiClient.getEmployees({
        page,
        limit: 20,
        search: search || undefined,
        departmentId: departmentFilter || undefined,
        status: statusFilter || undefined,
        employmentType: employmentTypeFilter || undefined
      });
      setEmployees(res.items);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load employees', err);
    } finally {
      setIsEmployeesLoading(false);
    }
  }, [page, search, departmentFilter, statusFilter, employmentTypeFilter]);

  const loadMyEmployee = useCallback(async () => {
    try {
      const emp = await apiClient.getMyEmployeeProfile();
      setMyEmployee(emp);
    } catch {
      // Gracefully ignore if current user has no linked employee profile
      setMyEmployee(null);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadDepartmentsAndDesignations();
    loadMyEmployee();
  }, [loadSummary, loadDepartmentsAndDesignations, loadMyEmployee]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleRefreshAll = async () => {
    await Promise.all([
      loadSummary(),
      loadDepartmentsAndDesignations(),
      loadEmployees(),
      loadMyEmployee()
    ]);
  };

  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: EmployeeDto) => {
    setEditingEmployee(emp);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-white p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Phase 9 Active — Human Resources
              </Badge>
              <span className="text-xs text-slate-500 font-medium">Workforce Directory & Operations</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <span>Human Resource Management</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
              Maintain employee profiles, departments, job designations, attendance records, and leave request workflows.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isSummaryLoading || isEmployeesLoading}
              className="gap-2 bg-white text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSummaryLoading || isEmployeesLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                onClick={handleOpenAddEmployee}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>HR Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'employees'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Employee Directory</span>
            {summary && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                {summary.totalEmployees}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'departments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Departments & Roles</span>
            {summary && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                {summary.departmentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'attendance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Daily Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'leaves'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Leave Management</span>
            {summary && summary.pendingLeavesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                {summary.pendingLeavesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <HrOverview
          summary={summary}
          isLoading={isSummaryLoading}
          onNavigateTab={setActiveTab}
          onAddEmployee={handleOpenAddEmployee}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === 'employees' && (
        <EmployeeDirectoryView
          employees={employees}
          departments={departments}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          search={search}
          onSearchChange={setSearch}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          employmentTypeFilter={employmentTypeFilter}
          onEmploymentTypeFilterChange={setEmploymentTypeFilter}
          onSelectEmployee={(id) => setSelectedEmployeeId(id)}
          onEditEmployee={handleOpenEditEmployee}
          onAddEmployee={handleOpenAddEmployee}
          isAdmin={isAdmin}
          isLoading={isEmployeesLoading}
        />
      )}

      {activeTab === 'departments' && (
        <DepartmentsView
          departments={departments}
          designations={designations}
          onRefresh={handleRefreshAll}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === 'attendance' && (
        <AttendanceView
          employees={employees}
          isAdmin={isAdmin}
          myEmployee={myEmployee}
        />
      )}

      {activeTab === 'leaves' && (
        <LeaveManagementView
          employees={employees}
          isAdmin={isAdmin}
          myEmployee={myEmployee}
        />
      )}

      {/* Add / Edit Employee Modal */}
      <CreateEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialEmployee={editingEmployee}
        onSuccess={() => {
          handleRefreshAll();
        }}
      />

      {/* Employee Details Modal */}
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        isOpen={!!selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
        onEdit={handleOpenEditEmployee}
        onEmployeeDeleted={() => {
          setSelectedEmployeeId(null);
          handleRefreshAll();
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
