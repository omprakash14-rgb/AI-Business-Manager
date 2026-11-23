import { z } from 'zod';
import { PaginationQuerySchema, PaginatedResult } from './platform.js';

// ==========================================
// 1. Enums & Constants
// ==========================================

export const EmploymentStatusSchema = z.enum([
  'active',
  'on_leave',
  'terminated'
]);
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>;

export const EmploymentTypeSchema = z.enum([
  'full_time',
  'part_time',
  'contract',
  'intern'
]);
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;

export const AttendanceStatusSchema = z.enum([
  'present',
  'absent',
  'half_day',
  'remote',
  'on_leave'
]);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

export const LeaveTypeSchema = z.enum([
  'annual',
  'sick',
  'casual',
  'unpaid',
  'maternity_paternity',
  'other'
]);
export type LeaveType = z.infer<typeof LeaveTypeSchema>;

export const LeaveStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled'
]);
export type LeaveStatus = z.infer<typeof LeaveStatusSchema>;

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  terminated: 'Terminated'
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  intern: 'Intern'
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present (In Office)',
  absent: 'Absent',
  half_day: 'Half Day',
  remote: 'Remote / WFH',
  on_leave: 'On Leave'
};

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: 'Annual Leave / Vacation',
  sick: 'Sick Leave',
  casual: 'Casual Leave',
  unpaid: 'Unpaid Leave',
  maternity_paternity: 'Maternity / Paternity',
  other: 'Other'
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled'
};

// ==========================================
// 2. Department Schemas & DTOs
// ==========================================

export const CreateDepartmentInputSchema = z.object({
  name: z.string().trim().min(1, 'Department name is required').max(100),
  code: z.string().trim().max(20).optional(),
  description: z.string().trim().max(500).optional(),
  managerId: z.string().uuid().optional().nullable()
});
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentInputSchema>;

export const UpdateDepartmentInputSchema = CreateDepartmentInputSchema.partial();
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentInputSchema>;

export interface DepartmentDto {
  id: string;
  organizationId: string;
  name: string;
  code?: string | null;
  description?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. Designation (Job Position) Schemas & DTOs
// ==========================================

export const CreateDesignationInputSchema = z.object({
  title: z.string().trim().min(1, 'Job title is required').max(100),
  code: z.string().trim().max(20).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  description: z.string().trim().max(500).optional()
});
export type CreateDesignationInput = z.infer<typeof CreateDesignationInputSchema>;

export const UpdateDesignationInputSchema = CreateDesignationInputSchema.partial();
export type UpdateDesignationInput = z.infer<typeof UpdateDesignationInputSchema>;

export interface DesignationDto {
  id: string;
  organizationId: string;
  departmentId?: string | null;
  departmentName?: string | null;
  title: string;
  code?: string | null;
  description?: string | null;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Employee Schemas & DTOs
// ==========================================

export const CreateEmployeeInputSchema = z.object({
  employeeNumber: z.string().trim().min(1, 'Employee ID / Number is required').max(50),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  workEmail: z.string().trim().email('Valid work email is required').max(255),
  workPhone: z.string().trim().max(50).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  designationId: z.string().uuid().optional().nullable(),
  reportingManagerId: z.string().uuid().optional().nullable(),
  employmentType: EmploymentTypeSchema.default('full_time'),
  status: EmploymentStatusSchema.default('active'),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Joining date must be YYYY-MM-DD format'),
  userId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(2000).optional()
});
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeInputSchema>;

export const UpdateEmployeeInputSchema = CreateEmployeeInputSchema.partial().extend({
  terminationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
});
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeInputSchema>;

export interface EmployeeDto {
  id: string;
  organizationId: string;
  userId?: string | null;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  workEmail: string;
  workPhone?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  designationId?: string | null;
  designationTitle?: string | null;
  reportingManagerId?: string | null;
  reportingManagerName?: string | null;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  joiningDate: string;
  terminationDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. Attendance Schemas & DTOs
// ==========================================

export const RecordAttendanceInputSchema = z.object({
  employeeId: z.string().uuid('Valid employee ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  status: AttendanceStatusSchema.default('present'),
  checkInTime: z.string().datetime().optional().nullable(),
  checkOutTime: z.string().datetime().optional().nullable(),
  notes: z.string().trim().max(500).optional()
});
export type RecordAttendanceInput = z.infer<typeof RecordAttendanceInputSchema>;

export const UpdateAttendanceInputSchema = RecordAttendanceInputSchema.partial();
export type UpdateAttendanceInput = z.infer<typeof UpdateAttendanceInputSchema>;

export interface AttendanceRecordDto {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  departmentName?: string | null;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. Leave Request Schemas & DTOs
// ==========================================

export const CreateLeaveRequestInputSchema = z.object({
  employeeId: z.string().uuid('Valid employee ID is required'),
  leaveType: LeaveTypeSchema.default('annual'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD format'),
  daysCount: z.coerce.number().min(0.5, 'Minimum leave is 0.5 days').max(365),
  reason: z.string().trim().max(1000).optional()
});
export type CreateLeaveRequestInput = z.infer<typeof CreateLeaveRequestInputSchema>;

export const UpdateLeaveStatusInputSchema = z.object({
  status: z.enum(['approved', 'rejected', 'cancelled']),
  approvalNotes: z.string().trim().max(500).optional()
});
export type UpdateLeaveStatusInput = z.infer<typeof UpdateLeaveStatusInputSchema>;

export interface LeaveRequestDto {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  departmentName?: string | null;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string | null;
  status: LeaveStatus;
  approvedById?: string | null;
  approverName?: string | null;
  approvalNotes?: string | null;
  decidedAt?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 7. HR Summary & Reporting DTOs
// ==========================================

export interface DepartmentDistributionDto {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  activeCount: number;
}

export interface TodayAttendanceSummaryDto {
  totalExpected: number;
  presentCount: number;
  remoteCount: number;
  halfDayCount: number;
  absentCount: number;
  onLeaveCount: number;
  attendanceRatePercent: number;
}

export interface HrSummaryDto {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
  departmentsCount: number;
  designationsCount: number;
  pendingLeavesCount: number;
  todayAttendance: TodayAttendanceSummaryDto;
  departmentDistribution: DepartmentDistributionDto[];
  recentLeaves: LeaveRequestDto[];
}
