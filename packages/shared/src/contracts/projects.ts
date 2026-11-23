import { z } from 'zod';
import { PaginationQuerySchema, PaginatedResult } from './platform.js';

// ==========================================
// 1. Enums & Constants
// ==========================================

export const ProjectStatusSchema = z.enum([
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled'
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type ProjectPriority = z.infer<typeof ProjectPrioritySchema>;

export const ProjectMemberRoleSchema = z.enum(['lead', 'contributor', 'viewer']);
export type ProjectMemberRole = z.infer<typeof ProjectMemberRoleSchema>;

export const TaskStatusSchema = z.enum([
  'todo',
  'in_progress',
  'in_review',
  'completed',
  'cancelled'
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const MilestoneStatusSchema = z.enum(['pending', 'completed']);
export type MilestoneStatus = z.infer<typeof MilestoneStatusSchema>;

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

// ==========================================
// 2. Project Schemas & DTOs
// ==========================================

export const CreateProjectInputSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(150),
  description: z.string().trim().max(2000).optional(),
  status: ProjectStatusSchema.default('planning'),
  priority: ProjectPrioritySchema.default('medium'),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  targetEndDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  accountId: z.string().uuid().optional().nullable(),
  opportunityId: z.string().uuid().optional().nullable(),
  memberUserIds: z.array(z.string().uuid()).optional()
});
export type CreateProjectInput = z.input<typeof CreateProjectInputSchema>;

export const UpdateProjectInputSchema = CreateProjectInputSchema.partial().extend({
  actualEndDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  ownerId: z.string().uuid().optional()
});
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;

export interface ProjectMemberDto {
  id: string;
  projectId: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  role: ProjectMemberRole;
  joinedAt: string;
}

export const AddProjectMemberInputSchema = z.object({
  userId: z.string().uuid('Valid user ID is required'),
  role: ProjectMemberRoleSchema.default('contributor')
});
export type AddProjectMemberInput = z.infer<typeof AddProjectMemberInputSchema>;

export interface ProjectDto {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  ownerName?: string | null;
  startDate?: string | null;
  targetEndDate?: string | null;
  actualEndDate?: string | null;
  progressPercentage: number;
  accountId?: string | null;
  accountName?: string | null;
  opportunityId?: string | null;
  opportunityName?: string | null;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  memberCount: number;
  members?: ProjectMemberDto[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. Milestone Schemas & DTOs
// ==========================================

export const CreateMilestoneInputSchema = z.object({
  title: z.string().trim().min(1, 'Milestone title is required').max(150),
  description: z.string().trim().max(1000).optional(),
  targetDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  status: MilestoneStatusSchema.default('pending')
});
export type CreateMilestoneInput = z.input<typeof CreateMilestoneInputSchema>;

export const UpdateMilestoneInputSchema = CreateMilestoneInputSchema.partial().extend({
  completedAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable()
});
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneInputSchema>;

export interface MilestoneDto {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string | null;
  title: string;
  description?: string | null;
  targetDate?: string | null;
  status: MilestoneStatus;
  completedAt?: string | null;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Task & Subtask Schemas & DTOs
// ==========================================

export const CreateTaskInputSchema = z.object({
  projectId: z.string().uuid('Valid project ID is required'),
  milestoneId: z.string().uuid().optional().nullable(),
  parentTaskId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1, 'Task title is required').max(255),
  description: z.string().trim().max(4000).optional(),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  assigneeId: z.string().uuid().optional().nullable(),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  estimatedHours: z.number().min(0).max(1000).optional().nullable(),
  orderIndex: z.number().int().optional().default(0)
});
export type CreateTaskInput = z.input<typeof CreateTaskInputSchema>;

export const UpdateTaskInputSchema = CreateTaskInputSchema.partial().extend({
  completedAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable()
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;

export const UpdateTaskStatusInputSchema = z.object({
  status: TaskStatusSchema
});
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusInputSchema>;

export interface TaskDto {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string | null;
  milestoneId?: string | null;
  milestoneTitle?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  createdById: string;
  createdByName?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  estimatedHours?: number | null;
  orderIndex: number;
  isOverdue: boolean;
  subtaskCount: number;
  completedSubtaskCount: number;
  commentCount: number;
  subtasks?: TaskDto[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. Comments Schemas & DTOs
// ==========================================

export const CreateCommentInputSchema = z.object({
  content: z.string().trim().min(1, 'Comment text is required').max(2000),
  taskId: z.string().uuid().optional().nullable()
});
export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;

export interface CommentDto {
  id: string;
  organizationId: string;
  projectId: string;
  taskId?: string | null;
  authorId: string;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. Project Management Metrics Summary
// ==========================================

export interface ProjectSummaryDto {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  overallCompletionRate: number;
}
