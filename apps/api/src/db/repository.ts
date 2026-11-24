import crypto from 'crypto';
import type {
  Role,
  UserStatus,
  OrganizationStatus,
  MembershipStatus,
  InvitationStatus,
  FileVisibility,
  NotificationType,
  PaginationQuery,
  PaginatedResult,
  LeadStatus,
  LeadSource,
  CrmActivityType,
  CrmActivityStatus,
  OpportunityStage,
  AccountDto,
  CreateAccountInput,
  UpdateAccountInput,
  ContactDto,
  CreateContactInput,
  UpdateContactInput,
  LeadDto,
  CreateLeadInput,
  UpdateLeadInput,
  CrmActivityDto,
  CreateCrmActivityInput,
  UpdateCrmActivityInput,
  OpportunityDto,
  ConvertLeadInput,
  ConvertLeadResultDto,
  CheckDuplicatesInput,
  DuplicateCheckResultDto,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  UpdateOpportunityStageInput,
  OpportunityStageHistoryDto,
  DetailedOpportunityDto,
  QuotationStatus,
  CreateQuotationInput,
  UpdateQuotationStatusInput,
  QuotationItemDto,
  QuotationDto,
  SalesForecastSummaryDto,
  StageSummaryDto,
  MonthlyForecastDto,
  FinancialCategoryDto,
  CreateFinancialCategoryInput,
  UpdateFinancialCategoryInput,
  FinancialCategoryType,
  FinancialTransactionDto,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  InvoiceDto,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceStatus,
  InvoiceLineItemDto,
  InvoiceLineItemInput,
  PaymentRecordDto,
  CreatePaymentInput,
  BudgetDto,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetPeriod,
  CategoryBreakdownDto,
  MonthlyCashFlowDto,
  FinancialSummaryDto,
  ProjectStatus,
  ProjectPriority,
  ProjectMemberRole,
  TaskStatus,
  TaskPriority,
  MilestoneStatus,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectDto,
  ProjectMemberDto,
  AddProjectMemberInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  MilestoneDto,
  CreateTaskInput,
  UpdateTaskInput,
  TaskDto,
  CreateCommentInput,
  CommentDto,
  ProjectSummaryDto,
  CampaignStatus,
  MarketingChannel,
  CampaignType,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignDto,
  AssociateLeadInput,
  AttributedLeadDto,
  ChannelPerformanceDto,
  MarketingSummaryDto,
  EmploymentStatus,
  EmploymentType,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DepartmentDto,
  CreateDesignationInput,
  UpdateDesignationInput,
  DesignationDto,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeDto,
  RecordAttendanceInput,
  UpdateAttendanceInput,
  AttendanceRecordDto,
  TodayAttendanceSummaryDto,
  CreateLeaveRequestInput,
  UpdateLeaveStatusInput,
  LeaveRequestDto,
  DepartmentDistributionDto,
  HrSummaryDto,
  AnalyticsDateRange,
  AnalyticsFilterQuery,
  ExecutiveDashboardDto,
  KpiMetricDto,
  ReportType,
  CrossModuleReportDto
} from '@ai-business-manager/shared';
import {
  STAGE_DEFAULT_PROBABILITIES,
  STAGE_DISPLAY_NAMES,
  MARKETING_CHANNEL_LABELS,
  REPORT_TYPE_LABELS
} from '@ai-business-manager/shared';
import { paginateCollection } from '../core/pagination/paginate.js';

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DbOrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DbSession {
  id: string; // Token hash
  userId: string;
  activeOrganizationId: string | null;
  expiresAt: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface DbInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  tokenHash: string;
  invitedById: string | null;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbAuditLog {
  id: string;
  organizationId: string | null;
  userId: string | null;
  action: string;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface DbFile {
  id: string;
  organizationId: string;
  uploadedById: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  storageProvider: string;
  visibility: FileVisibility;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbNotification {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface DbActivityEvent {
  id: string;
  organizationId: string;
  actorId: string | null;
  resourceType: string;
  resourceId: string;
  action: string;
  description: string;
  metadata: string | null;
  createdAt: string;
}

export interface DbAccount {
  id: string;
  organizationId: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  assignedToId: string | null;
  notes: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbContact {
  id: string;
  organizationId: string;
  accountId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  assignedToId: string | null;
  notes: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbLead {
  id: string;
  organizationId: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  source: LeadSource;
  status: LeadStatus;
  assignedToId: string | null;
  notes: string | null;
  estimatedValue: string | null;
  currency: string;
  convertedAt: string | null;
  convertedAccountId: string | null;
  convertedContactId: string | null;
  convertedOpportunityId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbOpportunity {
  id: string;
  organizationId: string;
  name: string;
  accountId: string | null;
  contactId: string | null;
  leadId: string | null;
  amount: string | null;
  currency: string;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate: string | null;
  assignedToId: string | null;
  notes: string | null;
  winLossReason: string | null;
  closedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbOpportunityStageHistory {
  id: string;
  organizationId: string;
  opportunityId: string;
  fromStage: OpportunityStage | null;
  toStage: OpportunityStage;
  changedByUserId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface DbQuotation {
  id: string;
  organizationId: string;
  opportunityId: string;
  accountId: string | null;
  contactId: string | null;
  quotationNumber: string;
  title: string;
  status: QuotationStatus;
  subtotal: string;
  taxPercent: number;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  currency: string;
  validUntil: string | null;
  notes: string | null;
  terms: string | null;
  createdById: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbQuotationItem {
  id: string;
  quotationId: string;
  organizationId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sortOrder: number;
  createdAt: string;
}

export interface DbFinancialCategory {
  id: string;
  organizationId: string;
  name: string;
  type: FinancialCategoryType;
  color: string;
  description: string | null;
  isDefault: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbFinancialTransaction {
  id: string;
  organizationId: string;
  type: TransactionType;
  categoryId: string;
  amount: string;
  currency: string;
  date: string;
  description: string;
  counterparty: string | null;
  reference: string | null;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  accountId: string | null;
  invoiceId: string | null;
  notes: string | null;
  recordedByUserId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbInvoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  accountId: string;
  contactId: string | null;
  opportunityId: string | null;
  quotationId: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: string;
  taxPercent: number;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  paidAmount: string;
  balanceDue: string;
  status: InvoiceStatus;
  notes: string | null;
  terms: string | null;
  createdByUserId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbInvoiceLineItem {
  id: string;
  invoiceId: string;
  organizationId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sortOrder: number;
  createdAt: string;
}

export interface DbPaymentRecord {
  id: string;
  organizationId: string;
  paymentNumber: string;
  invoiceId: string | null;
  accountId: string | null;
  amount: string;
  currency: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  notes: string | null;
  status: 'completed' | 'void';
  recordedByUserId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbBudget {
  id: string;
  organizationId: string;
  name: string;
  categoryId: string | null;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  budgetAmount: string;
  currency: string;
  description: string | null;
  createdByUserId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbProject {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  startDate: string | null;
  targetEndDate: string | null;
  actualEndDate: string | null;
  accountId: string | null;
  opportunityId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbProjectMember {
  id: string;
  organizationId: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  createdAt: string;
}

export interface DbProjectMilestone {
  id: string;
  organizationId: string;
  projectId: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: MilestoneStatus;
  completedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbTask {
  id: string;
  organizationId: string;
  projectId: string;
  milestoneId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  createdById: string;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  estimatedHours: number | null;
  orderIndex: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbTaskComment {
  id: string;
  organizationId: string;
  projectId: string;
  taskId: string | null;
  authorId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbCampaign {
  id: string;
  organizationId: string;
  name: string;
  type: CampaignType;
  channel: MarketingChannel;
  status: CampaignStatus;
  objective: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: string;
  actualCost: string;
  currency: string;
  ownerId: string;
  utmSource: string | null;
  utmMedium: string | null;
  notes: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbCampaignLead {
  id: string;
  organizationId: string;
  campaignId: string;
  leadId: string;
  notes: string | null;
  createdAt: string;
}

export interface DbDepartment {
  id: string;
  organizationId: string;
  name: string;
  code: string | null;
  description: string | null;
  managerId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbDesignation {
  id: string;
  organizationId: string;
  departmentId: string | null;
  title: string;
  code: string | null;
  description: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbEmployee {
  id: string;
  organizationId: string;
  userId: string | null;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  workPhone: string | null;
  departmentId: string | null;
  designationId: string | null;
  reportingManagerId: string | null;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  joiningDate: string;
  terminationDate: string | null;
  notes: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbAttendanceRecord {
  id: string;
  organizationId: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbLeaveRequest {
  id: string;
  organizationId: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: LeaveStatus;
  approvedById: string | null;
  approvalNotes: string | null;
  decidedAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbCrmActivity {
  id: string;
  organizationId: string;
  leadId: string | null;
  contactId: string | null;
  accountId: string | null;
  type: CrmActivityType;
  subject: string;
  description: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  status: CrmActivityStatus;
  createdByUserId: string;
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrgResult {
  organization: DbOrganization;
  membership: DbOrganizationMember;
}

export interface MemberWithUser extends DbOrganizationMember {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

/**
 * Thread-safe In-Memory Repository providing full fidelity for development,
 * fully conforming to the PostgreSQL / Drizzle relational model and constraints.
 */
class InMemoryRepository {
  private users = new Map<string, DbUser>();
  private organizations = new Map<string, DbOrganization>();
  private members = new Map<string, DbOrganizationMember>();
  private sessions = new Map<string, DbSession>();
  private invitations = new Map<string, DbInvitation>();
  private auditLogs: DbAuditLog[] = [];
  private files = new Map<string, DbFile>();
  private notifications = new Map<string, DbNotification>();
  private activityEvents: DbActivityEvent[] = [];
  private accounts = new Map<string, DbAccount>();
  private contacts = new Map<string, DbContact>();
  private leads = new Map<string, DbLead>();
  private opportunities = new Map<string, DbOpportunity>();
  private opportunityStageHistory = new Map<string, DbOpportunityStageHistory>();
  private quotations = new Map<string, DbQuotation>();
  private quotationItems = new Map<string, DbQuotationItem>();
  private quotationCounter = 1000;
  private crmActivities = new Map<string, DbCrmActivity>();
  private financialCategories = new Map<string, DbFinancialCategory>();
  private financialTransactions = new Map<string, DbFinancialTransaction>();
  private invoices = new Map<string, DbInvoice>();
  private invoiceLineItems = new Map<string, DbInvoiceLineItem>();
  private paymentRecords = new Map<string, DbPaymentRecord>();
  private budgets = new Map<string, DbBudget>();
  private invoiceCounter = 1000;
  private paymentCounter = 1000;
  private projects = new Map<string, DbProject>();
  private projectMembers = new Map<string, DbProjectMember>();
  private projectMilestones = new Map<string, DbProjectMilestone>();
  private tasks = new Map<string, DbTask>();
  private taskComments = new Map<string, DbTaskComment>();
  private campaigns = new Map<string, DbCampaign>();
  private campaignLeads = new Map<string, DbCampaignLead>();
  private departments = new Map<string, DbDepartment>();
  private designations = new Map<string, DbDesignation>();
  private employees = new Map<string, DbEmployee>();
  private attendanceRecords = new Map<string, DbAttendanceRecord>();
  private leaveRequests = new Map<string, DbLeaveRequest>();

  // ==========================================
  // Users
  // ==========================================

  async findUserByEmail(email: string): Promise<DbUser | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalized) return user;
    }
    return null;
  }

  async findUserById(id: string): Promise<DbUser | null> {
    return this.users.get(id) || null;
  }

  async createUser(data: { email: string; passwordHash: string; fullName: string; avatarUrl?: string | null }): Promise<DbUser> {
    const normalized = data.email.trim().toLowerCase();
    const existing = await this.findUserByEmail(normalized);
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const now = new Date().toISOString();
    const user: DbUser = {
      id: crypto.randomUUID(),
      email: normalized,
      passwordHash: data.passwordHash,
      fullName: data.fullName.trim(),
      avatarUrl: data.avatarUrl || null,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, data: { fullName?: string; avatarUrl?: string | null }): Promise<DbUser> {
    const user = await this.findUserById(id);
    if (!user) throw new Error('User not found');

    const updated: DbUser = {
      ...user,
      fullName: data.fullName !== undefined ? data.fullName.trim() : user.fullName,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : user.avatarUrl,
      updatedAt: new Date().toISOString()
    };

    this.users.set(id, updated);
    return updated;
  }

  // ==========================================
  // Sessions
  // ==========================================

  async createSession(data: { tokenHash: string; userId: string; activeOrganizationId?: string | null; expiresAt: Date }): Promise<DbSession> {
    const now = new Date().toISOString();
    const session: DbSession = {
      id: data.tokenHash,
      userId: data.userId,
      activeOrganizationId: data.activeOrganizationId || null,
      expiresAt: data.expiresAt.toISOString(),
      createdAt: now,
      lastActiveAt: now
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async findSessionByTokenHash(tokenHash: string): Promise<DbSession | null> {
    const session = this.sessions.get(tokenHash);
    if (!session) return null;

    if (new Date(session.expiresAt) <= new Date()) {
      this.sessions.delete(tokenHash);
      return null;
    }

    session.lastActiveAt = new Date().toISOString();
    return session;
  }

  async updateSessionActiveOrg(tokenHash: string, organizationId: string): Promise<void> {
    const session = this.sessions.get(tokenHash);
    if (session) {
      session.activeOrganizationId = organizationId;
      session.lastActiveAt = new Date().toISOString();
    }
  }

  async deleteSession(tokenHash: string): Promise<void> {
    this.sessions.delete(tokenHash);
  }

  // ==========================================
  // Organizations
  // ==========================================

  async createOrganization(data: { name: string; slug?: string }, creatorUserId: string): Promise<CreateOrgResult> {
    const now = new Date().toISOString();
    const rawSlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = rawSlug;
    let counter = 1;

    while (Array.from(this.organizations.values()).some((o) => o.slug === slug)) {
      slug = `${rawSlug}-${counter++}`;
    }

    const orgId = crypto.randomUUID();
    const organization: DbOrganization = {
      id: orgId,
      name: data.name.trim(),
      slug,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    const membership: DbOrganizationMember = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: creatorUserId,
      role: 'owner',
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    this.organizations.set(orgId, organization);
    this.members.set(membership.id, membership);

    return { organization, membership };
  }

  async getFirstOrganization(): Promise<DbOrganization | null> {
    for (const org of this.organizations.values()) {
      if (org.status === 'active') {
        return org;
      }
    }
    return null;
  }

  async addMember(organizationId: string, userId: string, role: Role = 'viewer'): Promise<DbOrganizationMember> {
    const existing = await this.getMembership(organizationId, userId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const membership: DbOrganizationMember = {
      id: crypto.randomUUID(),
      organizationId,
      userId,
      role: role !== 'owner' ? role : 'viewer',
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    this.members.set(membership.id, membership);
    return membership;
  }

  async findOrganizationById(id: string): Promise<DbOrganization | null> {
    return this.organizations.get(id) || null;
  }

  async updateOrganization(id: string, data: { name?: string }): Promise<DbOrganization> {
    const org = await this.findOrganizationById(id);
    if (!org) throw new Error('Organization not found');

    const updated: DbOrganization = {
      ...org,
      name: data.name !== undefined ? data.name.trim() : org.name,
      updatedAt: new Date().toISOString()
    };

    this.organizations.set(id, updated);
    return updated;
  }

  async getUserOrganizations(userId: string): Promise<{ organization: DbOrganization; membership: DbOrganizationMember }[]> {
    const results: { organization: DbOrganization; membership: DbOrganizationMember }[] = [];
    for (const member of this.members.values()) {
      if (member.userId === userId && member.status === 'active') {
        const org = this.organizations.get(member.organizationId);
        if (org && org.status === 'active') {
          results.push({ organization: org, membership: member });
        }
      }
    }
    return results;
  }

  async getMembership(organizationId: string, userId: string): Promise<DbOrganizationMember | null> {
    for (const member of this.members.values()) {
      if (member.organizationId === organizationId && member.userId === userId) {
        return member;
      }
    }
    return null;
  }

  async getOrganizationMembers(organizationId: string): Promise<MemberWithUser[]> {
    const results: MemberWithUser[] = [];
    for (const member of this.members.values()) {
      if (member.organizationId === organizationId) {
        const user = this.users.get(member.userId);
        if (user) {
          results.push({
            ...member,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              avatarUrl: user.avatarUrl
            }
          });
        }
      }
    }
    return results;
  }

  async getMemberById(organizationId: string, memberId: string): Promise<DbOrganizationMember | null> {
    const member = this.members.get(memberId);
    if (!member || member.organizationId !== organizationId) return null;
    return member;
  }

  async updateMemberRole(organizationId: string, memberId: string, newRole: Role): Promise<{ updated: DbOrganizationMember; previousRole: Role }> {
    const member = this.members.get(memberId);
    if (!member || member.organizationId !== organizationId) {
      throw new Error('Member not found in organization');
    }

    if (member.role === 'owner') {
      throw new Error('Cannot change role of organization owner through member role management');
    }

    if (newRole === 'owner') {
      throw new Error('Cannot assign owner role through member role management');
    }

    const previousRole = member.role;
    member.role = newRole;
    member.updatedAt = new Date().toISOString();
    return { updated: member, previousRole };
  }

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    const member = this.members.get(memberId);
    if (!member || member.organizationId !== organizationId) {
      throw new Error('Member not found in organization');
    }

    if (member.role === 'owner') {
      throw new Error('Cannot remove the organization owner through member management');
    }

    this.members.delete(memberId);
  }

  // ==========================================
  // Invitations
  // ==========================================

  async createInvitation(data: { organizationId: string; email: string; role: Role; tokenHash: string; invitedById: string; expiresAt: Date }): Promise<DbInvitation> {
    const now = new Date().toISOString();
    const normalized = data.email.trim().toLowerCase();

    const existingUser = await this.findUserByEmail(normalized);
    if (existingUser) {
      const existingMember = await this.getMembership(data.organizationId, existingUser.id);
      if (existingMember && existingMember.status === 'active') {
        throw new Error('User is already a member of this organization');
      }
    }

    for (const inv of this.invitations.values()) {
      if (inv.organizationId === data.organizationId && inv.email === normalized && inv.status === 'pending') {
        inv.status = 'revoked';
      }
    }

    const assignedRole: Role = data.role && data.role !== 'owner' ? data.role : 'viewer';

    const invitation: DbInvitation = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      email: normalized,
      role: assignedRole,
      tokenHash: data.tokenHash,
      invitedById: data.invitedById,
      status: 'pending',
      expiresAt: data.expiresAt.toISOString(),
      createdAt: now,
      updatedAt: now
    };

    this.invitations.set(invitation.id, invitation);
    return invitation;
  }

  async getPendingInvitations(organizationId: string): Promise<DbInvitation[]> {
    const now = new Date();
    const results: DbInvitation[] = [];
    for (const inv of this.invitations.values()) {
      if (inv.organizationId === organizationId && inv.status === 'pending') {
        if (new Date(inv.expiresAt) <= now) {
          inv.status = 'expired';
        } else {
          results.push(inv);
        }
      }
    }
    return results;
  }

  async findPendingInvitationByEmail(email: string): Promise<DbInvitation | null> {
    const normalized = email.trim().toLowerCase();
    const now = new Date();
    for (const inv of this.invitations.values()) {
      if (inv.email.trim().toLowerCase() === normalized && inv.status === 'pending') {
        if (new Date(inv.expiresAt) <= now) {
          inv.status = 'expired';
          continue;
        }
        return inv;
      }
    }
    return null;
  }

  async findInvitationByTokenHash(tokenHash: string): Promise<DbInvitation | null> {
    for (const inv of this.invitations.values()) {
      if (inv.tokenHash === tokenHash) {
        if (inv.status === 'pending' && new Date(inv.expiresAt) <= new Date()) {
          inv.status = 'expired';
        }
        return inv;
      }
    }
    return null;
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<{ membership: DbOrganizationMember }> {
    const inv = this.invitations.get(invitationId);
    if (!inv || inv.status !== 'pending') {
      throw new Error('Invalid or expired invitation');
    }
    if (new Date(inv.expiresAt) <= new Date()) {
      inv.status = 'expired';
      throw new Error('Invitation has expired');
    }

    const user = await this.findUserById(userId);
    if (!user) throw new Error('User not found');

    const assignedRole: Role = inv.role && inv.role !== 'owner' ? inv.role : 'viewer';

    const existingMember = await this.getMembership(inv.organizationId, userId);
    if (existingMember) {
      existingMember.role = assignedRole;
      existingMember.status = 'active';
      existingMember.updatedAt = new Date().toISOString();
      inv.status = 'accepted';
      inv.updatedAt = new Date().toISOString();
      return { membership: existingMember };
    }

    const now = new Date().toISOString();
    const membership: DbOrganizationMember = {
      id: crypto.randomUUID(),
      organizationId: inv.organizationId,
      userId,
      role: assignedRole,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    this.members.set(membership.id, membership);
    inv.status = 'accepted';
    inv.updatedAt = now;

    return { membership };
  }

  async revokeInvitation(organizationId: string, invitationId: string): Promise<void> {
    const inv = this.invitations.get(invitationId);
    if (!inv || inv.organizationId !== organizationId) {
      throw new Error('Invitation not found');
    }
    inv.status = 'revoked';
    inv.updatedAt = new Date().toISOString();
  }

  // ==========================================
  // Phase 3: Files & Storage Foundation
  // ==========================================

  async createFileMetadata(data: {
    organizationId: string;
    uploadedById: string;
    fileName: string;
    fileKey: string;
    fileSize: number;
    mimeType: string;
    visibility: FileVisibility;
  }): Promise<DbFile> {
    const now = new Date().toISOString();
    const file: DbFile = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      uploadedById: data.uploadedById,
      fileName: data.fileName,
      fileKey: data.fileKey,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      storageProvider: 'local-private',
      visibility: data.visibility,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };

    this.files.set(file.id, file);
    return file;
  }

  async getFileMetadataById(id: string, organizationId: string): Promise<DbFile | null> {
    const file = this.files.get(id);
    if (!file || file.organizationId !== organizationId || file.deletedAt !== null) {
      return null;
    }
    return file;
  }

  async getFileMetadataByKey(fileKey: string, organizationId: string): Promise<DbFile | null> {
    for (const file of this.files.values()) {
      if (file.fileKey === fileKey && file.organizationId === organizationId && file.deletedAt === null) {
        return file;
      }
    }
    return null;
  }

  async listOrganizationFiles(
    organizationId: string,
    query: PaginationQuery
  ): Promise<PaginatedResult<DbFile & { uploaderName: string }>> {
    const fileList: (DbFile & { uploaderName: string })[] = [];

    for (const f of this.files.values()) {
      if (f.organizationId === organizationId && f.deletedAt === null) {
        const uploader = this.users.get(f.uploadedById);
        fileList.push({
          ...f,
          uploaderName: uploader ? uploader.fullName : 'System'
        });
      }
    }

    return paginateCollection(
      fileList,
      query,
      ['fileName', 'mimeType', 'uploaderName'],
      (item) => item.deletedAt === null
    );
  }

  async softDeleteFile(id: string, organizationId: string): Promise<void> {
    const file = await this.getFileMetadataById(id, organizationId);
    if (!file) throw new Error('File not found or already deleted');

    file.deletedAt = new Date().toISOString();
    file.updatedAt = file.deletedAt;
  }

  // ==========================================
  // Phase 3: Notifications Foundation
  // ==========================================

  async createNotification(data: {
    organizationId: string;
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
    link?: string | null;
  }): Promise<DbNotification> {
    const notif: DbNotification = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      userId: data.userId,
      title: data.title.trim(),
      body: data.body.trim(),
      type: data.type,
      link: data.link || null,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString()
    };

    this.notifications.set(notif.id, notif);
    return notif;
  }

  async getUserNotifications(
    organizationId: string,
    userId: string,
    query: PaginationQuery,
    unreadOnly?: boolean
  ): Promise<PaginatedResult<DbNotification>> {
    const list: DbNotification[] = [];

    for (const n of this.notifications.values()) {
      if (n.organizationId === organizationId && n.userId === userId) {
        if (!unreadOnly || !n.isRead) {
          list.push(n);
        }
      }
    }

    // Default sort by createdAt desc
    return paginateCollection(
      list,
      { ...query, sortBy: query.sortBy || 'createdAt', sortOrder: query.sortOrder || 'desc' },
      ['title', 'body', 'type']
    );
  }

  async getUnreadNotificationCount(organizationId: string, userId: string): Promise<number> {
    let count = 0;
    for (const n of this.notifications.values()) {
      if (n.organizationId === organizationId && n.userId === userId && !n.isRead) {
        count++;
      }
    }
    return count;
  }

  async markNotificationAsRead(id: string, organizationId: string, userId: string): Promise<void> {
    const notif = this.notifications.get(id);
    if (!notif || notif.organizationId !== organizationId || notif.userId !== userId) {
      throw new Error('Notification not found');
    }
    notif.isRead = true;
    notif.readAt = new Date().toISOString();
  }

  async markAllNotificationsAsRead(organizationId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();
    for (const notif of this.notifications.values()) {
      if (notif.organizationId === organizationId && notif.userId === userId && !notif.isRead) {
        notif.isRead = true;
        notif.readAt = now;
      }
    }
  }

  // ==========================================
  // Phase 3: Activity Events & Audit Logs
  // ==========================================

  async recordActivity(data: {
    organizationId: string;
    actorId?: string | null;
    resourceType: string;
    resourceId: string;
    action: string;
    description: string;
    metadata?: Record<string, unknown> | null;
  }): Promise<DbActivityEvent> {
    const event: DbActivityEvent = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      actorId: data.actorId || null,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      action: data.action,
      description: data.description,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      createdAt: new Date().toISOString()
    };

    this.activityEvents.unshift(event);
    return event;
  }

  async getOrganizationActivities(
    organizationId: string,
    query: PaginationQuery,
    resourceType?: string
  ): Promise<PaginatedResult<DbActivityEvent & { actorName: string }>> {
    const list: (DbActivityEvent & { actorName: string })[] = [];

    for (const act of this.activityEvents) {
      if (act.organizationId === organizationId) {
        if (!resourceType || act.resourceType === resourceType) {
          const actor = act.actorId ? this.users.get(act.actorId) : null;
          list.push({
            ...act,
            actorName: actor ? actor.fullName : 'System'
          });
        }
      }
    }

    return paginateCollection(
      list,
      { ...query, sortBy: query.sortBy || 'createdAt', sortOrder: query.sortOrder || 'desc' },
      ['action', 'description', 'resourceType', 'actorName']
    );
  }

  async createAuditLog(data: {
    organizationId?: string | null;
    userId?: string | null;
    action: string;
    metadata?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<void> {
    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      organizationId: data.organizationId || null,
      userId: data.userId || null,
      action: data.action,
      metadata: data.metadata || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      createdAt: new Date().toISOString()
    });
  }

  async getOrganizationAuditLogs(
    organizationId: string,
    query: PaginationQuery
  ): Promise<PaginatedResult<DbAuditLog & { userEmail?: string }>> {
    const list: (DbAuditLog & { userEmail?: string })[] = [];

    for (const log of this.auditLogs) {
      if (log.organizationId === organizationId) {
        const user = log.userId ? this.users.get(log.userId) : null;
        list.push({
          ...log,
          userEmail: user ? user.email : 'System'
        });
      }
    }

    return paginateCollection(
      list,
      { ...query, sortBy: query.sortBy || 'createdAt', sortOrder: query.sortOrder || 'desc' },
      ['action', 'metadata', 'ipAddress', 'userEmail']
    );
  }

  // ==========================================
  // CRM: Accounts
  // ==========================================

  async createAccount(organizationId: string, data: CreateAccountInput): Promise<DbAccount> {
    const now = new Date().toISOString();
    const account: DbAccount = {
      id: crypto.randomUUID(),
      organizationId,
      name: data.name.trim(),
      industry: data.industry?.trim() || null,
      website: data.website?.trim() || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      assignedToId: data.assignedToId || null,
      notes: data.notes?.trim() || null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.accounts.set(account.id, account);
    return account;
  }

  async getAccountById(organizationId: string, id: string): Promise<AccountDto | null> {
    const account = this.accounts.get(id);
    if (!account || account.organizationId !== organizationId || account.deletedAt) {
      return null;
    }
    const assignedUser = account.assignedToId ? this.users.get(account.assignedToId) : null;
    let contactCount = 0;
    for (const c of this.contacts.values()) {
      if (c.organizationId === organizationId && c.accountId === id && !c.deletedAt) {
        contactCount++;
      }
    }
    return {
      ...account,
      assignedToName: assignedUser ? assignedUser.fullName : null,
      contactCount
    };
  }

  async listAccounts(
    organizationId: string,
    query?: Partial<PaginationQuery> & { industry?: string }
  ): Promise<PaginatedResult<AccountDto>> {
    const list: AccountDto[] = [];
    for (const a of this.accounts.values()) {
      if (a.organizationId === organizationId && !a.deletedAt) {
        if (query?.industry && a.industry !== query.industry) {
          continue;
        }
        const assignedUser = a.assignedToId ? this.users.get(a.assignedToId) : null;
        let contactCount = 0;
        for (const c of this.contacts.values()) {
          if (c.organizationId === organizationId && c.accountId === a.id && !c.deletedAt) {
            contactCount++;
          }
        }
        list.push({
          ...a,
          assignedToName: assignedUser ? assignedUser.fullName : null,
          contactCount
        });
      }
    }
    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'createdAt',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['name', 'industry', 'email', 'phone', 'website']);
  }

  async updateAccount(
    organizationId: string,
    id: string,
    data: UpdateAccountInput
  ): Promise<DbAccount | null> {
    const account = this.accounts.get(id);
    if (!account || account.organizationId !== organizationId || account.deletedAt) {
      return null;
    }
    const updated: DbAccount = {
      ...account,
      name: data.name !== undefined ? data.name.trim() : account.name,
      industry: data.industry !== undefined ? (data.industry?.trim() || null) : account.industry,
      website: data.website !== undefined ? (data.website?.trim() || null) : account.website,
      phone: data.phone !== undefined ? (data.phone?.trim() || null) : account.phone,
      email: data.email !== undefined ? (data.email?.trim() || null) : account.email,
      address: data.address !== undefined ? (data.address?.trim() || null) : account.address,
      assignedToId: data.assignedToId !== undefined ? data.assignedToId : account.assignedToId,
      notes: data.notes !== undefined ? (data.notes?.trim() || null) : account.notes,
      updatedAt: new Date().toISOString()
    };
    this.accounts.set(id, updated);
    return updated;
  }

  async softDeleteAccount(organizationId: string, id: string): Promise<boolean> {
    const account = this.accounts.get(id);
    if (!account || account.organizationId !== organizationId || account.deletedAt) {
      return false;
    }
    account.deletedAt = new Date().toISOString();
    return true;
  }

  // ==========================================
  // CRM: Contacts
  // ==========================================

  async createContact(organizationId: string, data: CreateContactInput): Promise<DbContact> {
    const now = new Date().toISOString();
    const contact: DbContact = {
      id: crypto.randomUUID(),
      organizationId,
      accountId: data.accountId || null,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      jobTitle: data.jobTitle?.trim() || null,
      assignedToId: data.assignedToId || null,
      notes: data.notes?.trim() || null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async getContactById(organizationId: string, id: string): Promise<ContactDto | null> {
    const contact = this.contacts.get(id);
    if (!contact || contact.organizationId !== organizationId || contact.deletedAt) {
      return null;
    }
    const account = contact.accountId ? this.accounts.get(contact.accountId) : null;
    const assignedUser = contact.assignedToId ? this.users.get(contact.assignedToId) : null;
    return {
      ...contact,
      accountName: account ? account.name : null,
      assignedToName: assignedUser ? assignedUser.fullName : null
    };
  }

  async listContacts(
    organizationId: string,
    query?: Partial<PaginationQuery> & { accountId?: string }
  ): Promise<PaginatedResult<ContactDto>> {
    const list: ContactDto[] = [];
    for (const c of this.contacts.values()) {
      if (c.organizationId === organizationId && !c.deletedAt) {
        if (query?.accountId && c.accountId !== query.accountId) {
          continue;
        }
        const account = c.accountId ? this.accounts.get(c.accountId) : null;
        const assignedUser = c.assignedToId ? this.users.get(c.assignedToId) : null;
        list.push({
          ...c,
          accountName: account ? account.name : null,
          assignedToName: assignedUser ? assignedUser.fullName : null
        });
      }
    }
    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'createdAt',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'accountName']);
  }

  async updateContact(
    organizationId: string,
    id: string,
    data: UpdateContactInput
  ): Promise<DbContact | null> {
    const contact = this.contacts.get(id);
    if (!contact || contact.organizationId !== organizationId || contact.deletedAt) {
      return null;
    }
    const updated: DbContact = {
      ...contact,
      accountId: data.accountId !== undefined ? data.accountId : contact.accountId,
      firstName: data.firstName !== undefined ? data.firstName.trim() : contact.firstName,
      lastName: data.lastName !== undefined ? data.lastName.trim() : contact.lastName,
      email: data.email !== undefined ? (data.email?.trim() || null) : contact.email,
      phone: data.phone !== undefined ? (data.phone?.trim() || null) : contact.phone,
      jobTitle: data.jobTitle !== undefined ? (data.jobTitle?.trim() || null) : contact.jobTitle,
      assignedToId: data.assignedToId !== undefined ? data.assignedToId : contact.assignedToId,
      notes: data.notes !== undefined ? (data.notes?.trim() || null) : contact.notes,
      updatedAt: new Date().toISOString()
    };
    this.contacts.set(id, updated);
    return updated;
  }

  async softDeleteContact(organizationId: string, id: string): Promise<boolean> {
    const contact = this.contacts.get(id);
    if (!contact || contact.organizationId !== organizationId || contact.deletedAt) {
      return false;
    }
    contact.deletedAt = new Date().toISOString();
    return true;
  }

  // ==========================================
  // CRM: Leads
  // ==========================================

  async createLead(organizationId: string, data: CreateLeadInput): Promise<DbLead> {
    const now = new Date().toISOString();
    const lead: DbLead = {
      id: crypto.randomUUID(),
      organizationId,
      title: data.title.trim(),
      firstName: data.firstName.trim(),
      lastName: (data.lastName || '').trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      companyName: data.companyName?.trim() || null,
      source: data.source || 'website',
      status: data.status || 'new',
      assignedToId: data.assignedToId || null,
      notes: data.notes?.trim() || null,
      estimatedValue: data.estimatedValue || null,
      currency: data.currency || 'USD',
      convertedAt: null,
      convertedAccountId: null,
      convertedContactId: null,
      convertedOpportunityId: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.leads.set(lead.id, lead);
    return lead;
  }

  async getLeadById(organizationId: string, id: string): Promise<LeadDto | null> {
    const lead = this.leads.get(id);
    if (!lead || lead.organizationId !== organizationId || lead.deletedAt) {
      return null;
    }
    const assignedUser = lead.assignedToId ? this.users.get(lead.assignedToId) : null;
    const convertedAccount = lead.convertedAccountId ? this.accounts.get(lead.convertedAccountId) : null;
    const convertedContact = lead.convertedContactId ? this.contacts.get(lead.convertedContactId) : null;
    return {
      ...lead,
      assignedToName: assignedUser ? assignedUser.fullName : null,
      convertedAccountName: convertedAccount ? convertedAccount.name : null,
      convertedContactName: convertedContact ? `${convertedContact.firstName} ${convertedContact.lastName}` : null
    };
  }

  async listLeads(
    organizationId: string,
    query?: Partial<PaginationQuery> & { status?: string; source?: string; assignedToId?: string }
  ): Promise<PaginatedResult<LeadDto>> {
    const list: LeadDto[] = [];
    for (const l of this.leads.values()) {
      if (l.organizationId === organizationId && !l.deletedAt) {
        if (query?.status && l.status !== query.status) continue;
        if (query?.source && l.source !== query.source) continue;
        if (query?.assignedToId && l.assignedToId !== query.assignedToId) continue;

        const assignedUser = l.assignedToId ? this.users.get(l.assignedToId) : null;
        const convertedAccount = l.convertedAccountId ? this.accounts.get(l.convertedAccountId) : null;
        const convertedContact = l.convertedContactId ? this.contacts.get(l.convertedContactId) : null;

        list.push({
          ...l,
          assignedToName: assignedUser ? assignedUser.fullName : null,
          convertedAccountName: convertedAccount ? convertedAccount.name : null,
          convertedContactName: convertedContact ? `${convertedContact.firstName} ${convertedContact.lastName}` : null
        });
      }
    }
    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'createdAt',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['title', 'firstName', 'lastName', 'email', 'phone', 'companyName']);
  }

  async updateLead(
    organizationId: string,
    id: string,
    data: UpdateLeadInput
  ): Promise<DbLead | null> {
    const lead = this.leads.get(id);
    if (!lead || lead.organizationId !== organizationId || lead.deletedAt) {
      return null;
    }
    const updated: DbLead = {
      ...lead,
      title: data.title !== undefined ? data.title.trim() : lead.title,
      firstName: data.firstName !== undefined ? data.firstName.trim() : lead.firstName,
      lastName: data.lastName !== undefined ? data.lastName.trim() : lead.lastName,
      email: data.email !== undefined ? (data.email?.trim() || null) : lead.email,
      phone: data.phone !== undefined ? (data.phone?.trim() || null) : lead.phone,
      companyName: data.companyName !== undefined ? (data.companyName?.trim() || null) : lead.companyName,
      source: data.source !== undefined ? data.source : lead.source,
      status: data.status !== undefined ? data.status : lead.status,
      assignedToId: data.assignedToId !== undefined ? data.assignedToId : lead.assignedToId,
      notes: data.notes !== undefined ? (data.notes?.trim() || null) : lead.notes,
      estimatedValue: data.estimatedValue !== undefined ? (data.estimatedValue || null) : lead.estimatedValue,
      currency: data.currency !== undefined ? data.currency : lead.currency,
      updatedAt: new Date().toISOString()
    };
    this.leads.set(id, updated);
    return updated;
  }

  async assignLead(
    organizationId: string,
    id: string,
    assignedToId: string | null
  ): Promise<DbLead | null> {
    const lead = this.leads.get(id);
    if (!lead || lead.organizationId !== organizationId || lead.deletedAt) {
      return null;
    }
    lead.assignedToId = assignedToId;
    lead.updatedAt = new Date().toISOString();
    return lead;
  }

  async softDeleteLead(organizationId: string, id: string): Promise<boolean> {
    const lead = this.leads.get(id);
    if (!lead || lead.organizationId !== organizationId || lead.deletedAt) {
      return false;
    }
    lead.deletedAt = new Date().toISOString();
    return true;
  }

  // ==========================================
  // Sales: Opportunities & Deals
  // ==========================================

  async createOpportunity(
    organizationId: string,
    data: CreateOpportunityInput,
    actorUserId?: string
  ): Promise<DetailedOpportunityDto> {
    const now = new Date().toISOString();
    const stage = data.stage || 'prospecting';
    const probability = data.probability !== undefined ? data.probability : (STAGE_DEFAULT_PROBABILITIES[stage] ?? 10);
    const isClosed = stage === 'closed_won' || stage === 'closed_lost';

    const opp: DbOpportunity = {
      id: crypto.randomUUID(),
      organizationId,
      name: data.name.trim(),
      accountId: data.accountId || null,
      contactId: data.contactId || null,
      leadId: data.leadId || null,
      amount: data.amount || '0.00',
      currency: data.currency || 'USD',
      stage,
      probability,
      expectedCloseDate: data.expectedCloseDate || null,
      assignedToId: data.assignedToId || null,
      notes: data.notes?.trim() || null,
      winLossReason: null,
      closedAt: isClosed ? now : null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.opportunities.set(opp.id, opp);

    // Initial stage history
    const historyId = crypto.randomUUID();
    const historyEntry: DbOpportunityStageHistory = {
      id: historyId,
      organizationId,
      opportunityId: opp.id,
      fromStage: null,
      toStage: stage,
      changedByUserId: actorUserId || null,
      notes: 'Initial creation',
      createdAt: now
    };
    this.opportunityStageHistory.set(historyId, historyEntry);

    // Log activity and audit
    if (actorUserId) {
      await this.recordActivity({
        organizationId,
        actorId: actorUserId,
        resourceType: 'opportunity',
        resourceId: opp.id,
        action: 'OPPORTUNITY_CREATED',
        description: `Created opportunity "${opp.name}" at stage "${stage}"`,
        metadata: {
          opportunityId: opp.id,
          amount: opp.amount,
          stage: opp.stage
        }
      });

      await this.createAuditLog({
        organizationId,
        userId: actorUserId,
        action: 'SALES_OPPORTUNITY_CREATE',
        metadata: JSON.stringify({
          opportunityId: opp.id,
          name: opp.name,
          amount: opp.amount,
          stage: opp.stage
        })
      });
    }

    return (await this.getOpportunityById(organizationId, opp.id))!;
  }

  async getOpportunityById(organizationId: string, id: string): Promise<DetailedOpportunityDto | null> {
    const opp = this.opportunities.get(id);
    if (!opp || opp.organizationId !== organizationId || opp.deletedAt) return null;
    const account = opp.accountId ? this.accounts.get(opp.accountId) : null;
    const contact = opp.contactId ? this.contacts.get(opp.contactId) : null;
    const lead = opp.leadId ? this.leads.get(opp.leadId) : null;
    const assignedUser = opp.assignedToId ? this.users.get(opp.assignedToId) : null;

    const history = await this.getOpportunityStageHistory(organizationId, id);

    return {
      ...opp,
      amount: opp.amount || '0.00',
      accountName: account ? account.name : null,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
      leadTitle: lead ? lead.title : null,
      assignedToName: assignedUser ? assignedUser.fullName : null,
      stageHistory: history
    };
  }

  async listOpportunities(
    organizationId: string,
    query?: Partial<PaginationQuery> & {
      stage?: OpportunityStage;
      accountId?: string;
      assignedToId?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ): Promise<PaginatedResult<DetailedOpportunityDto>> {
    const list: DetailedOpportunityDto[] = [];
    for (const opp of this.opportunities.values()) {
      if (opp.organizationId === organizationId && !opp.deletedAt) {
        if (query?.stage && opp.stage !== query.stage) continue;
        if (query?.accountId && opp.accountId !== query.accountId) continue;
        if (query?.assignedToId && opp.assignedToId !== query.assignedToId) continue;

        const numAmount = parseFloat(opp.amount || '0');
        if (query?.minAmount !== undefined && numAmount < query.minAmount) continue;
        if (query?.maxAmount !== undefined && numAmount > query.maxAmount) continue;

        const account = opp.accountId ? this.accounts.get(opp.accountId) : null;
        const contact = opp.contactId ? this.contacts.get(opp.contactId) : null;
        const lead = opp.leadId ? this.leads.get(opp.leadId) : null;
        const assignedUser = opp.assignedToId ? this.users.get(opp.assignedToId) : null;

        list.push({
          ...opp,
          amount: opp.amount || '0.00',
          accountName: account ? account.name : null,
          contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
          leadTitle: lead ? lead.title : null,
          assignedToName: assignedUser ? assignedUser.fullName : null
        });
      }
    }
    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'createdAt',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['name', 'stage', 'accountName', 'contactName', 'leadTitle']);
  }

  async updateOpportunity(
    organizationId: string,
    id: string,
    data: UpdateOpportunityInput,
    actorUserId?: string
  ): Promise<DetailedOpportunityDto | null> {
    const opp = this.opportunities.get(id);
    if (!opp || opp.organizationId !== organizationId || opp.deletedAt) return null;

    const now = new Date().toISOString();
    const stageChanged = data.stage !== undefined && data.stage !== opp.stage;
    const oldStage = opp.stage;
    const newStage = data.stage || opp.stage;

    let probability = data.probability !== undefined ? data.probability : opp.probability;
    if (stageChanged && data.probability === undefined) {
      probability = STAGE_DEFAULT_PROBABILITIES[newStage] ?? probability;
    }

    let closedAt = opp.closedAt;
    let winLossReason = data.winLossReason !== undefined ? data.winLossReason : opp.winLossReason;
    if (stageChanged) {
      if (newStage === 'closed_won' || newStage === 'closed_lost') {
        closedAt = now;
      } else {
        closedAt = null;
        winLossReason = null;
      }
    }

    const updated: DbOpportunity = {
      ...opp,
      name: data.name !== undefined ? data.name.trim() : opp.name,
      accountId: data.accountId !== undefined ? data.accountId : opp.accountId,
      contactId: data.contactId !== undefined ? data.contactId : opp.contactId,
      leadId: data.leadId !== undefined ? data.leadId : opp.leadId,
      amount: data.amount !== undefined ? data.amount : opp.amount,
      currency: data.currency !== undefined ? data.currency : opp.currency,
      stage: newStage,
      probability,
      expectedCloseDate: data.expectedCloseDate !== undefined ? data.expectedCloseDate : opp.expectedCloseDate,
      assignedToId: data.assignedToId !== undefined ? data.assignedToId : opp.assignedToId,
      notes: data.notes !== undefined ? (data.notes?.trim() || null) : opp.notes,
      winLossReason,
      closedAt,
      updatedAt: now
    };
    this.opportunities.set(id, updated);

    // If stage changed, append to stage history
    if (stageChanged) {
      const historyId = crypto.randomUUID();
      this.opportunityStageHistory.set(historyId, {
        id: historyId,
        organizationId,
        opportunityId: id,
        fromStage: oldStage,
        toStage: newStage,
        changedByUserId: actorUserId || null,
        notes: data.winLossReason || data.notes || null,
        createdAt: now
      });
    }

    if (actorUserId) {
      await this.recordActivity({
        organizationId,
        actorId: actorUserId,
        resourceType: 'opportunity',
        resourceId: id,
        action: stageChanged ? 'OPPORTUNITY_STAGE_CHANGED' : 'OPPORTUNITY_UPDATED',
        description: stageChanged
          ? `Moved opportunity "${updated.name}" from ${STAGE_DISPLAY_NAMES[oldStage]} to ${STAGE_DISPLAY_NAMES[newStage]}`
          : `Updated opportunity "${updated.name}"`,
        metadata: {
          opportunityId: id,
          oldStage,
          newStage,
          amount: updated.amount
        }
      });

      await this.createAuditLog({
        organizationId,
        userId: actorUserId,
        action: stageChanged ? 'SALES_STAGE_TRANSITION' : 'SALES_OPPORTUNITY_UPDATE',
        metadata: JSON.stringify({
          opportunityId: id,
          oldStage,
          newStage,
          amount: updated.amount
        })
      });
    }

    return await this.getOpportunityById(organizationId, id);
  }

  async updateOpportunityStage(
    organizationId: string,
    id: string,
    data: UpdateOpportunityStageInput,
    actorUserId: string
  ): Promise<DetailedOpportunityDto> {
    const opp = this.opportunities.get(id);
    if (!opp || opp.organizationId !== organizationId || opp.deletedAt) {
      throw new Error('Opportunity not found');
    }

    const prevStage = opp.stage;
    const newStage = data.stage;
    const now = new Date().toISOString();

    const isClosed = newStage === 'closed_won' || newStage === 'closed_lost';
    const closedAt = isClosed ? now : null;
    const winLossReason = isClosed ? (data.winLossReason?.trim() || null) : null;
    const probability = STAGE_DEFAULT_PROBABILITIES[newStage] ?? opp.probability;

    const updated: DbOpportunity = {
      ...opp,
      stage: newStage,
      probability,
      closedAt,
      winLossReason,
      updatedAt: now
    };
    this.opportunities.set(id, updated);

    // Stage history record
    const historyId = crypto.randomUUID();
    this.opportunityStageHistory.set(historyId, {
      id: historyId,
      organizationId,
      opportunityId: id,
      fromStage: prevStage,
      toStage: newStage,
      changedByUserId: actorUserId,
      notes: data.notes || data.winLossReason || null,
      createdAt: now
    });

    // Record activity
    await this.recordActivity({
      organizationId,
      actorId: actorUserId,
      resourceType: 'opportunity',
      resourceId: id,
      action: 'OPPORTUNITY_STAGE_CHANGED',
      description: `Transitioned deal "${opp.name}" from ${STAGE_DISPLAY_NAMES[prevStage]} to ${STAGE_DISPLAY_NAMES[newStage]}`,
      metadata: {
        opportunityId: id,
        fromStage: prevStage,
        toStage: newStage,
        reason: data.winLossReason
      }
    });

    // Audit log
    await this.createAuditLog({
      organizationId,
      userId: actorUserId,
      action: 'SALES_STAGE_TRANSITION',
      metadata: JSON.stringify({
        opportunityId: id,
        fromStage: prevStage,
        toStage: newStage,
        reason: data.winLossReason
      })
    });

    // If won or lost, notify assigned user
    if (isClosed && opp.assignedToId) {
      const stageLabel = newStage === 'closed_won' ? 'Won' : 'Lost';
      await this.createNotification({
        organizationId,
        userId: opp.assignedToId,
        title: `Deal Marked as ${stageLabel}: ${opp.name}`,
        body: `The opportunity was marked as ${stageLabel} (${opp.currency} ${opp.amount || '0.00'})${data.winLossReason ? `: "${data.winLossReason}"` : '.'}`,
        type: 'activity',
        link: `/sales/opportunities/${id}`
      });
    }

    return (await this.getOpportunityById(organizationId, id))!;
  }

  async getOpportunityStageHistory(
    organizationId: string,
    opportunityId: string
  ): Promise<OpportunityStageHistoryDto[]> {
    const list: OpportunityStageHistoryDto[] = [];
    for (const h of this.opportunityStageHistory.values()) {
      if (h.organizationId === organizationId && h.opportunityId === opportunityId) {
        const user = h.changedByUserId ? this.users.get(h.changedByUserId) : null;
        list.push({
          id: h.id,
          opportunityId: h.opportunityId,
          fromStage: h.fromStage,
          toStage: h.toStage,
          changedByUserId: h.changedByUserId || '',
          changedByName: user ? user.fullName : null,
          notes: h.notes,
          createdAt: h.createdAt
        });
      }
    }
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async softDeleteOpportunity(organizationId: string, id: string, actorUserId: string): Promise<boolean> {
    const opp = this.opportunities.get(id);
    if (!opp || opp.organizationId !== organizationId || opp.deletedAt) return false;

    opp.deletedAt = new Date().toISOString();
    opp.updatedAt = opp.deletedAt;

    await this.recordActivity({
      organizationId,
      actorId: actorUserId,
      resourceType: 'opportunity',
      resourceId: id,
      action: 'OPPORTUNITY_DELETED',
      description: `Soft-deleted deal "${opp.name}"`,
      metadata: { opportunityId: id, name: opp.name }
    });

    await this.createAuditLog({
      organizationId,
      userId: actorUserId,
      action: 'SALES_OPPORTUNITY_DELETE',
      metadata: JSON.stringify({ opportunityId: id, name: opp.name })
    });

    return true;
  }

  async getSalesForecastSummary(organizationId: string): Promise<SalesForecastSummaryDto> {
    const allOpps: DbOpportunity[] = [];
    for (const opp of this.opportunities.values()) {
      if (opp.organizationId === organizationId && !opp.deletedAt) {
        allOpps.push(opp);
      }
    }

    const stages: OpportunityStage[] = [
      'prospecting',
      'qualification',
      'proposal',
      'negotiation',
      'closed_won',
      'closed_lost'
    ];

    let totalPipelineValueNum = 0;
    let weightedForecastValueNum = 0;
    let wonRevenueNum = 0;
    let lostValueNum = 0;
    let openDealsCount = 0;
    let wonDealsCount = 0;
    let lostDealsCount = 0;

    const stageMap: Record<OpportunityStage, { count: number; totalVal: number; weightedVal: number; probSum: number }> = {
      prospecting: { count: 0, totalVal: 0, weightedVal: 0, probSum: 0 },
      qualification: { count: 0, totalVal: 0, weightedVal: 0, probSum: 0 },
      proposal: { count: 0, totalVal: 0, weightedVal: 0, probSum: 0 },
      negotiation: { count: 0, totalVal: 0, weightedVal: 0, probSum: 0 },
      closed_won: { count: 0, totalVal: 0, weightedVal: 0, probSum: 0 },
      closed_lost: { count: 0, totalVal: 0, weightedVal: 0, probSum: 0 }
    };

    const monthlyMap: Record<string, { unweighted: number; weighted: number; count: number }> = {};

    for (const opp of allOpps) {
      const amountNum = parseFloat(opp.amount || '0');
      const prob = opp.probability;
      const weightedAmount = (amountNum * prob) / 100;

      if (stageMap[opp.stage]) {
        stageMap[opp.stage].count++;
        stageMap[opp.stage].totalVal += amountNum;
        stageMap[opp.stage].weightedVal += weightedAmount;
        stageMap[opp.stage].probSum += prob;
      }

      if (opp.stage === 'closed_won') {
        wonRevenueNum += amountNum;
        wonDealsCount++;
      } else if (opp.stage === 'closed_lost') {
        lostValueNum += amountNum;
        lostDealsCount++;
      } else {
        openDealsCount++;
        totalPipelineValueNum += amountNum;
        weightedForecastValueNum += weightedAmount;

        if (opp.expectedCloseDate) {
          const monthKey = opp.expectedCloseDate.substring(0, 7);
          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { unweighted: 0, weighted: 0, count: 0 };
          }
          monthlyMap[monthKey].unweighted += amountNum;
          monthlyMap[monthKey].weighted += weightedAmount;
          monthlyMap[monthKey].count++;
        }
      }
    }

    const closedTotal = wonDealsCount + lostDealsCount;
    const winRatePercent = closedTotal > 0 ? Math.round((wonDealsCount / closedTotal) * 100 * 10) / 10 : 0;

    const stageSummaries: StageSummaryDto[] = stages.map((stg) => {
      const data = stageMap[stg];
      return {
        stage: stg,
        label: STAGE_DISPLAY_NAMES[stg],
        dealCount: data.count,
        totalValue: data.totalVal.toFixed(2),
        weightedValue: data.weightedVal.toFixed(2),
        averageProbability: data.count > 0 ? Math.round(data.probSum / data.count) : STAGE_DEFAULT_PROBABILITIES[stg]
      };
    });

    const monthlyForecast: MonthlyForecastDto[] = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        unweightedValue: data.unweighted.toFixed(2),
        weightedValue: data.weighted.toFixed(2),
        dealCount: data.count
      }));

    return {
      totalPipelineValue: totalPipelineValueNum.toFixed(2),
      weightedForecastValue: weightedForecastValueNum.toFixed(2),
      wonRevenue: wonRevenueNum.toFixed(2),
      lostValue: lostValueNum.toFixed(2),
      totalDealsCount: allOpps.length,
      openDealsCount,
      wonDealsCount,
      lostDealsCount,
      winRatePercent,
      currency: allOpps[0]?.currency || 'USD',
      stageSummaries,
      monthlyForecast
    };
  }

  // ==========================================
  // Sales: Quotations & Proposals
  // ==========================================

  async createQuotation(
    organizationId: string,
    userId: string,
    data: CreateQuotationInput
  ): Promise<QuotationDto> {
    const opp = this.opportunities.get(data.opportunityId);
    if (!opp || opp.organizationId !== organizationId || opp.deletedAt) {
      throw new Error('Opportunity not found');
    }

    const now = new Date().toISOString();
    const yearMonth = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    this.quotationCounter++;
    const quotationNumber = `QT-${yearMonth}-${String(this.quotationCounter).padStart(4, '0')}`;

    const quotationId = crypto.randomUUID();

    let subtotalNum = 0;
    const createdItems: DbQuotationItem[] = [];

    data.items.forEach((item, index) => {
      const unitPriceNum = parseFloat(item.unitPrice);
      const lineTotal = (item.quantity * unitPriceNum).toFixed(2);
      subtotalNum += parseFloat(lineTotal);

      const qItem: DbQuotationItem = {
        id: crypto.randomUUID(),
        quotationId,
        organizationId,
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: lineTotal,
        sortOrder: index + 1,
        createdAt: now
      };
      createdItems.push(qItem);
      this.quotationItems.set(qItem.id, qItem);
    });

    const subtotal = subtotalNum.toFixed(2);
    const discountAmount = data.discountAmount || '0.00';
    const discountNum = parseFloat(discountAmount);
    const subtotalAfterDiscount = Math.max(0, subtotalNum - discountNum);
    const taxPercent = data.taxPercent ?? 0;
    const taxAmount = ((subtotalAfterDiscount * taxPercent) / 100).toFixed(2);
    const totalAmount = (subtotalAfterDiscount + parseFloat(taxAmount)).toFixed(2);

    const quotation: DbQuotation = {
      id: quotationId,
      organizationId,
      opportunityId: data.opportunityId,
      accountId: data.accountId || opp.accountId || null,
      contactId: data.contactId || opp.contactId || null,
      quotationNumber,
      title: data.title.trim(),
      status: 'draft',
      subtotal,
      taxPercent,
      taxAmount,
      discountAmount,
      totalAmount,
      currency: data.currency || opp.currency || 'USD',
      validUntil: data.validUntil || null,
      notes: data.notes?.trim() || null,
      terms: data.terms?.trim() || null,
      createdById: userId,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.quotations.set(quotationId, quotation);

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'quotation',
      resourceId: quotationId,
      action: 'QUOTATION_CREATED',
      description: `Created quotation "${quotation.quotationNumber}" - "${quotation.title}" for deal "${opp.name}"`,
      metadata: {
        quotationId,
        quotationNumber,
        opportunityId: opp.id,
        totalAmount
      }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'SALES_QUOTATION_CREATE',
      metadata: JSON.stringify({
        quotationId,
        quotationNumber,
        opportunityId: opp.id,
        totalAmount
      })
    });

    return (await this.getQuotationById(organizationId, quotationId))!;
  }

  async getQuotationById(organizationId: string, id: string): Promise<QuotationDto | null> {
    const q = this.quotations.get(id);
    if (!q || q.organizationId !== organizationId || q.deletedAt) return null;

    const opp = this.opportunities.get(q.opportunityId);
    const account = q.accountId ? this.accounts.get(q.accountId) : null;
    const contact = q.contactId ? this.contacts.get(q.contactId) : null;
    const creator = this.users.get(q.createdById);

    const items: QuotationItemDto[] = [];
    for (const item of this.quotationItems.values()) {
      if (item.quotationId === id && item.organizationId === organizationId) {
        items.push({
          id: item.id,
          quotationId: item.quotationId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sortOrder: item.sortOrder
        });
      }
    }
    items.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      ...q,
      opportunityName: opp ? opp.name : null,
      accountName: account ? account.name : null,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
      createdByName: creator ? creator.fullName : null,
      items
    };
  }

  async listQuotations(
    organizationId: string,
    query?: Partial<PaginationQuery> & {
      opportunityId?: string;
      accountId?: string;
      status?: QuotationStatus;
    }
  ): Promise<PaginatedResult<QuotationDto>> {
    const list: QuotationDto[] = [];
    for (const q of this.quotations.values()) {
      if (q.organizationId === organizationId && !q.deletedAt) {
        if (query?.opportunityId && q.opportunityId !== query.opportunityId) continue;
        if (query?.accountId && q.accountId !== query.accountId) continue;
        if (query?.status && q.status !== query.status) continue;

        const opp = this.opportunities.get(q.opportunityId);
        const account = q.accountId ? this.accounts.get(q.accountId) : null;
        const contact = q.contactId ? this.contacts.get(q.contactId) : null;
        const creator = this.users.get(q.createdById);

        const items: QuotationItemDto[] = [];
        for (const item of this.quotationItems.values()) {
          if (item.quotationId === q.id && item.organizationId === organizationId) {
            items.push({
              id: item.id,
              quotationId: item.quotationId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              sortOrder: item.sortOrder
            });
          }
        }
        items.sort((a, b) => a.sortOrder - b.sortOrder);

        list.push({
          ...q,
          opportunityName: opp ? opp.name : null,
          accountName: account ? account.name : null,
          contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
          createdByName: creator ? creator.fullName : null,
          items
        });
      }
    }

    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'createdAt',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['quotationNumber', 'title', 'opportunityName', 'accountName']);
  }

  async updateQuotationStatus(
    organizationId: string,
    id: string,
    data: UpdateQuotationStatusInput,
    actorUserId: string
  ): Promise<QuotationDto | null> {
    const q = this.quotations.get(id);
    if (!q || q.organizationId !== organizationId || q.deletedAt) return null;

    const oldStatus = q.status;
    const now = new Date().toISOString();
    q.status = data.status;
    q.updatedAt = now;

    await this.recordActivity({
      organizationId,
      actorId: actorUserId,
      resourceType: 'quotation',
      resourceId: id,
      action: 'QUOTATION_STATUS_CHANGED',
      description: `Changed status of quotation "${q.quotationNumber}" from ${oldStatus} to ${data.status}`,
      metadata: {
        quotationId: id,
        quotationNumber: q.quotationNumber,
        oldStatus,
        newStatus: data.status,
        notes: data.notes
      }
    });

    await this.createAuditLog({
      organizationId,
      userId: actorUserId,
      action: 'SALES_QUOTATION_STATUS_UPDATE',
      metadata: JSON.stringify({
        quotationId: id,
        quotationNumber: q.quotationNumber,
        oldStatus,
        newStatus: data.status,
        notes: data.notes
      })
    });

    return await this.getQuotationById(organizationId, id);
  }

  async softDeleteQuotation(organizationId: string, id: string, actorUserId: string): Promise<boolean> {
    const q = this.quotations.get(id);
    if (!q || q.organizationId !== organizationId || q.deletedAt) return false;

    q.deletedAt = new Date().toISOString();
    q.updatedAt = q.deletedAt;

    await this.recordActivity({
      organizationId,
      actorId: actorUserId,
      resourceType: 'quotation',
      resourceId: id,
      action: 'QUOTATION_DELETED',
      description: `Soft-deleted quotation "${q.quotationNumber}"`,
      metadata: { quotationId: id, quotationNumber: q.quotationNumber }
    });

    await this.createAuditLog({
      organizationId,
      userId: actorUserId,
      action: 'SALES_QUOTATION_DELETE',
      metadata: JSON.stringify({ quotationId: id, quotationNumber: q.quotationNumber })
    });

    return true;
  }

  // ==========================================
  // CRM: Activities & Follow-ups
  // ==========================================

  async createCrmActivity(
    organizationId: string,
    userId: string,
    data: CreateCrmActivityInput
  ): Promise<DbCrmActivity> {
    const now = new Date().toISOString();
    const act: DbCrmActivity = {
      id: crypto.randomUUID(),
      organizationId,
      leadId: data.leadId || null,
      contactId: data.contactId || null,
      accountId: data.accountId || null,
      type: data.type || 'note',
      subject: data.subject.trim(),
      description: data.description?.trim() || null,
      scheduledAt: data.scheduledAt || null,
      completedAt: data.type === 'note' || data.type === 'call' ? now : null,
      status: data.type === 'note' || data.type === 'call' ? 'completed' : 'pending',
      createdByUserId: userId,
      assignedToUserId: data.assignedToUserId || null,
      createdAt: now,
      updatedAt: now
    };
    this.crmActivities.set(act.id, act);
    return act;
  }

  async getCrmActivityById(organizationId: string, id: string): Promise<CrmActivityDto | null> {
    const act = this.crmActivities.get(id);
    if (!act || act.organizationId !== organizationId) return null;
    const createdUser = this.users.get(act.createdByUserId);
    const assignedUser = act.assignedToUserId ? this.users.get(act.assignedToUserId) : null;
    return {
      ...act,
      createdByName: createdUser ? createdUser.fullName : null,
      assignedToName: assignedUser ? assignedUser.fullName : null
    };
  }

  async listCrmActivities(
    organizationId: string,
    query?: Partial<PaginationQuery> & {
      leadId?: string;
      contactId?: string;
      accountId?: string;
      status?: string;
      type?: string;
    }
  ): Promise<PaginatedResult<CrmActivityDto>> {
    const list: CrmActivityDto[] = [];
    for (const act of this.crmActivities.values()) {
      if (act.organizationId === organizationId) {
        if (query?.leadId && act.leadId !== query.leadId) continue;
        if (query?.contactId && act.contactId !== query.contactId) continue;
        if (query?.accountId && act.accountId !== query.accountId) continue;
        if (query?.status && act.status !== query.status) continue;
        if (query?.type && act.type !== query.type) continue;

        const createdUser = this.users.get(act.createdByUserId);
        const assignedUser = act.assignedToUserId ? this.users.get(act.assignedToUserId) : null;

        list.push({
          ...act,
          createdByName: createdUser ? createdUser.fullName : null,
          assignedToName: assignedUser ? assignedUser.fullName : null
        });
      }
    }
    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'createdAt',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['subject', 'description', 'type']);
  }

  async updateCrmActivity(
    organizationId: string,
    id: string,
    data: UpdateCrmActivityInput
  ): Promise<DbCrmActivity | null> {
    const act = this.crmActivities.get(id);
    if (!act || act.organizationId !== organizationId) return null;

    const updated: DbCrmActivity = {
      ...act,
      subject: data.subject !== undefined ? data.subject.trim() : act.subject,
      description: data.description !== undefined ? (data.description?.trim() || null) : act.description,
      scheduledAt: data.scheduledAt !== undefined ? data.scheduledAt : act.scheduledAt,
      completedAt: data.completedAt !== undefined ? data.completedAt : act.completedAt,
      status: data.status !== undefined ? data.status : act.status,
      updatedAt: new Date().toISOString()
    };
    this.crmActivities.set(id, updated);
    return updated;
  }

  // ==========================================
  // CRM: Duplicate Detection
  // ==========================================

  async checkDuplicates(
    organizationId: string,
    criteria: CheckDuplicatesInput
  ): Promise<DuplicateCheckResultDto> {
    const emailNorm = criteria.email?.trim().toLowerCase();
    const phoneNorm = criteria.phone?.trim();
    const companyNorm = criteria.companyName?.trim().toLowerCase();

    const duplicateLeads: LeadDto[] = [];
    const duplicateContacts: ContactDto[] = [];
    const duplicateAccounts: AccountDto[] = [];

    // Check Leads
    for (const l of this.leads.values()) {
      if (l.organizationId === organizationId && !l.deletedAt && l.status !== 'converted') {
        let match = false;
        if (emailNorm && l.email && l.email.toLowerCase() === emailNorm) match = true;
        if (phoneNorm && l.phone && l.phone === phoneNorm) match = true;
        if (companyNorm && l.companyName && l.companyName.toLowerCase() === companyNorm) match = true;
        if (match) {
          const assignedUser = l.assignedToId ? this.users.get(l.assignedToId) : null;
          duplicateLeads.push({
            ...l,
            assignedToName: assignedUser ? assignedUser.fullName : null
          });
        }
      }
    }

    // Check Contacts
    for (const c of this.contacts.values()) {
      if (c.organizationId === organizationId && !c.deletedAt) {
        let match = false;
        if (emailNorm && c.email && c.email.toLowerCase() === emailNorm) match = true;
        if (phoneNorm && c.phone && c.phone === phoneNorm) match = true;
        if (match) {
          const account = c.accountId ? this.accounts.get(c.accountId) : null;
          duplicateContacts.push({
            ...c,
            accountName: account ? account.name : null
          });
        }
      }
    }

    // Check Accounts
    for (const a of this.accounts.values()) {
      if (a.organizationId === organizationId && !a.deletedAt) {
        if (companyNorm && a.name.toLowerCase() === companyNorm) {
          duplicateAccounts.push(a);
        }
      }
    }

    return {
      hasPotentialDuplicates:
        duplicateLeads.length > 0 || duplicateContacts.length > 0 || duplicateAccounts.length > 0,
      duplicateLeads,
      duplicateContacts,
      duplicateAccounts
    };
  }

  // ==========================================
  // CRM: Lead Conversion (Transactional)
  // ==========================================

  async convertLead(
    organizationId: string,
    leadId: string,
    input: ConvertLeadInput,
    actorUserId: string
  ): Promise<ConvertLeadResultDto> {
    const lead = this.leads.get(leadId);
    if (!lead || lead.organizationId !== organizationId || lead.deletedAt) {
      throw new Error('Lead not found');
    }
    if (lead.status === 'converted') {
      throw new Error('Lead has already been converted');
    }

    const now = new Date().toISOString();
    let account: DbAccount | null = null;
    let contact: DbContact | null = null;
    let opportunity: DetailedOpportunityDto | null = null;

    // 1. Account resolution
    if (input.createAccount) {
      if (input.existingAccountId) {
        const existing = this.accounts.get(input.existingAccountId);
        if (!existing || existing.organizationId !== organizationId || existing.deletedAt) {
          throw new Error('Specified existing account was not found');
        }
        account = existing;
      } else {
        const accountName = (
          input.accountName ||
          lead.companyName ||
          `${lead.firstName} ${lead.lastName}`
        ).trim();
        account = await this.createAccount(organizationId, {
          name: accountName,
          phone: lead.phone || undefined,
          email: lead.email || undefined,
          assignedToId: lead.assignedToId || undefined
        });
      }
    }

    // 2. Contact resolution
    if (input.createContact) {
      if (input.existingContactId) {
        const existing = this.contacts.get(input.existingContactId);
        if (!existing || existing.organizationId !== organizationId || existing.deletedAt) {
          throw new Error('Specified existing contact was not found');
        }
        contact = existing;
      } else {
        contact = await this.createContact(organizationId, {
          accountId: account?.id || null,
          firstName: input.contactFirstName || lead.firstName,
          lastName: input.contactLastName || (lead.lastName ? lead.lastName : 'Contact'),
          email: input.contactEmail || lead.email || undefined,
          phone: input.contactPhone || lead.phone || undefined,
          jobTitle: input.contactJobTitle || undefined,
          assignedToId: lead.assignedToId || undefined
        });
      }
    }

    // 3. Opportunity resolution (Interface for future sales)
    if (input.createOpportunity) {
      opportunity = await this.createOpportunity(organizationId, {
        name: (input.opportunityName || `${lead.title} - Opportunity`).trim(),
        accountId: account?.id || null,
        contactId: contact?.id || null,
        leadId: lead.id,
        amount: input.opportunityAmount || lead.estimatedValue || '0.00',
        currency: lead.currency || 'USD',
        stage: 'prospecting',
        probability: 10,
        expectedCloseDate: input.opportunityExpectedCloseDate || null,
        assignedToId: lead.assignedToId || null
      }, actorUserId);
    }

    // 4. Preserve interaction history: associate lead's activities to new Contact and Account
    for (const act of this.crmActivities.values()) {
      if (act.organizationId === organizationId && act.leadId === leadId) {
        if (contact && !act.contactId) {
          act.contactId = contact.id;
        }
        if (account && !act.accountId) {
          act.accountId = account.id;
        }
        act.updatedAt = now;
      }
    }

    // 5. Update lead to converted
    lead.status = 'converted';
    lead.convertedAt = now;
    lead.convertedAccountId = account?.id || null;
    lead.convertedContactId = contact?.id || null;
    lead.convertedOpportunityId = opportunity?.id || null;
    lead.updatedAt = now;

    // 6. Log activity event
    await this.recordActivity({
      organizationId,
      actorId: actorUserId,
      resourceType: 'lead',
      resourceId: lead.id,
      action: 'LEAD_CONVERTED',
      description: `Converted lead "${lead.title}" into customer records`,
      metadata: {
        accountId: account?.id,
        accountName: account?.name,
        contactId: contact?.id,
        opportunityId: opportunity?.id
      }
    });

    // 7. Log audit event
    await this.createAuditLog({
      organizationId,
      userId: actorUserId,
      action: 'CRM_LEAD_CONVERT',
      metadata: JSON.stringify({
        leadId: lead.id,
        accountId: account?.id,
        contactId: contact?.id,
        opportunityId: opportunity?.id
      })
    });

    // 8. Send in-app notification to lead assignee if different from actor
    const recipientUserId = lead.assignedToId || actorUserId;
    await this.createNotification({
      organizationId,
      userId: recipientUserId,
      title: 'Lead Converted Successfully',
      body: `Lead "${lead.title}" was converted into ${account ? `Account "${account.name}"` : 'records'}.`,
      type: 'activity',
      link: `/crm/leads/${lead.id}`
    });

    const leadDto = await this.getLeadById(organizationId, lead.id);
    const accountDto = account ? await this.getAccountById(organizationId, account.id) : null;
    const contactDto = contact ? await this.getContactById(organizationId, contact.id) : null;
    const opportunityDto = opportunity ? await this.getOpportunityById(organizationId, opportunity.id) : null;

    return {
      lead: leadDto!,
      account: accountDto,
      contact: contactDto,
      opportunity: opportunityDto
    };
  }

  // ==========================================
  // Phase 6: Operational Finance — Categories
  // ==========================================

  async ensureDefaultCategories(organizationId: string): Promise<void> {
    let count = 0;
    for (const cat of this.financialCategories.values()) {
      if (cat.organizationId === organizationId && !cat.deletedAt) {
        count++;
      }
    }
    if (count > 0) return;

    const defaults = [
      // Income
      { name: 'Sales Revenue', type: 'income' as FinancialCategoryType, color: '#10b981', isDefault: true, desc: 'Revenue from direct sales & contracts' },
      { name: 'Consulting & Services', type: 'income' as FinancialCategoryType, color: '#06b6d4', isDefault: true, desc: 'Client professional services' },
      { name: 'Client Retainers', type: 'income' as FinancialCategoryType, color: '#3b82f6', isDefault: true, desc: 'Recurring monthly or annual retainers' },
      { name: 'Other Income', type: 'income' as FinancialCategoryType, color: '#8b5cf6', isDefault: true, desc: 'Miscellaneous and secondary revenue' },
      // Expense
      { name: 'Operations & Facilities', type: 'expense' as FinancialCategoryType, color: '#f97316', isDefault: true, desc: 'Rent, utilities, and daily operations' },
      { name: 'Marketing & Advertising', type: 'expense' as FinancialCategoryType, color: '#ec4899', isDefault: true, desc: 'Campaigns, ads, sponsorships, collateral' },
      { name: 'Software & Subscriptions', type: 'expense' as FinancialCategoryType, color: '#6366f1', isDefault: true, desc: 'SaaS platforms, cloud infrastructure, tooling' },
      { name: 'Travel & Entertainment', type: 'expense' as FinancialCategoryType, color: '#14b8a6', isDefault: true, desc: 'Client meetings, transport, lodging' },
      { name: 'Professional & Legal', type: 'expense' as FinancialCategoryType, color: '#eab308', isDefault: true, desc: 'Legal counsel, compliance, accounting' },
      { name: 'Hardware & Equipment', type: 'expense' as FinancialCategoryType, color: '#64748b', isDefault: true, desc: 'Computers, office hardware, peripherals' }
    ];

    const now = new Date().toISOString();
    for (const d of defaults) {
      const cat: DbFinancialCategory = {
        id: crypto.randomUUID(),
        organizationId,
        name: d.name,
        type: d.type,
        color: d.color,
        description: d.desc,
        isDefault: d.isDefault,
        deletedAt: null,
        createdAt: now,
        updatedAt: now
      };
      this.financialCategories.set(cat.id, cat);
    }
  }

  async listFinancialCategories(
    organizationId: string,
    type?: FinancialCategoryType
  ): Promise<FinancialCategoryDto[]> {
    await this.ensureDefaultCategories(organizationId);
    const list: FinancialCategoryDto[] = [];
    for (const cat of this.financialCategories.values()) {
      if (cat.organizationId === organizationId && !cat.deletedAt) {
        if (type && cat.type !== type) continue;
        list.push({
          id: cat.id,
          organizationId: cat.organizationId,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          description: cat.description,
          isDefault: cat.isDefault,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt
        });
      }
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createFinancialCategory(
    organizationId: string,
    data: CreateFinancialCategoryInput
  ): Promise<FinancialCategoryDto> {
    const now = new Date().toISOString();
    const cat: DbFinancialCategory = {
      id: crypto.randomUUID(),
      organizationId,
      name: data.name.trim(),
      type: data.type,
      color: data.color || '#64748b',
      description: data.description?.trim() || null,
      isDefault: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.financialCategories.set(cat.id, cat);
    return cat;
  }

  async updateFinancialCategory(
    organizationId: string,
    id: string,
    data: UpdateFinancialCategoryInput
  ): Promise<FinancialCategoryDto | null> {
    const cat = this.financialCategories.get(id);
    if (!cat || cat.organizationId !== organizationId || cat.deletedAt) return null;

    const updated: DbFinancialCategory = {
      ...cat,
      name: data.name !== undefined ? data.name.trim() : cat.name,
      type: data.type !== undefined ? data.type : cat.type,
      color: data.color !== undefined ? data.color : cat.color,
      description: data.description !== undefined ? (data.description?.trim() || null) : cat.description,
      updatedAt: new Date().toISOString()
    };
    this.financialCategories.set(id, updated);
    return updated;
  }

  async deleteFinancialCategory(organizationId: string, id: string): Promise<boolean> {
    const cat = this.financialCategories.get(id);
    if (!cat || cat.organizationId !== organizationId || cat.deletedAt) return false;

    // Check if in use by active transactions
    for (const tx of this.financialTransactions.values()) {
      if (tx.organizationId === organizationId && tx.categoryId === id && !tx.deletedAt) {
        throw new Error('Cannot delete category: it is currently used by one or more financial transactions.');
      }
    }

    cat.deletedAt = new Date().toISOString();
    cat.updatedAt = cat.deletedAt;
    return true;
  }

  // ==========================================
  // Phase 6: Operational Finance — Transactions
  // ==========================================

  async createFinancialTransaction(
    organizationId: string,
    userId: string,
    data: CreateTransactionInput
  ): Promise<FinancialTransactionDto> {
    await this.ensureDefaultCategories(organizationId);
    const cat = this.financialCategories.get(data.categoryId);
    if (!cat || cat.organizationId !== organizationId || cat.deletedAt) {
      throw new Error('Specified financial category was not found');
    }

    const now = new Date().toISOString();
    const tx: DbFinancialTransaction = {
      id: crypto.randomUUID(),
      organizationId,
      type: data.type,
      categoryId: data.categoryId,
      amount: parseFloat(data.amount).toFixed(2),
      currency: data.currency || 'USD',
      date: new Date(data.date).toISOString(),
      description: data.description.trim(),
      counterparty: data.counterparty?.trim() || null,
      reference: data.reference?.trim() || null,
      paymentMethod: data.paymentMethod || 'bank_transfer',
      status: data.status || 'completed',
      accountId: data.accountId || null,
      invoiceId: data.invoiceId || null,
      notes: data.notes?.trim() || null,
      recordedByUserId: userId,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.financialTransactions.set(tx.id, tx);

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'financial_transaction',
      resourceId: tx.id,
      action: tx.type === 'income' ? 'INCOME_LOGGED' : 'EXPENSE_LOGGED',
      description: `Logged ${tx.type}: "${tx.description}" (${tx.currency} ${tx.amount}) in category "${cat.name}"`,
      metadata: { transactionId: tx.id, type: tx.type, amount: tx.amount, category: cat.name }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: tx.type === 'income' ? 'FINANCE_INCOME_CREATE' : 'FINANCE_EXPENSE_CREATE',
      metadata: JSON.stringify({ transactionId: tx.id, type: tx.type, amount: tx.amount })
    });

    return (await this.getFinancialTransactionById(organizationId, tx.id))!;
  }

  async getFinancialTransactionById(
    organizationId: string,
    id: string
  ): Promise<FinancialTransactionDto | null> {
    const tx = this.financialTransactions.get(id);
    if (!tx || tx.organizationId !== organizationId || tx.deletedAt) return null;

    const cat = this.financialCategories.get(tx.categoryId);
    const account = tx.accountId ? this.accounts.get(tx.accountId) : null;
    const invoice = tx.invoiceId ? this.invoices.get(tx.invoiceId) : null;
    const user = this.users.get(tx.recordedByUserId);

    return {
      ...tx,
      categoryName: cat ? cat.name : null,
      categoryColor: cat ? cat.color : null,
      accountName: account ? account.name : null,
      invoiceNumber: invoice ? invoice.invoiceNumber : null,
      recordedByName: user ? user.fullName : null
    };
  }

  async listFinancialTransactions(
    organizationId: string,
    query?: Partial<PaginationQuery> & {
      type?: TransactionType;
      categoryId?: string;
      status?: TransactionStatus;
      startDate?: string;
      endDate?: string;
      accountId?: string;
    }
  ): Promise<PaginatedResult<FinancialTransactionDto>> {
    await this.ensureDefaultCategories(organizationId);
    const list: FinancialTransactionDto[] = [];

    const startTs = query?.startDate ? new Date(query.startDate).getTime() : null;
    const endTs = query?.endDate ? new Date(query.endDate).getTime() : null;

    for (const tx of this.financialTransactions.values()) {
      if (tx.organizationId === organizationId && !tx.deletedAt) {
        if (query?.type && tx.type !== query.type) continue;
        if (query?.categoryId && tx.categoryId !== query.categoryId) continue;
        if (query?.status && tx.status !== query.status) continue;
        if (query?.accountId && tx.accountId !== query.accountId) continue;

        const txDate = new Date(tx.date).getTime();
        if (startTs !== null && txDate < startTs) continue;
        if (endTs !== null && txDate > endTs) continue;

        const cat = this.financialCategories.get(tx.categoryId);
        const account = tx.accountId ? this.accounts.get(tx.accountId) : null;
        const invoice = tx.invoiceId ? this.invoices.get(tx.invoiceId) : null;
        const user = this.users.get(tx.recordedByUserId);

        list.push({
          ...tx,
          categoryName: cat ? cat.name : null,
          categoryColor: cat ? cat.color : null,
          accountName: account ? account.name : null,
          invoiceNumber: invoice ? invoice.invoiceNumber : null,
          recordedByName: user ? user.fullName : null
        });
      }
    }

    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'date',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['description', 'counterparty', 'reference', 'categoryName']);
  }

  async updateFinancialTransaction(
    organizationId: string,
    id: string,
    data: UpdateTransactionInput,
    userId: string
  ): Promise<FinancialTransactionDto | null> {
    const tx = this.financialTransactions.get(id);
    if (!tx || tx.organizationId !== organizationId || tx.deletedAt) return null;

    const now = new Date().toISOString();
    const updated: DbFinancialTransaction = {
      ...tx,
      type: data.type !== undefined ? data.type : tx.type,
      categoryId: data.categoryId !== undefined ? data.categoryId : tx.categoryId,
      amount: data.amount !== undefined ? parseFloat(data.amount).toFixed(2) : tx.amount,
      currency: data.currency !== undefined ? data.currency : tx.currency,
      date: data.date !== undefined ? new Date(data.date).toISOString() : tx.date,
      description: data.description !== undefined ? data.description.trim() : tx.description,
      counterparty: data.counterparty !== undefined ? (data.counterparty?.trim() || null) : tx.counterparty,
      reference: data.reference !== undefined ? (data.reference?.trim() || null) : tx.reference,
      paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : tx.paymentMethod,
      status: data.status !== undefined ? data.status : tx.status,
      accountId: data.accountId !== undefined ? data.accountId : tx.accountId,
      invoiceId: data.invoiceId !== undefined ? data.invoiceId : tx.invoiceId,
      notes: data.notes !== undefined ? (data.notes?.trim() || null) : tx.notes,
      updatedAt: now
    };
    this.financialTransactions.set(id, updated);

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'financial_transaction',
      resourceId: id,
      action: 'TRANSACTION_UPDATED',
      description: `Updated ${updated.type} transaction "${updated.description}"`,
      metadata: { transactionId: id, amount: updated.amount }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'FINANCE_TRANSACTION_UPDATE',
      metadata: JSON.stringify({ transactionId: id, amount: updated.amount })
    });

    return await this.getFinancialTransactionById(organizationId, id);
  }

  async deleteFinancialTransaction(
    organizationId: string,
    id: string,
    userId: string
  ): Promise<boolean> {
    const tx = this.financialTransactions.get(id);
    if (!tx || tx.organizationId !== organizationId || tx.deletedAt) return false;

    tx.deletedAt = new Date().toISOString();
    tx.updatedAt = tx.deletedAt;

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'financial_transaction',
      resourceId: id,
      action: 'TRANSACTION_DELETED',
      description: `Soft-deleted ${tx.type} transaction "${tx.description}"`,
      metadata: { transactionId: id, amount: tx.amount }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'FINANCE_TRANSACTION_DELETE',
      metadata: JSON.stringify({ transactionId: id, amount: tx.amount })
    });

    return true;
  }

  // ==========================================
  // Phase 6: Operational Finance — Invoices
  // ==========================================

  async createInvoice(
    organizationId: string,
    userId: string,
    data: CreateInvoiceInput
  ): Promise<InvoiceDto> {
    const account = this.accounts.get(data.accountId);
    if (!account || account.organizationId !== organizationId || account.deletedAt) {
      throw new Error('Specified customer account was not found');
    }

    const now = new Date().toISOString();
    const yearMonth = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    this.invoiceCounter++;
    const invoiceNumber = `INV-${yearMonth}-${String(this.invoiceCounter).padStart(4, '0')}`;

    const invoiceId = crypto.randomUUID();

    // Calculate line items server-side
    let subtotalNum = 0;
    data.items.forEach((item, index) => {
      const priceNum = parseFloat(item.unitPrice);
      const lineTotal = (item.quantity * priceNum).toFixed(2);
      subtotalNum += parseFloat(lineTotal);

      const lItem: DbInvoiceLineItem = {
        id: crypto.randomUUID(),
        invoiceId,
        organizationId,
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: lineTotal,
        sortOrder: index + 1,
        createdAt: now
      };
      this.invoiceLineItems.set(lItem.id, lItem);
    });

    const subtotal = subtotalNum.toFixed(2);
    const discountAmount = data.discountAmount || '0.00';
    const discountNum = parseFloat(discountAmount);
    const subtotalAfterDiscount = Math.max(0, subtotalNum - discountNum);
    const taxPercent = data.taxPercent ?? 0;
    const taxAmount = ((subtotalAfterDiscount * taxPercent) / 100).toFixed(2);
    const totalAmount = (subtotalAfterDiscount + parseFloat(taxAmount)).toFixed(2);

    const invoice: DbInvoice = {
      id: invoiceId,
      organizationId,
      invoiceNumber,
      accountId: data.accountId,
      contactId: data.contactId || null,
      opportunityId: data.opportunityId || null,
      quotationId: data.quotationId || null,
      issueDate: new Date(data.issueDate).toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      currency: data.currency || 'USD',
      subtotal,
      taxPercent,
      taxAmount,
      discountAmount,
      totalAmount,
      paidAmount: '0.00',
      balanceDue: totalAmount,
      status: 'issued',
      notes: data.notes?.trim() || null,
      terms: data.terms?.trim() || 'Payment due within 30 days of invoice date. Please remit via bank transfer.',
      createdByUserId: userId,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.invoices.set(invoiceId, invoice);

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'invoice',
      resourceId: invoiceId,
      action: 'INVOICE_CREATED',
      description: `Created invoice "${invoice.invoiceNumber}" for ${account.name} (${invoice.currency} ${invoice.totalAmount})`,
      metadata: { invoiceId, invoiceNumber, totalAmount, accountName: account.name }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'FINANCE_INVOICE_CREATE',
      metadata: JSON.stringify({ invoiceId, invoiceNumber, totalAmount })
    });

    return (await this.getInvoiceById(organizationId, invoiceId))!;
  }

  async createInvoiceFromQuotation(
    organizationId: string,
    userId: string,
    quotationId: string
  ): Promise<InvoiceDto> {
    const quote = this.quotations.get(quotationId);
    if (!quote || quote.organizationId !== organizationId || quote.deletedAt) {
      throw new Error('Quotation not found');
    }
    if (!quote.accountId) {
      throw new Error('Quotation must be linked to a customer Account before converting to an Invoice');
    }

    // Fetch quote line items
    const quoteItems: DbQuotationItem[] = [];
    for (const it of this.quotationItems.values()) {
      if (it.quotationId === quotationId && it.organizationId === organizationId) {
        quoteItems.push(it);
      }
    }
    quoteItems.sort((a, b) => a.sortOrder - b.sortOrder);

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await this.createInvoice(organizationId, userId, {
      accountId: quote.accountId,
      contactId: quote.contactId,
      opportunityId: quote.opportunityId,
      quotationId: quote.id,
      issueDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      currency: quote.currency,
      taxPercent: quote.taxPercent,
      discountAmount: quote.discountAmount,
      notes: quote.notes || undefined,
      terms: quote.terms || undefined,
      items: quoteItems.map((qi) => ({
        description: qi.description,
        quantity: qi.quantity,
        unitPrice: qi.unitPrice
      }))
    });

    // Mark quotation approved if it was still in draft/sent
    if (quote.status === 'draft' || quote.status === 'sent') {
      quote.status = 'approved';
      quote.updatedAt = new Date().toISOString();
    }

    return invoice;
  }

  async getInvoiceById(organizationId: string, id: string): Promise<InvoiceDto | null> {
    const inv = this.invoices.get(id);
    if (!inv || inv.organizationId !== organizationId || inv.deletedAt) return null;

    const account = this.accounts.get(inv.accountId);
    const contact = inv.contactId ? this.contacts.get(inv.contactId) : null;
    const opp = inv.opportunityId ? this.opportunities.get(inv.opportunityId) : null;
    const quote = inv.quotationId ? this.quotations.get(inv.quotationId) : null;
    const user = this.users.get(inv.createdByUserId);

    // Fetch line items
    const items: InvoiceLineItemDto[] = [];
    for (const item of this.invoiceLineItems.values()) {
      if (item.invoiceId === id && item.organizationId === organizationId) {
        items.push({
          id: item.id,
          invoiceId: item.invoiceId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sortOrder: item.sortOrder
        });
      }
    }
    items.sort((a, b) => a.sortOrder - b.sortOrder);

    const isPastDue = new Date(inv.dueDate).getTime() < Date.now();
    const hasBalance = parseFloat(inv.balanceDue) > 0.001;
    const isOverdue = isPastDue && hasBalance && inv.status !== 'void' && inv.status !== 'draft';

    return {
      ...inv,
      accountName: account ? account.name : null,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
      opportunityName: opp ? opp.name : null,
      quotationNumber: quote ? quote.quotationNumber : null,
      createdByName: user ? user.fullName : null,
      isOverdue,
      items
    };
  }

  async listInvoices(
    organizationId: string,
    query?: Partial<PaginationQuery> & {
      accountId?: string;
      status?: InvoiceStatus;
      isOverdue?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResult<InvoiceDto>> {
    const list: InvoiceDto[] = [];
    const nowTs = Date.now();

    const startTs = query?.startDate ? new Date(query.startDate).getTime() : null;
    const endTs = query?.endDate ? new Date(query.endDate).getTime() : null;

    for (const inv of this.invoices.values()) {
      if (inv.organizationId === organizationId && !inv.deletedAt) {
        if (query?.accountId && inv.accountId !== query.accountId) continue;
        if (query?.status && inv.status !== query.status) continue;

        const isPastDue = new Date(inv.dueDate).getTime() < nowTs;
        const hasBalance = parseFloat(inv.balanceDue) > 0.001;
        const isOverdue = isPastDue && hasBalance && inv.status !== 'void' && inv.status !== 'draft';

        if (query?.isOverdue !== undefined && isOverdue !== query.isOverdue) continue;

        const issueTs = new Date(inv.issueDate).getTime();
        if (startTs !== null && issueTs < startTs) continue;
        if (endTs !== null && issueTs > endTs) continue;

        const account = this.accounts.get(inv.accountId);
        const contact = inv.contactId ? this.contacts.get(inv.contactId) : null;
        const opp = inv.opportunityId ? this.opportunities.get(inv.opportunityId) : null;
        const quote = inv.quotationId ? this.quotations.get(inv.quotationId) : null;
        const user = this.users.get(inv.createdByUserId);

        list.push({
          ...inv,
          accountName: account ? account.name : null,
          contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
          opportunityName: opp ? opp.name : null,
          quotationNumber: quote ? quote.quotationNumber : null,
          createdByName: user ? user.fullName : null,
          isOverdue,
          items: []
        });
      }
    }

    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'issueDate',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['invoiceNumber', 'accountName', 'contactName', 'status']);
  }

  async updateInvoiceStatus(
    organizationId: string,
    id: string,
    status: InvoiceStatus,
    userId: string
  ): Promise<InvoiceDto | null> {
    const inv = this.invoices.get(id);
    if (!inv || inv.organizationId !== organizationId || inv.deletedAt) return null;

    if (inv.status === 'void' && status !== 'void') {
      throw new Error('Cannot change status of a voided invoice.');
    }

    inv.status = status;
    inv.updatedAt = new Date().toISOString();

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'invoice',
      resourceId: id,
      action: 'INVOICE_STATUS_UPDATED',
      description: `Changed status of invoice "${inv.invoiceNumber}" to ${status}`,
      metadata: { invoiceId: id, status }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'FINANCE_INVOICE_STATUS',
      metadata: JSON.stringify({ invoiceId: id, status })
    });

    return await this.getInvoiceById(organizationId, id);
  }

  async softDeleteInvoice(organizationId: string, id: string, userId: string): Promise<boolean> {
    const inv = this.invoices.get(id);
    if (!inv || inv.organizationId !== organizationId || inv.deletedAt) return false;

    // Check if payments have been recorded
    if (parseFloat(inv.paidAmount) > 0) {
      throw new Error('Cannot delete invoice with recorded payments. Void the invoice or void the payments first.');
    }

    inv.deletedAt = new Date().toISOString();
    inv.updatedAt = inv.deletedAt;

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'invoice',
      resourceId: id,
      action: 'INVOICE_DELETED',
      description: `Soft-deleted invoice "${inv.invoiceNumber}"`,
      metadata: { invoiceId: id, invoiceNumber: inv.invoiceNumber }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'FINANCE_INVOICE_DELETE',
      metadata: JSON.stringify({ invoiceId: id, invoiceNumber: inv.invoiceNumber })
    });

    return true;
  }

  // ==========================================
  // Phase 6: Operational Finance — Payments
  // ==========================================

  async recordPayment(
    organizationId: string,
    userId: string,
    data: CreatePaymentInput
  ): Promise<PaymentRecordDto> {
    const paymentAmountNum = parseFloat(data.amount);
    if (isNaN(paymentAmountNum) || paymentAmountNum <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    let invoice: DbInvoice | null = null;
    if (data.invoiceId) {
      invoice = this.invoices.get(data.invoiceId) || null;
      if (!invoice || invoice.organizationId !== organizationId || invoice.deletedAt) {
        throw new Error('Specified invoice was not found.');
      }
      if (invoice.status === 'void') {
        throw new Error('Cannot record payment against a voided invoice.');
      }

      const balanceDueNum = parseFloat(invoice.balanceDue);
      if (paymentAmountNum > balanceDueNum + 0.001) {
        throw new Error(
          `Overpayment prevented: Payment amount (${paymentAmountNum.toFixed(2)}) exceeds invoice balance due (${balanceDueNum.toFixed(2)}).`
        );
      }
    }

    const now = new Date().toISOString();
    const yearMonth = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    this.paymentCounter++;
    const paymentNumber = `PAY-${yearMonth}-${String(this.paymentCounter).padStart(4, '0')}`;

    const payment: DbPaymentRecord = {
      id: crypto.randomUUID(),
      organizationId,
      paymentNumber,
      invoiceId: data.invoiceId || null,
      accountId: data.accountId || (invoice ? invoice.accountId : null),
      amount: paymentAmountNum.toFixed(2),
      currency: data.currency || (invoice ? invoice.currency : 'USD'),
      paymentDate: new Date(data.paymentDate).toISOString(),
      paymentMethod: data.paymentMethod || 'bank_transfer',
      reference: data.reference?.trim() || null,
      notes: data.notes?.trim() || null,
      status: 'completed',
      recordedByUserId: userId,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.paymentRecords.set(payment.id, payment);

    // If attached to an invoice, transactionally update invoice balances and status
    if (invoice) {
      const currentPaid = parseFloat(invoice.paidAmount);
      const totalAmount = parseFloat(invoice.totalAmount);
      const newPaid = (currentPaid + paymentAmountNum).toFixed(2);
      const newBalance = Math.max(0, totalAmount - parseFloat(newPaid)).toFixed(2);
      const newStatus: InvoiceStatus = parseFloat(newBalance) <= 0.001 ? 'paid' : 'partially_paid';

      invoice.paidAmount = newPaid;
      invoice.balanceDue = newBalance;
      invoice.status = newStatus;
      invoice.updatedAt = now;

      // Automatically register a corresponding income transaction for financial reporting reconciliation
      await this.ensureDefaultCategories(organizationId);
      let incomeCategory: DbFinancialCategory | undefined;
      for (const c of this.financialCategories.values()) {
        if (c.organizationId === organizationId && c.type === 'income' && !c.deletedAt) {
          incomeCategory = c;
          break;
        }
      }

      if (incomeCategory) {
        const tx: DbFinancialTransaction = {
          id: crypto.randomUUID(),
          organizationId,
          type: 'income',
          categoryId: incomeCategory.id,
          amount: payment.amount,
          currency: payment.currency,
          date: payment.paymentDate,
          description: `Payment for Invoice ${invoice.invoiceNumber}`,
          counterparty: invoice.accountId ? this.accounts.get(invoice.accountId)?.name || null : null,
          reference: payment.paymentNumber,
          paymentMethod: payment.paymentMethod,
          status: 'completed',
          accountId: invoice.accountId,
          invoiceId: invoice.id,
          notes: `Auto-recorded via payment ${payment.paymentNumber}`,
          recordedByUserId: userId,
          deletedAt: null,
          createdAt: now,
          updatedAt: now
        };
        this.financialTransactions.set(tx.id, tx);
      }

      // If fully paid, send in-app notification to invoice creator
      if (newStatus === 'paid') {
        await this.createNotification({
          organizationId,
          userId: invoice.createdByUserId,
          title: `Invoice ${invoice.invoiceNumber} Paid in Full`,
          body: `Invoice has been fully settled (${invoice.currency} ${invoice.totalAmount}).`,
          type: 'activity',
          link: `/finance/invoices/${invoice.id}`
        });
      }
    }

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'payment_record',
      resourceId: payment.id,
      action: 'PAYMENT_RECORDED',
      description: `Recorded payment "${payment.paymentNumber}" (${payment.currency} ${payment.amount})${
        invoice ? ` for invoice ${invoice.invoiceNumber}` : ''
      }`,
      metadata: { paymentId: payment.id, amount: payment.amount, invoiceId: invoice?.id }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'FINANCE_PAYMENT_RECORD',
      metadata: JSON.stringify({ paymentId: payment.id, amount: payment.amount, invoiceId: invoice?.id })
    });

    return (await this.getPaymentRecordById(organizationId, payment.id))!;
  }

  async listPaymentRecords(
    organizationId: string,
    query?: Partial<PaginationQuery> & {
      invoiceId?: string;
      accountId?: string;
    }
  ): Promise<PaginatedResult<PaymentRecordDto>> {
    const list: PaymentRecordDto[] = [];
    for (const p of this.paymentRecords.values()) {
      if (p.organizationId === organizationId && !p.deletedAt) {
        if (query?.invoiceId && p.invoiceId !== query.invoiceId) continue;
        if (query?.accountId && p.accountId !== query.accountId) continue;

        const inv = p.invoiceId ? this.invoices.get(p.invoiceId) : null;
        const acc = p.accountId ? this.accounts.get(p.accountId) : null;
        const user = this.users.get(p.recordedByUserId);

        list.push({
          ...p,
          invoiceNumber: inv ? inv.invoiceNumber : null,
          accountName: acc ? acc.name : null,
          recordedByName: user ? user.fullName : null
        });
      }
    }

    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'paymentDate',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['paymentNumber', 'reference', 'accountName', 'invoiceNumber']);
  }

  async getPaymentRecordById(organizationId: string, id: string): Promise<PaymentRecordDto | null> {
    const p = this.paymentRecords.get(id);
    if (!p || p.organizationId !== organizationId || p.deletedAt) return null;

    const inv = p.invoiceId ? this.invoices.get(p.invoiceId) : null;
    const acc = p.accountId ? this.accounts.get(p.accountId) : null;
    const user = this.users.get(p.recordedByUserId);

    return {
      ...p,
      invoiceNumber: inv ? inv.invoiceNumber : null,
      accountName: acc ? acc.name : null,
      recordedByName: user ? user.fullName : null
    };
  }

  async voidPaymentRecord(organizationId: string, id: string, userId: string): Promise<boolean> {
    const p = this.paymentRecords.get(id);
    if (!p || p.organizationId !== organizationId || p.deletedAt) return false;
    if (p.status === 'void') return true;

    p.status = 'void';
    p.updatedAt = new Date().toISOString();

    // Revert invoice balances if linked
    if (p.invoiceId) {
      const inv = this.invoices.get(p.invoiceId);
      if (inv && !inv.deletedAt) {
        const paymentAmount = parseFloat(p.amount);
        const currentPaid = parseFloat(inv.paidAmount);
        const totalAmount = parseFloat(inv.totalAmount);
        const newPaid = Math.max(0, currentPaid - paymentAmount).toFixed(2);
        const newBalance = Math.min(totalAmount, totalAmount - parseFloat(newPaid)).toFixed(2);

        inv.paidAmount = newPaid;
        inv.balanceDue = newBalance;
        if (parseFloat(newPaid) <= 0.001) {
          inv.status = 'issued';
        } else {
          inv.status = 'partially_paid';
        }
        inv.updatedAt = p.updatedAt;
      }
    }

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'payment_record',
      resourceId: id,
      action: 'PAYMENT_VOIDED',
      description: `Voided payment "${p.paymentNumber}" (${p.currency} ${p.amount})`,
      metadata: { paymentId: id, amount: p.amount }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'FINANCE_PAYMENT_VOID',
      metadata: JSON.stringify({ paymentId: id, amount: p.amount })
    });

    return true;
  }

  // ==========================================
  // Phase 6: Operational Finance — Budgets
  // ==========================================

  async createBudget(
    organizationId: string,
    userId: string,
    data: CreateBudgetInput
  ): Promise<BudgetDto> {
    const now = new Date().toISOString();
    const budget: DbBudget = {
      id: crypto.randomUUID(),
      organizationId,
      name: data.name.trim(),
      categoryId: data.categoryId || null,
      period: data.period || 'quarterly',
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      budgetAmount: parseFloat(data.budgetAmount).toFixed(2),
      currency: data.currency || 'USD',
      description: data.description?.trim() || null,
      createdByUserId: userId,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.budgets.set(budget.id, budget);

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'budget',
      resourceId: budget.id,
      action: 'BUDGET_CREATED',
      description: `Created budget "${budget.name}" (${budget.currency} ${budget.budgetAmount})`,
      metadata: { budgetId: budget.id, budgetAmount: budget.budgetAmount }
    });

    await this.createAuditLog({
      organizationId,
      userId,
      action: 'FINANCE_BUDGET_CREATE',
      metadata: JSON.stringify({ budgetId: budget.id, budgetAmount: budget.budgetAmount })
    });

    return (await this.getBudgetById(organizationId, budget.id))!;
  }

  async getBudgetById(organizationId: string, id: string): Promise<BudgetDto | null> {
    const b = this.budgets.get(id);
    if (!b || b.organizationId !== organizationId || b.deletedAt) return null;

    const cat = b.categoryId ? this.financialCategories.get(b.categoryId) : null;
    const user = this.users.get(b.createdByUserId);

    // Calculate actual spent against this budget
    const startTs = new Date(b.startDate).getTime();
    const endTs = new Date(b.endDate).getTime();
    let actualSpentNum = 0;

    for (const tx of this.financialTransactions.values()) {
      if (tx.organizationId === organizationId && !tx.deletedAt && tx.type === 'expense' && tx.status === 'completed') {
        const txTs = new Date(tx.date).getTime();
        if (txTs >= startTs && txTs <= endTs) {
          if (!b.categoryId || tx.categoryId === b.categoryId) {
            actualSpentNum += parseFloat(tx.amount);
          }
        }
      }
    }

    const budgetAmountNum = parseFloat(b.budgetAmount);
    const remainingAmountNum = budgetAmountNum - actualSpentNum;
    const utilizationPercent =
      budgetAmountNum > 0 ? Math.round((actualSpentNum / budgetAmountNum) * 100) : 0;

    let status: 'on_track' | 'warning' | 'exceeded' = 'on_track';
    if (utilizationPercent > 100) {
      status = 'exceeded';
    } else if (utilizationPercent >= 80) {
      status = 'warning';
    }

    return {
      ...b,
      categoryName: cat ? cat.name : 'All Categories',
      createdByName: user ? user.fullName : null,
      actualSpent: actualSpentNum.toFixed(2),
      remainingAmount: remainingAmountNum.toFixed(2),
      utilizationPercent,
      status
    };
  }

  async listBudgets(
    organizationId: string,
    query?: Partial<PaginationQuery>
  ): Promise<PaginatedResult<BudgetDto>> {
    const list: BudgetDto[] = [];
    for (const b of this.budgets.values()) {
      if (b.organizationId === organizationId && !b.deletedAt) {
        const full = await this.getBudgetById(organizationId, b.id);
        if (full) list.push(full);
      }
    }

    const q: PaginationQuery = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      search: query?.search,
      sortBy: query?.sortBy || 'startDate',
      sortOrder: query?.sortOrder || 'desc'
    };
    return paginateCollection(list, q, ['name', 'categoryName', 'period']);
  }

  async updateBudget(
    organizationId: string,
    id: string,
    data: UpdateBudgetInput,
    userId: string
  ): Promise<BudgetDto | null> {
    const b = this.budgets.get(id);
    if (!b || b.organizationId !== organizationId || b.deletedAt) return null;

    const updated: DbBudget = {
      ...b,
      name: data.name !== undefined ? data.name.trim() : b.name,
      categoryId: data.categoryId !== undefined ? data.categoryId : b.categoryId,
      period: data.period !== undefined ? data.period : b.period,
      startDate: data.startDate !== undefined ? new Date(data.startDate).toISOString() : b.startDate,
      endDate: data.endDate !== undefined ? new Date(data.endDate).toISOString() : b.endDate,
      budgetAmount: data.budgetAmount !== undefined ? parseFloat(data.budgetAmount).toFixed(2) : b.budgetAmount,
      currency: data.currency !== undefined ? data.currency : b.currency,
      description: data.description !== undefined ? (data.description?.trim() || null) : b.description,
      updatedAt: new Date().toISOString()
    };
    this.budgets.set(id, updated);

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'budget',
      resourceId: id,
      action: 'BUDGET_UPDATED',
      description: `Updated budget "${updated.name}"`,
      metadata: { budgetId: id, budgetAmount: updated.budgetAmount }
    });

    return await this.getBudgetById(organizationId, id);
  }

  async deleteBudget(organizationId: string, id: string, userId: string): Promise<boolean> {
    const b = this.budgets.get(id);
    if (!b || b.organizationId !== organizationId || b.deletedAt) return false;

    b.deletedAt = new Date().toISOString();
    b.updatedAt = b.deletedAt;

    await this.recordActivity({
      organizationId,
      actorId: userId,
      resourceType: 'budget',
      resourceId: id,
      action: 'BUDGET_DELETED',
      description: `Soft-deleted budget "${b.name}"`,
      metadata: { budgetId: id, name: b.name }
    });

    return true;
  }

  // ==========================================
  // Phase 6: Operational Finance — Summaries & Reports
  // ==========================================

  async getFinancialSummary(
    organizationId: string,
    params?: { startDate?: string; endDate?: string; currency?: string }
  ): Promise<FinancialSummaryDto> {
    await this.ensureDefaultCategories(organizationId);

    const startTs = params?.startDate ? new Date(params.startDate).getTime() : null;
    const endTs = params?.endDate ? new Date(params.endDate).getTime() : null;
    const targetCurrency = params?.currency || 'USD';

    let totalIncomeNum = 0;
    let totalExpensesNum = 0;

    const expenseCategoryMap: Record<string, { total: number; count: number; name: string; color: string }> = {};
    const incomeCategoryMap: Record<string, { total: number; count: number; name: string; color: string }> = {};
    const monthlyMap: Record<string, { income: number; expense: number }> = {};

    // 1. Transactions evaluation
    for (const tx of this.financialTransactions.values()) {
      if (tx.organizationId === organizationId && !tx.deletedAt && tx.status === 'completed') {
        const txTs = new Date(tx.date).getTime();
        if (startTs !== null && txTs < startTs) continue;
        if (endTs !== null && txTs > endTs) continue;

        const amt = parseFloat(tx.amount);
        const monthKey = tx.date.substring(0, 7); // YYYY-MM

        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { income: 0, expense: 0 };
        }

        const cat = this.financialCategories.get(tx.categoryId);
        const catName = cat ? cat.name : 'Uncategorized';
        const catColor = cat ? cat.color : '#94a3b8';

        if (tx.type === 'income') {
          totalIncomeNum += amt;
          monthlyMap[monthKey].income += amt;

          if (!incomeCategoryMap[tx.categoryId]) {
            incomeCategoryMap[tx.categoryId] = { total: 0, count: 0, name: catName, color: catColor };
          }
          incomeCategoryMap[tx.categoryId].total += amt;
          incomeCategoryMap[tx.categoryId].count++;
        } else {
          totalExpensesNum += amt;
          monthlyMap[monthKey].expense += amt;

          if (!expenseCategoryMap[tx.categoryId]) {
            expenseCategoryMap[tx.categoryId] = { total: 0, count: 0, name: catName, color: catColor };
          }
          expenseCategoryMap[tx.categoryId].total += amt;
          expenseCategoryMap[tx.categoryId].count++;
        }
      }
    }

    // 2. Invoices evaluation (Receivables, Collections & Overdues)
    let totalReceivablesNum = 0;
    let totalPaidInvoicesNum = 0;
    let overdueInvoicesCount = 0;
    let overdueInvoicesAmountNum = 0;
    const nowTs = Date.now();

    for (const inv of this.invoices.values()) {
      if (inv.organizationId === organizationId && !inv.deletedAt) {
        if (inv.status !== 'void') {
          totalPaidInvoicesNum += parseFloat(inv.paidAmount);

          if (inv.status !== 'draft') {
            const balance = parseFloat(inv.balanceDue);
            totalReceivablesNum += balance;

            if (new Date(inv.dueDate).getTime() < nowTs && balance > 0.001) {
              overdueInvoicesCount++;
              overdueInvoicesAmountNum += balance;
            }
          }
        }
      }
    }

    // 3. Category Breakdown calculations
    const expensesByCategory: CategoryBreakdownDto[] = Object.entries(expenseCategoryMap).map(
      ([catId, val]) => ({
        categoryId: catId,
        categoryName: val.name,
        color: val.color,
        totalAmount: val.total.toFixed(2),
        transactionCount: val.count,
        percentageOfTotal: totalExpensesNum > 0 ? Math.round((val.total / totalExpensesNum) * 100) : 0
      })
    );
    expensesByCategory.sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount));

    const incomeByCategory: CategoryBreakdownDto[] = Object.entries(incomeCategoryMap).map(
      ([catId, val]) => ({
        categoryId: catId,
        categoryName: val.name,
        color: val.color,
        totalAmount: val.total.toFixed(2),
        transactionCount: val.count,
        percentageOfTotal: totalIncomeNum > 0 ? Math.round((val.total / totalIncomeNum) * 100) : 0
      })
    );
    incomeByCategory.sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount));

    // 4. Monthly cash flow chronologically sorted
    const monthlyCashFlow: MonthlyCashFlowDto[] = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, val]) => ({
        month,
        income: val.income.toFixed(2),
        expense: val.expense.toFixed(2),
        net: (val.income - val.expense).toFixed(2)
      }));

    // 5. Budget utilization rollup
    let totalBudgetedNum = 0;
    let totalActualSpentNum = 0;
    for (const b of this.budgets.values()) {
      if (b.organizationId === organizationId && !b.deletedAt) {
        totalBudgetedNum += parseFloat(b.budgetAmount);
        const full = await this.getBudgetById(organizationId, b.id);
        if (full) {
          totalActualSpentNum += parseFloat(full.actualSpent);
        }
      }
    }
    const avgUtilization =
      totalBudgetedNum > 0 ? Math.round((totalActualSpentNum / totalBudgetedNum) * 100) : 0;

    return {
      totalIncome: totalIncomeNum.toFixed(2),
      totalExpenses: totalExpensesNum.toFixed(2),
      netOperatingIncome: (totalIncomeNum - totalExpensesNum).toFixed(2),
      totalReceivables: totalReceivablesNum.toFixed(2),
      totalPaidInvoices: totalPaidInvoicesNum.toFixed(2),
      overdueInvoicesCount,
      overdueInvoicesAmount: overdueInvoicesAmountNum.toFixed(2),
      currency: targetCurrency,
      expensesByCategory,
      incomeByCategory,
      monthlyCashFlow,
      budgetUtilizationSummary: {
        totalBudgeted: totalBudgetedNum.toFixed(2),
        totalActualSpent: totalActualSpentNum.toFixed(2),
        averageUtilizationPercent: avgUtilization
      }
    };
  }

  // ==========================================
  // Phase 7: Project Management
  // ==========================================

  async createProject(
    organizationId: string,
    ownerId: string,
    data: CreateProjectInput
  ): Promise<ProjectDto> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const project: DbProject = {
      id,
      organizationId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      status: data.status || 'planning',
      priority: data.priority || 'medium',
      ownerId,
      startDate: data.startDate || null,
      targetEndDate: data.targetEndDate || null,
      actualEndDate: null,
      accountId: data.accountId || null,
      opportunityId: data.opportunityId || null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);

    // Add project owner as 'lead'
    const ownerMember: DbProjectMember = {
      id: crypto.randomUUID(),
      organizationId,
      projectId: id,
      userId: ownerId,
      role: 'lead',
      createdAt: now
    };
    this.projectMembers.set(ownerMember.id, ownerMember);

    // Add optional initial member user IDs as contributors
    if (data.memberUserIds && Array.isArray(data.memberUserIds)) {
      for (const mUserId of data.memberUserIds) {
        if (mUserId !== ownerId) {
          const pm: DbProjectMember = {
            id: crypto.randomUUID(),
            organizationId,
            projectId: id,
            userId: mUserId,
            role: 'contributor',
            createdAt: now
          };
          this.projectMembers.set(pm.id, pm);
        }
      }
    }

    const created = await this.getProjectById(organizationId, id);
    if (!created) throw new Error('Failed to retrieve newly created project');
    return created;
  }

  async getProjectById(organizationId: string, id: string): Promise<ProjectDto | null> {
    const project = this.projects.get(id);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      return null;
    }

    const owner = this.users.get(project.ownerId);
    const account = project.accountId ? this.accounts.get(project.accountId) : null;
    const opportunity = project.opportunityId ? this.opportunities.get(project.opportunityId) : null;

    // Calculate tasks metrics
    const projectTasks = Array.from(this.tasks.values()).filter(
      (t) => t.organizationId === organizationId && t.projectId === id && !t.deletedAt
    );
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
    const now = new Date();
    const overdueTasks = projectTasks.filter(
      (t) =>
        t.status !== 'completed' &&
        t.status !== 'cancelled' &&
        t.dueDate &&
        new Date(t.dueDate) < now
    ).length;

    const progressPercentage =
      project.status === 'completed'
        ? 100
        : totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    // Fetch members
    const members: ProjectMemberDto[] = Array.from(this.projectMembers.values())
      .filter((pm) => pm.organizationId === organizationId && pm.projectId === id)
      .map((pm) => {
        const u = this.users.get(pm.userId);
        return {
          id: pm.id,
          projectId: pm.projectId,
          userId: pm.userId,
          userName: u?.fullName || 'Unknown User',
          userEmail: u?.email || null,
          role: pm.role,
          joinedAt: pm.createdAt
        };
      });

    return {
      id: project.id,
      organizationId: project.organizationId,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      ownerId: project.ownerId,
      ownerName: owner?.fullName || 'Unknown User',
      startDate: project.startDate,
      targetEndDate: project.targetEndDate,
      actualEndDate: project.actualEndDate,
      progressPercentage,
      accountId: project.accountId,
      accountName: account?.name || null,
      opportunityId: project.opportunityId,
      opportunityName: opportunity?.name || null,
      totalTasks,
      completedTasks,
      overdueTasks,
      memberCount: members.length,
      members,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  async listProjects(
    organizationId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ProjectStatus;
      priority?: ProjectPriority;
      ownerId?: string;
      accountId?: string;
      opportunityId?: string;
    }
  ): Promise<PaginatedResult<ProjectDto>> {
    const list: DbProject[] = [];
    for (const p of this.projects.values()) {
      if (p.organizationId !== organizationId || p.deletedAt) continue;
      if (options?.status && p.status !== options.status) continue;
      if (options?.priority && p.priority !== options.priority) continue;
      if (options?.ownerId && p.ownerId !== options.ownerId) continue;
      if (options?.accountId && p.accountId !== options.accountId) continue;
      if (options?.opportunityId && p.opportunityId !== options.opportunityId) continue;
      if (options?.search) {
        const q = options.search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesDesc) continue;
      }
      list.push(p);
    }

    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Enrich items
    const enrichedList: ProjectDto[] = [];
    for (const p of list) {
      const full = await this.getProjectById(organizationId, p.id);
      if (full) enrichedList.push(full);
    }

    const q = {
      page: options?.page || 1,
      limit: options?.limit || 15,
      search: options?.search,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    };
    return paginateCollection(enrichedList, q, ['name', 'description', 'ownerName', 'accountName']);
  }

  async updateProject(
    organizationId: string,
    id: string,
    data: UpdateProjectInput
  ): Promise<ProjectDto> {
    const project = this.projects.get(id);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      throw new Error('Project not found');
    }

    if (data.name !== undefined) project.name = data.name.trim();
    if (data.description !== undefined) project.description = data.description?.trim() || null;
    if (data.status !== undefined) {
      project.status = data.status;
      if (data.status === 'completed' && !project.actualEndDate) {
        project.actualEndDate = new Date().toISOString();
      }
    }
    if (data.priority !== undefined) project.priority = data.priority;
    if (data.ownerId !== undefined) project.ownerId = data.ownerId;
    if (data.startDate !== undefined) project.startDate = data.startDate || null;
    if (data.targetEndDate !== undefined) project.targetEndDate = data.targetEndDate || null;
    if (data.actualEndDate !== undefined) project.actualEndDate = data.actualEndDate || null;
    if (data.accountId !== undefined) project.accountId = data.accountId || null;
    if (data.opportunityId !== undefined) project.opportunityId = data.opportunityId || null;

    project.updatedAt = new Date().toISOString();

    const updated = await this.getProjectById(organizationId, id);
    if (!updated) throw new Error('Failed to retrieve updated project');
    return updated;
  }

  async softDeleteProject(organizationId: string, id: string): Promise<boolean> {
    const project = this.projects.get(id);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      return false;
    }
    const now = new Date().toISOString();
    project.deletedAt = now;
    project.updatedAt = now;

    // Cascade soft-delete tasks, milestones, comments
    for (const t of this.tasks.values()) {
      if (t.projectId === id && !t.deletedAt) {
        t.deletedAt = now;
      }
    }
    for (const m of this.projectMilestones.values()) {
      if (m.projectId === id && !m.deletedAt) {
        m.deletedAt = now;
      }
    }
    for (const c of this.taskComments.values()) {
      if (c.projectId === id && !c.deletedAt) {
        c.deletedAt = now;
      }
    }

    return true;
  }

  async getProjectSummary(organizationId: string): Promise<ProjectSummaryDto> {
    let totalProjects = 0;
    let activeProjects = 0;
    let completedProjects = 0;

    for (const p of this.projects.values()) {
      if (p.organizationId === organizationId && !p.deletedAt) {
        totalProjects++;
        if (p.status === 'active') activeProjects++;
        if (p.status === 'completed') completedProjects++;
      }
    }

    const now = new Date();
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;

    for (const t of this.tasks.values()) {
      if (t.organizationId === organizationId && !t.deletedAt) {
        totalTasks++;
        if (t.status === 'completed') completedTasks++;
        if (t.status === 'in_progress') inProgressTasks++;
        if (
          t.status !== 'completed' &&
          t.status !== 'cancelled' &&
          t.dueDate &&
          new Date(t.dueDate) < now
        ) {
          overdueTasks++;
        }
      }
    }

    const overallCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      overallCompletionRate
    };
  }

  // ==========================================
  // Project Members
  // ==========================================

  async listProjectMembers(
    organizationId: string,
    projectId: string
  ): Promise<ProjectMemberDto[]> {
    const members: ProjectMemberDto[] = [];
    for (const pm of this.projectMembers.values()) {
      if (pm.organizationId === organizationId && pm.projectId === projectId) {
        const u = this.users.get(pm.userId);
        members.push({
          id: pm.id,
          projectId: pm.projectId,
          userId: pm.userId,
          userName: u?.fullName || 'Unknown User',
          userEmail: u?.email || null,
          role: pm.role,
          joinedAt: pm.createdAt
        });
      }
    }
    return members;
  }

  async addProjectMember(
    organizationId: string,
    projectId: string,
    data: AddProjectMemberInput
  ): Promise<ProjectMemberDto> {
    const project = this.projects.get(projectId);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      throw new Error('Project not found');
    }

    // Check if user is already a member
    for (const pm of this.projectMembers.values()) {
      if (pm.projectId === projectId && pm.userId === data.userId) {
        pm.role = data.role;
        const u = this.users.get(pm.userId);
        return {
          id: pm.id,
          projectId: pm.projectId,
          userId: pm.userId,
          userName: u?.fullName || 'Unknown User',
          userEmail: u?.email || null,
          role: pm.role,
          joinedAt: pm.createdAt
        };
      }
    }

    const now = new Date().toISOString();
    const pm: DbProjectMember = {
      id: crypto.randomUUID(),
      organizationId,
      projectId,
      userId: data.userId,
      role: data.role,
      createdAt: now
    };
    this.projectMembers.set(pm.id, pm);

    const u = this.users.get(data.userId);
    return {
      id: pm.id,
      projectId: pm.projectId,
      userId: pm.userId,
      userName: u?.fullName || 'Unknown User',
      userEmail: u?.email || null,
      role: pm.role,
      joinedAt: pm.createdAt
    };
  }

  async removeProjectMember(
    organizationId: string,
    projectId: string,
    userId: string
  ): Promise<boolean> {
    const project = this.projects.get(projectId);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      return false;
    }
    // Prevent removing the project owner
    if (project.ownerId === userId) {
      throw new Error('Cannot remove the project owner from members');
    }

    for (const [id, pm] of this.projectMembers.entries()) {
      if (pm.projectId === projectId && pm.userId === userId) {
        this.projectMembers.delete(id);
        return true;
      }
    }
    return false;
  }

  // ==========================================
  // Project Milestones
  // ==========================================

  async createMilestone(
    organizationId: string,
    projectId: string,
    data: CreateMilestoneInput
  ): Promise<MilestoneDto> {
    const project = this.projects.get(projectId);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      throw new Error('Project not found');
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const milestone: DbProjectMilestone = {
      id,
      organizationId,
      projectId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      targetDate: data.targetDate || null,
      status: data.status || 'pending',
      completedAt: data.status === 'completed' ? now : null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.projectMilestones.set(id, milestone);

    const created = await this.getMilestoneById(organizationId, id);
    if (!created) throw new Error('Failed to retrieve newly created milestone');
    return created;
  }

  async getMilestoneById(organizationId: string, id: string): Promise<MilestoneDto | null> {
    const m = this.projectMilestones.get(id);
    if (!m || m.organizationId !== organizationId || m.deletedAt) {
      return null;
    }
    const project = this.projects.get(m.projectId);

    // Calculate milestone tasks
    const mTasks = Array.from(this.tasks.values()).filter(
      (t) => t.milestoneId === id && !t.deletedAt
    );
    const totalTasks = mTasks.length;
    const completedTasks = mTasks.filter((t) => t.status === 'completed').length;
    const progressPercentage =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : m.status === 'completed'
        ? 100
        : 0;

    return {
      id: m.id,
      organizationId: m.organizationId,
      projectId: m.projectId,
      projectName: project?.name || 'Unknown Project',
      title: m.title,
      description: m.description,
      targetDate: m.targetDate,
      status: m.status,
      completedAt: m.completedAt,
      totalTasks,
      completedTasks,
      progressPercentage,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    };
  }

  async listMilestones(organizationId: string, projectId: string): Promise<MilestoneDto[]> {
    const list: MilestoneDto[] = [];
    for (const m of this.projectMilestones.values()) {
      if (m.organizationId === organizationId && m.projectId === projectId && !m.deletedAt) {
        const full = await this.getMilestoneById(organizationId, m.id);
        if (full) list.push(full);
      }
    }
    // Sort by targetDate or createdAt ascending
    list.sort((a, b) => {
      if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
      return a.createdAt.localeCompare(b.createdAt);
    });
    return list;
  }

  async updateMilestone(
    organizationId: string,
    id: string,
    data: UpdateMilestoneInput
  ): Promise<MilestoneDto> {
    const m = this.projectMilestones.get(id);
    if (!m || m.organizationId !== organizationId || m.deletedAt) {
      throw new Error('Milestone not found');
    }

    if (data.title !== undefined) m.title = data.title.trim();
    if (data.description !== undefined) m.description = data.description?.trim() || null;
    if (data.targetDate !== undefined) m.targetDate = data.targetDate || null;
    if (data.status !== undefined) {
      m.status = data.status;
      if (data.status === 'completed' && !m.completedAt) {
        m.completedAt = new Date().toISOString();
      } else if (data.status === 'pending') {
        m.completedAt = null;
      }
    }
    if (data.completedAt !== undefined) m.completedAt = data.completedAt || null;

    m.updatedAt = new Date().toISOString();

    const updated = await this.getMilestoneById(organizationId, id);
    if (!updated) throw new Error('Failed to retrieve updated milestone');
    return updated;
  }

  async softDeleteMilestone(organizationId: string, id: string): Promise<boolean> {
    const m = this.projectMilestones.get(id);
    if (!m || m.organizationId !== organizationId || m.deletedAt) {
      return false;
    }
    m.deletedAt = new Date().toISOString();
    m.updatedAt = m.deletedAt;

    // Disassociate tasks from this milestone
    for (const t of this.tasks.values()) {
      if (t.milestoneId === id) {
        t.milestoneId = null;
      }
    }

    return true;
  }

  // ==========================================
  // Tasks & Subtasks
  // ==========================================

  async createTask(
    organizationId: string,
    userId: string,
    data: CreateTaskInput
  ): Promise<TaskDto> {
    const project = this.projects.get(data.projectId);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      throw new Error('Project not found');
    }

    // Verify milestone if provided
    if (data.milestoneId) {
      const m = this.projectMilestones.get(data.milestoneId);
      if (!m || m.organizationId !== organizationId || m.deletedAt) {
        throw new Error('Milestone not found');
      }
    }

    // Verify parent task if provided (subtask creation)
    if (data.parentTaskId) {
      const parent = this.tasks.get(data.parentTaskId);
      if (!parent || parent.organizationId !== organizationId || parent.deletedAt) {
        throw new Error('Parent task not found');
      }
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const task: DbTask = {
      id,
      organizationId,
      projectId: data.projectId,
      milestoneId: data.milestoneId || null,
      parentTaskId: data.parentTaskId || null,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      assigneeId: data.assigneeId || null,
      createdById: userId,
      startDate: data.startDate || null,
      dueDate: data.dueDate || null,
      completedAt: data.status === 'completed' ? now : null,
      estimatedHours: data.estimatedHours || null,
      orderIndex: data.orderIndex || 0,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, task);

    const created = await this.getTaskById(organizationId, id);
    if (!created) throw new Error('Failed to retrieve newly created task');
    return created;
  }

  async getTaskById(organizationId: string, id: string): Promise<TaskDto | null> {
    const task = this.tasks.get(id);
    if (!task || task.organizationId !== organizationId || task.deletedAt) {
      return null;
    }

    const project = this.projects.get(task.projectId);
    const milestone = task.milestoneId ? this.projectMilestones.get(task.milestoneId) : null;
    const assignee = task.assigneeId ? this.users.get(task.assigneeId) : null;
    const creator = this.users.get(task.createdById);

    const now = new Date();
    const isOverdue =
      task.status !== 'completed' &&
      task.status !== 'cancelled' &&
      Boolean(task.dueDate && new Date(task.dueDate) < now);

    // Subtasks
    const subtaskItems: TaskDto[] = [];
    let completedSubtaskCount = 0;
    for (const t of this.tasks.values()) {
      if (t.parentTaskId === id && !t.deletedAt) {
        const u = t.assigneeId ? this.users.get(t.assigneeId) : null;
        if (t.status === 'completed') completedSubtaskCount++;
        subtaskItems.push({
          id: t.id,
          organizationId: t.organizationId,
          projectId: t.projectId,
          projectName: project?.name || null,
          milestoneId: t.milestoneId,
          milestoneTitle: null,
          parentTaskId: t.parentTaskId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assigneeId,
          assigneeName: u?.fullName || null,
          assigneeEmail: u?.email || null,
          createdById: t.createdById,
          createdByName: null,
          startDate: t.startDate,
          dueDate: t.dueDate,
          completedAt: t.completedAt,
          estimatedHours: t.estimatedHours,
          orderIndex: t.orderIndex,
          isOverdue:
            t.status !== 'completed' &&
            t.status !== 'cancelled' &&
            Boolean(t.dueDate && new Date(t.dueDate) < now),
          subtaskCount: 0,
          completedSubtaskCount: 0,
          commentCount: 0,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        });
      }
    }

    // Comments count
    let commentCount = 0;
    for (const c of this.taskComments.values()) {
      if (c.taskId === id && !c.deletedAt) commentCount++;
    }

    return {
      id: task.id,
      organizationId: task.organizationId,
      projectId: task.projectId,
      projectName: project?.name || 'Unknown Project',
      milestoneId: task.milestoneId,
      milestoneTitle: milestone?.title || null,
      parentTaskId: task.parentTaskId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      assigneeName: assignee?.fullName || null,
      assigneeEmail: assignee?.email || null,
      createdById: task.createdById,
      createdByName: creator?.fullName || 'Unknown User',
      startDate: task.startDate,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      estimatedHours: task.estimatedHours,
      orderIndex: task.orderIndex,
      isOverdue,
      subtaskCount: subtaskItems.length,
      completedSubtaskCount,
      commentCount,
      subtasks: subtaskItems,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  async listTasks(
    organizationId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      projectId?: string;
      milestoneId?: string;
      parentTaskId?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      isOverdue?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResult<TaskDto>> {
    const now = new Date();
    const list: DbTask[] = [];

    for (const t of this.tasks.values()) {
      if (t.organizationId !== organizationId || t.deletedAt) continue;
      if (options?.projectId && t.projectId !== options.projectId) continue;
      if (options?.milestoneId && t.milestoneId !== options.milestoneId) continue;
      if (options?.parentTaskId !== undefined) {
        if (options.parentTaskId === null && t.parentTaskId !== null) continue;
        if (options.parentTaskId !== null && t.parentTaskId !== options.parentTaskId) continue;
      }
      if (options?.status && t.status !== options.status) continue;
      if (options?.priority && t.priority !== options.priority) continue;
      if (options?.assigneeId && t.assigneeId !== options.assigneeId) continue;

      if (options?.isOverdue) {
        const isPastDue =
          t.status !== 'completed' &&
          t.status !== 'cancelled' &&
          Boolean(t.dueDate && new Date(t.dueDate) < now);
        if (!isPastDue) continue;
      }

      if (options?.search) {
        const q = options.search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesDesc) continue;
      }

      list.push(t);
    }

    // Sort order
    const sortField = options?.sortBy || 'createdAt';
    const sortAsc = options?.sortOrder === 'asc';

    list.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    const enrichedList: TaskDto[] = [];
    for (const t of list) {
      const full = await this.getTaskById(organizationId, t.id);
      if (full) enrichedList.push(full);
    }

    const q = {
      page: options?.page || 1,
      limit: options?.limit || 15,
      search: options?.search,
      sortBy: options?.sortBy || 'createdAt',
      sortOrder: (options?.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
    };
    return paginateCollection(enrichedList, q, ['title', 'description', 'assigneeName', 'milestoneTitle']);
  }

  async updateTask(
    organizationId: string,
    id: string,
    data: UpdateTaskInput
  ): Promise<TaskDto> {
    const task = this.tasks.get(id);
    if (!task || task.organizationId !== organizationId || task.deletedAt) {
      throw new Error('Task not found');
    }

    if (data.title !== undefined) task.title = data.title.trim();
    if (data.description !== undefined) task.description = data.description?.trim() || null;
    if (data.status !== undefined) {
      task.status = data.status;
      if (data.status === 'completed' && !task.completedAt) {
        task.completedAt = new Date().toISOString();
      } else if (data.status !== 'completed') {
        task.completedAt = null;
      }
    }
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.assigneeId !== undefined) task.assigneeId = data.assigneeId || null;
    if (data.milestoneId !== undefined) task.milestoneId = data.milestoneId || null;
    if (data.parentTaskId !== undefined) task.parentTaskId = data.parentTaskId || null;
    if (data.startDate !== undefined) task.startDate = data.startDate || null;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate || null;
    if (data.completedAt !== undefined) task.completedAt = data.completedAt || null;
    if (data.estimatedHours !== undefined) task.estimatedHours = data.estimatedHours || null;
    if (data.orderIndex !== undefined) task.orderIndex = data.orderIndex;

    task.updatedAt = new Date().toISOString();

    const updated = await this.getTaskById(organizationId, id);
    if (!updated) throw new Error('Failed to retrieve updated task');
    return updated;
  }

  async updateTaskStatus(
    organizationId: string,
    id: string,
    status: TaskStatus
  ): Promise<TaskDto> {
    const task = this.tasks.get(id);
    if (!task || task.organizationId !== organizationId || task.deletedAt) {
      throw new Error('Task not found');
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date().toISOString();
    } else {
      task.completedAt = null;
    }
    task.updatedAt = new Date().toISOString();

    const updated = await this.getTaskById(organizationId, id);
    if (!updated) throw new Error('Failed to retrieve updated task');
    return updated;
  }

  async softDeleteTask(organizationId: string, id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.organizationId !== organizationId || task.deletedAt) {
      return false;
    }
    const now = new Date().toISOString();
    task.deletedAt = now;
    task.updatedAt = now;

    // Cascade delete subtasks
    for (const t of this.tasks.values()) {
      if (t.parentTaskId === id && !t.deletedAt) {
        t.deletedAt = now;
      }
    }

    return true;
  }

  // ==========================================
  // Comments
  // ==========================================

  async createComment(
    organizationId: string,
    projectId: string,
    authorId: string,
    data: CreateCommentInput
  ): Promise<CommentDto> {
    const project = this.projects.get(projectId);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      throw new Error('Project not found');
    }

    if (data.taskId) {
      const task = this.tasks.get(data.taskId);
      if (!task || task.organizationId !== organizationId || task.deletedAt) {
        throw new Error('Task not found');
      }
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const comment: DbTaskComment = {
      id,
      organizationId,
      projectId,
      taskId: data.taskId || null,
      authorId,
      content: data.content.trim(),
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.taskComments.set(id, comment);

    const author = this.users.get(authorId);
    return {
      id: comment.id,
      organizationId: comment.organizationId,
      projectId: comment.projectId,
      taskId: comment.taskId,
      authorId: comment.authorId,
      authorName: author?.fullName || 'Unknown User',
      authorEmail: author?.email || null,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
  }

  async listComments(
    organizationId: string,
    options: {
      projectId: string;
      taskId?: string | null;
    }
  ): Promise<CommentDto[]> {
    const comments: CommentDto[] = [];
    for (const c of this.taskComments.values()) {
      if (c.organizationId === organizationId && c.projectId === options.projectId && !c.deletedAt) {
        if (options.taskId !== undefined && c.taskId !== options.taskId) continue;
        const author = this.users.get(c.authorId);
        comments.push({
          id: c.id,
          organizationId: c.organizationId,
          projectId: c.projectId,
          taskId: c.taskId,
          authorId: c.authorId,
          authorName: author?.fullName || 'Unknown User',
          authorEmail: author?.email || null,
          content: c.content,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        });
      }
    }
    // Sort chronological ascending
    comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return comments;
  }

  async deleteComment(
    organizationId: string,
    id: string,
    currentUserId: string,
    isAdmin: boolean
  ): Promise<boolean> {
    const c = this.taskComments.get(id);
    if (!c || c.organizationId !== organizationId || c.deletedAt) {
      return false;
    }
    // Allow deletion if author or admin/owner
    if (c.authorId !== currentUserId && !isAdmin) {
      throw new Error('Not authorized to delete this comment');
    }
    c.deletedAt = new Date().toISOString();
    c.updatedAt = c.deletedAt;
    return true;
  }

  // ==========================================
  // Phase 8: Marketing Management
  // ==========================================

  async createCampaign(
    organizationId: string,
    ownerId: string,
    data: CreateCampaignInput
  ): Promise<CampaignDto> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const campaign: DbCampaign = {
      id,
      organizationId,
      name: data.name.trim(),
      type: data.type || 'inbound',
      channel: data.channel || 'website',
      status: data.status || 'planned',
      objective: data.objective?.trim() || null,
      description: data.description?.trim() || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      budget: (parseFloat(data.budget || '0') || 0).toFixed(2),
      actualCost: (parseFloat(data.actualCost || '0') || 0).toFixed(2),
      currency: data.currency || 'USD',
      ownerId,
      utmSource: data.utmSource?.trim() || null,
      utmMedium: data.utmMedium?.trim() || null,
      notes: data.notes?.trim() || null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.campaigns.set(id, campaign);

    const created = await this.getCampaignById(organizationId, id);
    if (!created) throw new Error('Failed to retrieve newly created campaign');
    return created;
  }

  async getCampaignById(organizationId: string, id: string): Promise<CampaignDto | null> {
    const c = this.campaigns.get(id);
    if (!c || c.organizationId !== organizationId || c.deletedAt) {
      return null;
    }

    const owner = this.users.get(c.ownerId);

    // Attributed leads metrics
    let totalLeads = 0;
    let convertedLeads = 0;
    let totalPipelineValueNum = 0;

    for (const cl of this.campaignLeads.values()) {
      if (cl.organizationId === organizationId && cl.campaignId === id) {
        const lead = this.leads.get(cl.leadId);
        if (lead && !lead.deletedAt) {
          totalLeads++;
          if (lead.status === 'converted') {
            convertedLeads++;
          }
          if (lead.estimatedValue) {
            totalPipelineValueNum += parseFloat(lead.estimatedValue) || 0;
          }
        }
      }
    }

    const conversionRatePercent =
      totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    const budgetNum = parseFloat(c.budget) || 0;
    const actualCostNum = parseFloat(c.actualCost) || 0;
    const remainingBudget = Math.max(0, budgetNum - actualCostNum).toFixed(2);
    const utilizationPercent =
      budgetNum > 0 ? Math.round((actualCostNum / budgetNum) * 100) : 0;

    return {
      id: c.id,
      organizationId: c.organizationId,
      name: c.name,
      type: c.type,
      channel: c.channel,
      status: c.status,
      objective: c.objective,
      description: c.description,
      startDate: c.startDate,
      endDate: c.endDate,
      budget: c.budget,
      actualCost: c.actualCost,
      remainingBudget,
      utilizationPercent,
      currency: c.currency,
      ownerId: c.ownerId,
      ownerName: owner?.fullName || 'Unknown User',
      utmSource: c.utmSource,
      utmMedium: c.utmMedium,
      notes: c.notes,
      totalLeads,
      convertedLeads,
      conversionRatePercent,
      totalPipelineValue: totalPipelineValueNum.toFixed(2),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };
  }

  async listCampaigns(
    organizationId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: CampaignStatus;
      channel?: MarketingChannel;
      type?: CampaignType;
      ownerId?: string;
    }
  ): Promise<PaginatedResult<CampaignDto>> {
    const list: DbCampaign[] = [];
    for (const c of this.campaigns.values()) {
      if (c.organizationId !== organizationId || c.deletedAt) continue;
      if (options?.status && c.status !== options.status) continue;
      if (options?.channel && c.channel !== options.channel) continue;
      if (options?.type && c.type !== options.type) continue;
      if (options?.ownerId && c.ownerId !== options.ownerId) continue;
      if (options?.search) {
        const q = options.search.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesObj = c.objective?.toLowerCase().includes(q) || false;
        const matchesDesc = c.description?.toLowerCase().includes(q) || false;
        const matchesSource = c.utmSource?.toLowerCase().includes(q) || false;
        const matchesMedium = c.utmMedium?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesObj && !matchesDesc && !matchesSource && !matchesMedium) {
          continue;
        }
      }
      list.push(c);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const enrichedList: CampaignDto[] = [];
    for (const c of list) {
      const full = await this.getCampaignById(organizationId, c.id);
      if (full) enrichedList.push(full);
    }

    const q = {
      page: options?.page || 1,
      limit: options?.limit || 15,
      search: options?.search,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    };
    return paginateCollection(enrichedList, q, ['name', 'objective', 'description', 'utmSource', 'utmMedium']);
  }

  async updateCampaign(
    organizationId: string,
    id: string,
    data: UpdateCampaignInput
  ): Promise<CampaignDto> {
    const c = this.campaigns.get(id);
    if (!c || c.organizationId !== organizationId || c.deletedAt) {
      throw new Error('Campaign not found');
    }

    if (data.name !== undefined) c.name = data.name.trim();
    if (data.type !== undefined) c.type = data.type;
    if (data.channel !== undefined) c.channel = data.channel;
    if (data.status !== undefined) c.status = data.status;
    if (data.objective !== undefined) c.objective = data.objective?.trim() || null;
    if (data.description !== undefined) c.description = data.description?.trim() || null;
    if (data.startDate !== undefined) c.startDate = data.startDate || null;
    if (data.endDate !== undefined) c.endDate = data.endDate || null;
    if (data.budget !== undefined) {
      c.budget = (parseFloat(data.budget || '0') || 0).toFixed(2);
    }
    if (data.actualCost !== undefined) {
      c.actualCost = (parseFloat(data.actualCost || '0') || 0).toFixed(2);
    }
    if (data.currency !== undefined) c.currency = data.currency;
    if (data.ownerId !== undefined) c.ownerId = data.ownerId;
    if (data.utmSource !== undefined) c.utmSource = data.utmSource?.trim() || null;
    if (data.utmMedium !== undefined) c.utmMedium = data.utmMedium?.trim() || null;
    if (data.notes !== undefined) c.notes = data.notes?.trim() || null;

    c.updatedAt = new Date().toISOString();

    const updated = await this.getCampaignById(organizationId, id);
    if (!updated) throw new Error('Failed to retrieve updated campaign');
    return updated;
  }

  async softDeleteCampaign(organizationId: string, id: string): Promise<boolean> {
    const c = this.campaigns.get(id);
    if (!c || c.organizationId !== organizationId || c.deletedAt) {
      return false;
    }
    const now = new Date().toISOString();
    c.deletedAt = now;
    c.updatedAt = now;
    return true;
  }

  // ==========================================
  // Campaign Lead Attribution
  // ==========================================

  async associateLeadToCampaign(
    organizationId: string,
    campaignId: string,
    data: AssociateLeadInput
  ): Promise<AttributedLeadDto> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.organizationId !== organizationId || campaign.deletedAt) {
      throw new Error('Campaign not found');
    }

    const lead = this.leads.get(data.leadId);
    if (!lead || lead.organizationId !== organizationId || lead.deletedAt) {
      throw new Error('Lead not found');
    }

    // Check if already linked
    for (const cl of this.campaignLeads.values()) {
      if (cl.campaignId === campaignId && cl.leadId === data.leadId) {
        // Return existing attribution
        const opp = lead.convertedOpportunityId ? this.opportunities.get(lead.convertedOpportunityId) : null;
        return {
          id: cl.id,
          leadId: lead.id,
          campaignId: campaign.id,
          campaignName: campaign.name,
          leadTitle: lead.title,
          contactName: `${lead.firstName} ${lead.lastName}`.trim(),
          email: lead.email,
          phone: lead.phone,
          companyName: lead.companyName,
          status: lead.status,
          estimatedValue: lead.estimatedValue,
          attributedAt: cl.createdAt,
          convertedOpportunityId: lead.convertedOpportunityId,
          convertedOpportunityName: opp?.name || null
        };
      }
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const cl: DbCampaignLead = {
      id,
      organizationId,
      campaignId,
      leadId: data.leadId,
      notes: data.notes?.trim() || null,
      createdAt: now
    };
    this.campaignLeads.set(id, cl);

    const opp = lead.convertedOpportunityId ? this.opportunities.get(lead.convertedOpportunityId) : null;
    return {
      id: cl.id,
      leadId: lead.id,
      campaignId: campaign.id,
      campaignName: campaign.name,
      leadTitle: lead.title,
      contactName: `${lead.firstName} ${lead.lastName}`.trim(),
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,
      status: lead.status,
      estimatedValue: lead.estimatedValue,
      attributedAt: cl.createdAt,
      convertedOpportunityId: lead.convertedOpportunityId,
      convertedOpportunityName: opp?.name || null
    };
  }

  async listCampaignLeads(
    organizationId: string,
    campaignId: string
  ): Promise<AttributedLeadDto[]> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.organizationId !== organizationId || campaign.deletedAt) {
      return [];
    }

    const list: AttributedLeadDto[] = [];
    for (const cl of this.campaignLeads.values()) {
      if (cl.organizationId === organizationId && cl.campaignId === campaignId) {
        const lead = this.leads.get(cl.leadId);
        if (lead && !lead.deletedAt) {
          const opp = lead.convertedOpportunityId ? this.opportunities.get(lead.convertedOpportunityId) : null;
          list.push({
            id: cl.id,
            leadId: lead.id,
            campaignId: campaign.id,
            campaignName: campaign.name,
            leadTitle: lead.title,
            contactName: `${lead.firstName} ${lead.lastName}`.trim(),
            email: lead.email,
            phone: lead.phone,
            companyName: lead.companyName,
            status: lead.status,
            estimatedValue: lead.estimatedValue,
            attributedAt: cl.createdAt,
            convertedOpportunityId: lead.convertedOpportunityId,
            convertedOpportunityName: opp?.name || null
          });
        }
      }
    }

    list.sort((a, b) => b.attributedAt.localeCompare(a.attributedAt));
    return list;
  }

  async removeLeadFromCampaign(
    organizationId: string,
    campaignId: string,
    leadId: string
  ): Promise<boolean> {
    for (const [id, cl] of this.campaignLeads.entries()) {
      if (cl.organizationId === organizationId && cl.campaignId === campaignId && cl.leadId === leadId) {
        this.campaignLeads.delete(id);
        return true;
      }
    }
    return false;
  }

  async getMarketingSummary(organizationId: string): Promise<MarketingSummaryDto> {
    const campaignsByStatus: Record<CampaignStatus, number> = {
      draft: 0,
      planned: 0,
      active: 0,
      completed: 0,
      cancelled: 0
    };

    const channels: MarketingChannel[] = [
      'social_media',
      'email',
      'search',
      'paid_advertising',
      'website',
      'referral',
      'events',
      'other'
    ];

    const channelStats: Record<
      MarketingChannel,
      {
        campaignCount: number;
        totalBudget: number;
        totalActualCost: number;
        totalLeads: number;
        convertedLeads: number;
      }
    > = {} as any;

    for (const ch of channels) {
      channelStats[ch] = {
        campaignCount: 0,
        totalBudget: 0,
        totalActualCost: 0,
        totalLeads: 0,
        convertedLeads: 0
      };
    }

    let totalBudgetNum = 0;
    let totalActualCostNum = 0;
    let totalAttributedLeads = 0;
    let totalConvertedLeads = 0;
    let totalCampaigns = 0;

    for (const c of this.campaigns.values()) {
      if (c.organizationId === organizationId && !c.deletedAt) {
        totalCampaigns++;
        campaignsByStatus[c.status] = (campaignsByStatus[c.status] || 0) + 1;

        const b = parseFloat(c.budget) || 0;
        const a = parseFloat(c.actualCost) || 0;
        totalBudgetNum += b;
        totalActualCostNum += a;

        const ch = c.channel;
        if (channelStats[ch]) {
          channelStats[ch].campaignCount++;
          channelStats[ch].totalBudget += b;
          channelStats[ch].totalActualCost += a;
        }

        // Count leads for this campaign
        for (const cl of this.campaignLeads.values()) {
          if (cl.campaignId === c.id) {
            const lead = this.leads.get(cl.leadId);
            if (lead && !lead.deletedAt) {
              totalAttributedLeads++;
              if (channelStats[ch]) channelStats[ch].totalLeads++;

              if (lead.status === 'converted') {
                totalConvertedLeads++;
                if (channelStats[ch]) channelStats[ch].convertedLeads++;
              }
            }
          }
        }
      }
    }

    const channelPerformance: ChannelPerformanceDto[] = channels.map((ch) => {
      const stats = channelStats[ch];
      const convRate = stats.totalLeads > 0 ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0;
      return {
        channel: ch,
        channelLabel: MARKETING_CHANNEL_LABELS[ch] || ch,
        campaignCount: stats.campaignCount,
        totalBudget: stats.totalBudget.toFixed(2),
        totalActualCost: stats.totalActualCost.toFixed(2),
        totalLeads: stats.totalLeads,
        convertedLeads: stats.convertedLeads,
        conversionRatePercent: convRate
      };
    });

    const totalRemaining = Math.max(0, totalBudgetNum - totalActualCostNum);
    const avgUtilization =
      totalBudgetNum > 0 ? Math.round((totalActualCostNum / totalBudgetNum) * 100) : 0;
    const overallConvRate =
      totalAttributedLeads > 0 ? Math.round((totalConvertedLeads / totalAttributedLeads) * 100) : 0;

    return {
      totalCampaigns,
      activeCampaigns: campaignsByStatus.active,
      completedCampaigns: campaignsByStatus.completed,
      plannedCampaigns: campaignsByStatus.planned,
      totalBudget: totalBudgetNum.toFixed(2),
      totalActualCost: totalActualCostNum.toFixed(2),
      totalRemainingBudget: totalRemaining.toFixed(2),
      averageBudgetUtilizationPercent: avgUtilization,
      totalAttributedLeads,
      totalConvertedLeads,
      overallConversionRatePercent: overallConvRate,
      currency: 'USD',
      channelPerformance,
      campaignsByStatus
    };
  }

  // ==========================================
  // Phase 9: HR Management
  // ==========================================

  // --- Departments ---

  async createDepartment(orgId: string, input: CreateDepartmentInput): Promise<DepartmentDto> {
    const name = input.name.trim();
    // Validate uniqueness of department name in organization
    for (const d of this.departments.values()) {
      if (d.organizationId === orgId && !d.deletedAt && d.name.toLowerCase() === name.toLowerCase()) {
        throw new Error(`Department '${name}' already exists in this organization`);
      }
    }

    if (input.managerId) {
      const mgr = this.employees.get(input.managerId);
      if (!mgr || mgr.organizationId !== orgId || mgr.deletedAt) {
        throw new Error('Department manager employee record not found in this organization');
      }
    }

    const now = new Date().toISOString();
    const dept: DbDepartment = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      name,
      code: input.code?.trim().toUpperCase() || null,
      description: input.description?.trim() || null,
      managerId: input.managerId || null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };

    this.departments.set(dept.id, dept);
    return this.mapDbDepartmentToDto(dept);
  }

  async getDepartmentById(orgId: string, id: string): Promise<DepartmentDto | null> {
    const dept = this.departments.get(id);
    if (!dept || dept.organizationId !== orgId || dept.deletedAt) return null;
    return this.mapDbDepartmentToDto(dept);
  }

  async listDepartments(orgId: string): Promise<DepartmentDto[]> {
    const results: DepartmentDto[] = [];
    for (const d of this.departments.values()) {
      if (d.organizationId === orgId && !d.deletedAt) {
        results.push(this.mapDbDepartmentToDto(d));
      }
    }
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateDepartment(orgId: string, id: string, input: UpdateDepartmentInput): Promise<DepartmentDto> {
    const dept = this.departments.get(id);
    if (!dept || dept.organizationId !== orgId || dept.deletedAt) {
      throw new Error('Department not found');
    }

    if (input.name !== undefined) {
      const name = input.name.trim();
      for (const d of this.departments.values()) {
        if (d.id !== id && d.organizationId === orgId && !d.deletedAt && d.name.toLowerCase() === name.toLowerCase()) {
          throw new Error(`Department '${name}' already exists in this organization`);
        }
      }
      dept.name = name;
    }

    if (input.code !== undefined) {
      dept.code = input.code?.trim().toUpperCase() || null;
    }

    if (input.description !== undefined) {
      dept.description = input.description?.trim() || null;
    }

    if (input.managerId !== undefined) {
      if (input.managerId) {
        const mgr = this.employees.get(input.managerId);
        if (!mgr || mgr.organizationId !== orgId || mgr.deletedAt) {
          throw new Error('Department manager employee record not found in this organization');
        }
      }
      dept.managerId = input.managerId || null;
    }

    dept.updatedAt = new Date().toISOString();
    return this.mapDbDepartmentToDto(dept);
  }

  async deleteDepartment(orgId: string, id: string): Promise<void> {
    const dept = this.departments.get(id);
    if (!dept || dept.organizationId !== orgId || dept.deletedAt) {
      throw new Error('Department not found');
    }

    // Soft delete
    dept.deletedAt = new Date().toISOString();
    dept.updatedAt = dept.deletedAt;

    // Unlink employees from this department
    for (const emp of this.employees.values()) {
      if (emp.organizationId === orgId && emp.departmentId === id) {
        emp.departmentId = null;
        emp.updatedAt = dept.deletedAt;
      }
    }
  }

  private mapDbDepartmentToDto(dept: DbDepartment): DepartmentDto {
    let employeeCount = 0;
    for (const emp of this.employees.values()) {
      if (emp.organizationId === dept.organizationId && emp.departmentId === dept.id && !emp.deletedAt) {
        employeeCount++;
      }
    }

    let managerName: string | null = null;
    if (dept.managerId) {
      const mgr = this.employees.get(dept.managerId);
      if (mgr) {
        managerName = `${mgr.firstName} ${mgr.lastName}`;
      }
    }

    return {
      id: dept.id,
      organizationId: dept.organizationId,
      name: dept.name,
      code: dept.code,
      description: dept.description,
      managerId: dept.managerId,
      managerName,
      employeeCount,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt
    };
  }

  // --- Designations ---

  async createDesignation(orgId: string, input: CreateDesignationInput): Promise<DesignationDto> {
    const title = input.title.trim();

    if (input.departmentId) {
      const dept = this.departments.get(input.departmentId);
      if (!dept || dept.organizationId !== orgId || dept.deletedAt) {
        throw new Error('Department not found in this organization');
      }
    }

    const now = new Date().toISOString();
    const des: DbDesignation = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      departmentId: input.departmentId || null,
      title,
      code: input.code?.trim().toUpperCase() || null,
      description: input.description?.trim() || null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };

    this.designations.set(des.id, des);
    return this.mapDbDesignationToDto(des);
  }

  async getDesignationById(orgId: string, id: string): Promise<DesignationDto | null> {
    const des = this.designations.get(id);
    if (!des || des.organizationId !== orgId || des.deletedAt) return null;
    return this.mapDbDesignationToDto(des);
  }

  async listDesignations(orgId: string, departmentId?: string): Promise<DesignationDto[]> {
    const results: DesignationDto[] = [];
    for (const d of this.designations.values()) {
      if (d.organizationId === orgId && !d.deletedAt) {
        if (departmentId && d.departmentId !== departmentId) continue;
        results.push(this.mapDbDesignationToDto(d));
      }
    }
    return results.sort((a, b) => a.title.localeCompare(b.title));
  }

  async updateDesignation(orgId: string, id: string, input: UpdateDesignationInput): Promise<DesignationDto> {
    const des = this.designations.get(id);
    if (!des || des.organizationId !== orgId || des.deletedAt) {
      throw new Error('Designation not found');
    }

    if (input.title !== undefined) {
      des.title = input.title.trim();
    }

    if (input.code !== undefined) {
      des.code = input.code?.trim().toUpperCase() || null;
    }

    if (input.departmentId !== undefined) {
      if (input.departmentId) {
        const dept = this.departments.get(input.departmentId);
        if (!dept || dept.organizationId !== orgId || dept.deletedAt) {
          throw new Error('Department not found in this organization');
        }
      }
      des.departmentId = input.departmentId || null;
    }

    if (input.description !== undefined) {
      des.description = input.description?.trim() || null;
    }

    des.updatedAt = new Date().toISOString();
    return this.mapDbDesignationToDto(des);
  }

  async deleteDesignation(orgId: string, id: string): Promise<void> {
    const des = this.designations.get(id);
    if (!des || des.organizationId !== orgId || des.deletedAt) {
      throw new Error('Designation not found');
    }

    des.deletedAt = new Date().toISOString();
    des.updatedAt = des.deletedAt;

    for (const emp of this.employees.values()) {
      if (emp.organizationId === orgId && emp.designationId === id) {
        emp.designationId = null;
        emp.updatedAt = des.deletedAt;
      }
    }
  }

  private mapDbDesignationToDto(des: DbDesignation): DesignationDto {
    let employeeCount = 0;
    for (const emp of this.employees.values()) {
      if (emp.organizationId === des.organizationId && emp.designationId === des.id && !emp.deletedAt) {
        employeeCount++;
      }
    }

    let departmentName: string | null = null;
    if (des.departmentId) {
      const dept = this.departments.get(des.departmentId);
      if (dept) departmentName = dept.name;
    }

    return {
      id: des.id,
      organizationId: des.organizationId,
      departmentId: des.departmentId,
      departmentName,
      title: des.title,
      code: des.code,
      description: des.description,
      employeeCount,
      createdAt: des.createdAt,
      updatedAt: des.updatedAt
    };
  }

  // --- Employees ---

  async createEmployee(orgId: string, input: CreateEmployeeInput): Promise<EmployeeDto> {
    const empNum = input.employeeNumber.trim().toUpperCase();

    // Check unique employeeNumber in org
    for (const e of this.employees.values()) {
      if (e.organizationId === orgId && !e.deletedAt && e.employeeNumber === empNum) {
        throw new Error(`Employee ID / Number '${empNum}' is already assigned in this organization`);
      }
    }

    if (input.departmentId) {
      const dept = this.departments.get(input.departmentId);
      if (!dept || dept.organizationId !== orgId || dept.deletedAt) {
        throw new Error('Department not found in this organization');
      }
    }

    if (input.designationId) {
      const des = this.designations.get(input.designationId);
      if (!des || des.organizationId !== orgId || des.deletedAt) {
        throw new Error('Designation not found in this organization');
      }
    }

    if (input.reportingManagerId) {
      const mgr = this.employees.get(input.reportingManagerId);
      if (!mgr || mgr.organizationId !== orgId || mgr.deletedAt) {
        throw new Error('Reporting manager not found in this organization');
      }
    }

    if (input.userId) {
      const user = this.users.get(input.userId);
      if (!user) {
        throw new Error('Platform user account not found');
      }
    }

    const now = new Date().toISOString();
    const emp: DbEmployee = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: input.userId || null,
      employeeNumber: empNum,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      workEmail: input.workEmail.trim().toLowerCase(),
      workPhone: input.workPhone?.trim() || null,
      departmentId: input.departmentId || null,
      designationId: input.designationId || null,
      reportingManagerId: input.reportingManagerId || null,
      employmentType: input.employmentType || 'full_time',
      status: input.status || 'active',
      joiningDate: input.joiningDate,
      terminationDate: null,
      notes: input.notes?.trim() || null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };

    this.employees.set(emp.id, emp);
    return this.mapDbEmployeeToDto(emp);
  }

  async getEmployeeById(orgId: string, id: string): Promise<EmployeeDto | null> {
    const emp = this.employees.get(id);
    if (!emp || emp.organizationId !== orgId || emp.deletedAt) return null;
    return this.mapDbEmployeeToDto(emp);
  }

  async findEmployeeByUserId(orgId: string, userId: string): Promise<EmployeeDto | null> {
    for (const emp of this.employees.values()) {
      if (emp.organizationId === orgId && emp.userId === userId && !emp.deletedAt) {
        return this.mapDbEmployeeToDto(emp);
      }
    }
    return null;
  }

  async listEmployees(
    orgId: string,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      departmentId?: string;
      designationId?: string;
      status?: string;
      employmentType?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResult<EmployeeDto>> {
    let items: DbEmployee[] = [];
    for (const emp of this.employees.values()) {
      if (emp.organizationId !== orgId || emp.deletedAt) continue;

      if (query?.departmentId && emp.departmentId !== query.departmentId) continue;
      if (query?.designationId && emp.designationId !== query.designationId) continue;
      if (query?.status && emp.status !== query.status) continue;
      if (query?.employmentType && emp.employmentType !== query.employmentType) continue;

      if (query?.search) {
        const s = query.search.toLowerCase();
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const match =
          emp.employeeNumber.toLowerCase().includes(s) ||
          emp.workEmail.toLowerCase().includes(s) ||
          fullName.includes(s);
        if (!match) continue;
      }

      items.push(emp);
    }

    // Sort
    const sortBy = query?.sortBy || 'employeeNumber';
    const sortOrder = query?.sortOrder || 'asc';
    items.sort((a, b) => {
      let aVal: any = a.employeeNumber;
      let bVal: any = b.employeeNumber;

      if (sortBy === 'name') {
        aVal = `${a.firstName} ${a.lastName}`;
        bVal = `${b.firstName} ${b.lastName}`;
      } else if (sortBy === 'joiningDate') {
        aVal = a.joiningDate;
        bVal = b.joiningDate;
      } else if (sortBy === 'status') {
        aVal = a.status;
        bVal = b.status;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedItems.map((emp) => this.mapDbEmployeeToDto(emp)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async updateEmployee(orgId: string, id: string, input: UpdateEmployeeInput): Promise<EmployeeDto> {
    const emp = this.employees.get(id);
    if (!emp || emp.organizationId !== orgId || emp.deletedAt) {
      throw new Error('Employee not found');
    }

    if (input.employeeNumber !== undefined) {
      const empNum = input.employeeNumber.trim().toUpperCase();
      for (const e of this.employees.values()) {
        if (e.id !== id && e.organizationId === orgId && !e.deletedAt && e.employeeNumber === empNum) {
          throw new Error(`Employee ID / Number '${empNum}' is already assigned in this organization`);
        }
      }
      emp.employeeNumber = empNum;
    }

    if (input.firstName !== undefined) emp.firstName = input.firstName.trim();
    if (input.lastName !== undefined) emp.lastName = input.lastName.trim();
    if (input.workEmail !== undefined) emp.workEmail = input.workEmail.trim().toLowerCase();
    if (input.workPhone !== undefined) emp.workPhone = input.workPhone?.trim() || null;

    if (input.departmentId !== undefined) {
      if (input.departmentId) {
        const dept = this.departments.get(input.departmentId);
        if (!dept || dept.organizationId !== orgId || dept.deletedAt) {
          throw new Error('Department not found in this organization');
        }
      }
      emp.departmentId = input.departmentId || null;
    }

    if (input.designationId !== undefined) {
      if (input.designationId) {
        const des = this.designations.get(input.designationId);
        if (!des || des.organizationId !== orgId || des.deletedAt) {
          throw new Error('Designation not found in this organization');
        }
      }
      emp.designationId = input.designationId || null;
    }

    if (input.reportingManagerId !== undefined) {
      if (input.reportingManagerId) {
        if (input.reportingManagerId === id) {
          throw new Error('An employee cannot report to themselves');
        }
        const mgr = this.employees.get(input.reportingManagerId);
        if (!mgr || mgr.organizationId !== orgId || mgr.deletedAt) {
          throw new Error('Reporting manager not found in this organization');
        }
      }
      emp.reportingManagerId = input.reportingManagerId || null;
    }

    if (input.userId !== undefined) {
      if (input.userId) {
        const user = this.users.get(input.userId);
        if (!user) throw new Error('Platform user account not found');
      }
      emp.userId = input.userId || null;
    }

    if (input.employmentType !== undefined) emp.employmentType = input.employmentType;
    if (input.status !== undefined) emp.status = input.status;
    if (input.joiningDate !== undefined) emp.joiningDate = input.joiningDate;
    if (input.terminationDate !== undefined) emp.terminationDate = input.terminationDate || null;
    if (input.notes !== undefined) emp.notes = input.notes?.trim() || null;

    emp.updatedAt = new Date().toISOString();
    return this.mapDbEmployeeToDto(emp);
  }

  async deleteEmployee(orgId: string, id: string): Promise<void> {
    const emp = this.employees.get(id);
    if (!emp || emp.organizationId !== orgId || emp.deletedAt) {
      throw new Error('Employee not found');
    }

    const now = new Date().toISOString();
    emp.deletedAt = now;
    emp.status = 'terminated';
    emp.terminationDate = emp.terminationDate || now.substring(0, 10);
    emp.updatedAt = now;
  }

  private mapDbEmployeeToDto(emp: DbEmployee): EmployeeDto {
    let departmentName: string | null = null;
    if (emp.departmentId) {
      const dept = this.departments.get(emp.departmentId);
      if (dept) departmentName = dept.name;
    }

    let designationTitle: string | null = null;
    if (emp.designationId) {
      const des = this.designations.get(emp.designationId);
      if (des) designationTitle = des.title;
    }

    let reportingManagerName: string | null = null;
    if (emp.reportingManagerId) {
      const mgr = this.employees.get(emp.reportingManagerId);
      if (mgr) reportingManagerName = `${mgr.firstName} ${mgr.lastName}`;
    }

    return {
      id: emp.id,
      organizationId: emp.organizationId,
      userId: emp.userId,
      employeeNumber: emp.employeeNumber,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName}`,
      workEmail: emp.workEmail,
      workPhone: emp.workPhone,
      departmentId: emp.departmentId,
      departmentName,
      designationId: emp.designationId,
      designationTitle,
      reportingManagerId: emp.reportingManagerId,
      reportingManagerName,
      employmentType: emp.employmentType,
      status: emp.status,
      joiningDate: emp.joiningDate,
      terminationDate: emp.terminationDate,
      notes: emp.notes,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    };
  }

  // --- Attendance ---

  async recordAttendance(
    orgId: string,
    createdByUserId: string,
    input: RecordAttendanceInput
  ): Promise<AttendanceRecordDto> {
    const emp = this.employees.get(input.employeeId);
    if (!emp || emp.organizationId !== orgId || emp.deletedAt) {
      throw new Error('Employee not found in this organization');
    }

    // Check duplicate attendance record for this employee and date
    for (const rec of this.attendanceRecords.values()) {
      if (rec.organizationId === orgId && rec.employeeId === input.employeeId && rec.date === input.date) {
        throw new Error(`Attendance already recorded for ${emp.firstName} ${emp.lastName} on ${input.date}`);
      }
    }

    const now = new Date().toISOString();
    const record: DbAttendanceRecord = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      employeeId: input.employeeId,
      date: input.date,
      status: input.status || 'present',
      checkInTime: input.checkInTime || null,
      checkOutTime: input.checkOutTime || null,
      notes: input.notes?.trim() || null,
      createdById: createdByUserId,
      createdAt: now,
      updatedAt: now
    };

    this.attendanceRecords.set(record.id, record);
    return this.mapDbAttendanceToDto(record);
  }

  async getAttendanceRecord(orgId: string, id: string): Promise<AttendanceRecordDto | null> {
    const rec = this.attendanceRecords.get(id);
    if (!rec || rec.organizationId !== orgId) return null;
    return this.mapDbAttendanceToDto(rec);
  }

  async listAttendance(
    orgId: string,
    query?: {
      page?: number;
      limit?: number;
      date?: string;
      employeeId?: string;
      status?: string;
      month?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResult<AttendanceRecordDto>> {
    const items: DbAttendanceRecord[] = [];
    for (const rec of this.attendanceRecords.values()) {
      if (rec.organizationId !== orgId) continue;
      if (query?.date && rec.date !== query.date) continue;
      if (query?.employeeId && rec.employeeId !== query.employeeId) continue;
      if (query?.status && rec.status !== query.status) continue;
      if (query?.month && !rec.date.startsWith(query.month)) continue;
      items.push(rec);
    }

    items.sort((a, b) => b.date.localeCompare(a.date));

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const paginated = items.slice((page - 1) * limit, page * limit);

    return {
      items: paginated.map((rec) => this.mapDbAttendanceToDto(rec)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async updateAttendance(orgId: string, id: string, input: UpdateAttendanceInput): Promise<AttendanceRecordDto> {
    const rec = this.attendanceRecords.get(id);
    if (!rec || rec.organizationId !== orgId) {
      throw new Error('Attendance record not found');
    }

    if (input.status !== undefined) rec.status = input.status;
    if (input.checkInTime !== undefined) rec.checkInTime = input.checkInTime || null;
    if (input.checkOutTime !== undefined) rec.checkOutTime = input.checkOutTime || null;
    if (input.notes !== undefined) rec.notes = input.notes?.trim() || null;

    rec.updatedAt = new Date().toISOString();
    return this.mapDbAttendanceToDto(rec);
  }

  async deleteAttendance(orgId: string, id: string): Promise<void> {
    const rec = this.attendanceRecords.get(id);
    if (!rec || rec.organizationId !== orgId) {
      throw new Error('Attendance record not found');
    }
    this.attendanceRecords.delete(id);
  }

  private mapDbAttendanceToDto(rec: DbAttendanceRecord): AttendanceRecordDto {
    const emp = this.employees.get(rec.employeeId);
    let employeeNumber = '—';
    let employeeName = 'Unknown Employee';
    let departmentName: string | null = null;

    if (emp) {
      employeeNumber = emp.employeeNumber;
      employeeName = `${emp.firstName} ${emp.lastName}`;
      if (emp.departmentId) {
        const dept = this.departments.get(emp.departmentId);
        if (dept) departmentName = dept.name;
      }
    }

    return {
      id: rec.id,
      organizationId: rec.organizationId,
      employeeId: rec.employeeId,
      employeeNumber,
      employeeName,
      departmentName,
      date: rec.date,
      status: rec.status,
      checkInTime: rec.checkInTime,
      checkOutTime: rec.checkOutTime,
      notes: rec.notes,
      createdById: rec.createdById,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt
    };
  }

  // --- Leave Requests ---

  async createLeaveRequest(
    orgId: string,
    createdByUserId: string,
    input: CreateLeaveRequestInput
  ): Promise<LeaveRequestDto> {
    const emp = this.employees.get(input.employeeId);
    if (!emp || emp.organizationId !== orgId || emp.deletedAt) {
      throw new Error('Employee not found in this organization');
    }

    if (input.endDate < input.startDate) {
      throw new Error('Leave end date cannot be earlier than start date');
    }

    // Check for conflicting approved or pending leave requests
    for (const req of this.leaveRequests.values()) {
      if (
        req.organizationId === orgId &&
        req.employeeId === input.employeeId &&
        (req.status === 'pending' || req.status === 'approved')
      ) {
        // Date overlap check: s1 <= e2 && s2 <= e1
        if (input.startDate <= req.endDate && req.startDate <= input.endDate) {
          throw new Error(
            `Leave request overlaps with an existing ${req.status} leave request (${req.startDate} to ${req.endDate})`
          );
        }
      }
    }

    const now = new Date().toISOString();
    const leave: DbLeaveRequest = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      employeeId: input.employeeId,
      leaveType: input.leaveType || 'annual',
      startDate: input.startDate,
      endDate: input.endDate,
      daysCount: Number(input.daysCount),
      reason: input.reason?.trim() || null,
      status: 'pending',
      approvedById: null,
      approvalNotes: null,
      decidedAt: null,
      createdById: createdByUserId,
      createdAt: now,
      updatedAt: now
    };

    this.leaveRequests.set(leave.id, leave);
    return this.mapDbLeaveRequestToDto(leave);
  }

  async getLeaveRequestById(orgId: string, id: string): Promise<LeaveRequestDto | null> {
    const leave = this.leaveRequests.get(id);
    if (!leave || leave.organizationId !== orgId) return null;
    return this.mapDbLeaveRequestToDto(leave);
  }

  async listLeaveRequests(
    orgId: string,
    query?: {
      page?: number;
      limit?: number;
      employeeId?: string;
      status?: string;
      leaveType?: string;
      year?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResult<LeaveRequestDto>> {
    const items: DbLeaveRequest[] = [];
    for (const req of this.leaveRequests.values()) {
      if (req.organizationId !== orgId) continue;
      if (query?.employeeId && req.employeeId !== query.employeeId) continue;
      if (query?.status && req.status !== query.status) continue;
      if (query?.leaveType && req.leaveType !== query.leaveType) continue;
      if (query?.year && !req.startDate.startsWith(query.year)) continue;
      items.push(req);
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const paginated = items.slice((page - 1) * limit, page * limit);

    return {
      items: paginated.map((req) => this.mapDbLeaveRequestToDto(req)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async updateLeaveStatus(
    orgId: string,
    id: string,
    approverUserId: string,
    input: UpdateLeaveStatusInput
  ): Promise<LeaveRequestDto> {
    const leave = this.leaveRequests.get(id);
    if (!leave || leave.organizationId !== orgId) {
      throw new Error('Leave request not found');
    }

    const now = new Date().toISOString();
    leave.status = input.status;
    leave.approvedById = approverUserId;
    leave.approvalNotes = input.approvalNotes?.trim() || null;
    leave.decidedAt = now;
    leave.updatedAt = now;

    // If approved and current date is within leave window, mark employee on_leave
    const today = now.substring(0, 10);
    const emp = this.employees.get(leave.employeeId);
    if (emp && !emp.deletedAt) {
      if (input.status === 'approved' && today >= leave.startDate && today <= leave.endDate) {
        emp.status = 'on_leave';
        emp.updatedAt = now;
      } else if (input.status === 'rejected' || input.status === 'cancelled') {
        if (emp.status === 'on_leave') {
          emp.status = 'active';
          emp.updatedAt = now;
        }
      }
    }

    return this.mapDbLeaveRequestToDto(leave);
  }

  async cancelLeaveRequest(orgId: string, id: string, userId: string): Promise<void> {
    const leave = this.leaveRequests.get(id);
    if (!leave || leave.organizationId !== orgId) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'pending') {
      throw new Error('Only pending leave requests can be cancelled');
    }

    const now = new Date().toISOString();
    leave.status = 'cancelled';
    leave.decidedAt = now;
    leave.updatedAt = now;
  }

  private mapDbLeaveRequestToDto(leave: DbLeaveRequest): LeaveRequestDto {
    const emp = this.employees.get(leave.employeeId);
    let employeeNumber = '—';
    let employeeName = 'Unknown Employee';
    let departmentName: string | null = null;

    if (emp) {
      employeeNumber = emp.employeeNumber;
      employeeName = `${emp.firstName} ${emp.lastName}`;
      if (emp.departmentId) {
        const dept = this.departments.get(emp.departmentId);
        if (dept) departmentName = dept.name;
      }
    }

    let approverName: string | null = null;
    if (leave.approvedById) {
      const user = this.users.get(leave.approvedById);
      if (user) approverName = user.fullName;
    }

    return {
      id: leave.id,
      organizationId: leave.organizationId,
      employeeId: leave.employeeId,
      employeeNumber,
      employeeName,
      departmentName,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      daysCount: leave.daysCount,
      reason: leave.reason,
      status: leave.status,
      approvedById: leave.approvedById,
      approverName,
      approvalNotes: leave.approvalNotes,
      decidedAt: leave.decidedAt,
      createdById: leave.createdById,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt
    };
  }

  // --- HR Summary ---

  async getHrSummary(orgId: string): Promise<HrSummaryDto> {
    let totalEmployees = 0;
    let activeEmployees = 0;
    let onLeaveEmployees = 0;
    let terminatedEmployees = 0;

    for (const emp of this.employees.values()) {
      if (emp.organizationId !== orgId) continue;
      if (emp.deletedAt) {
        terminatedEmployees++;
        continue;
      }
      totalEmployees++;
      if (emp.status === 'active') activeEmployees++;
      else if (emp.status === 'on_leave') onLeaveEmployees++;
      else if (emp.status === 'terminated') terminatedEmployees++;
    }

    let departmentsCount = 0;
    const deptDistributionMap = new Map<string, { id: string; name: string; total: number; active: number }>();
    for (const d of this.departments.values()) {
      if (d.organizationId === orgId && !d.deletedAt) {
        departmentsCount++;
        deptDistributionMap.set(d.id, { id: d.id, name: d.name, total: 0, active: 0 });
      }
    }

    for (const emp of this.employees.values()) {
      if (emp.organizationId === orgId && !emp.deletedAt && emp.departmentId) {
        const dist = deptDistributionMap.get(emp.departmentId);
        if (dist) {
          dist.total++;
          if (emp.status === 'active') dist.active++;
        }
      }
    }

    let designationsCount = 0;
    for (const des of this.designations.values()) {
      if (des.organizationId === orgId && !des.deletedAt) {
        designationsCount++;
      }
    }

    let pendingLeavesCount = 0;
    const allLeaves: DbLeaveRequest[] = [];
    for (const l of this.leaveRequests.values()) {
      if (l.organizationId === orgId) {
        allLeaves.push(l);
        if (l.status === 'pending') pendingLeavesCount++;
      }
    }

    allLeaves.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const recentLeaves = allLeaves.slice(0, 5).map((l) => this.mapDbLeaveRequestToDto(l));

    // Today's attendance summary
    const todayStr = new Date().toISOString().substring(0, 10);
    let presentCount = 0;
    let remoteCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let onLeaveCount = 0;

    for (const rec of this.attendanceRecords.values()) {
      if (rec.organizationId === orgId && rec.date === todayStr) {
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'remote') remoteCount++;
        else if (rec.status === 'half_day') halfDayCount++;
        else if (rec.status === 'absent') absentCount++;
        else if (rec.status === 'on_leave') onLeaveCount++;
      }
    }

    const totalExpected = activeEmployees;
    const attended = presentCount + remoteCount + halfDayCount;
    const attendanceRatePercent =
      totalExpected > 0 ? Math.min(100, Math.round((attended / totalExpected) * 100)) : 100;

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      terminatedEmployees,
      departmentsCount,
      designationsCount,
      pendingLeavesCount,
      todayAttendance: {
        totalExpected,
        presentCount,
        remoteCount,
        halfDayCount,
        absentCount,
        onLeaveCount,
        attendanceRatePercent
      },
      departmentDistribution: Array.from(deptDistributionMap.values()).map((d) => ({
        departmentId: d.id,
        departmentName: d.name,
        employeeCount: d.total,
        activeCount: d.active
      })),
      recentLeaves
    };
  }

  // ==========================================
  // Phase 10: Executive Dashboard & Analytics
  // ==========================================

  async getExecutiveDashboard(
    orgId: string,
    userRole: Role,
    query?: AnalyticsFilterQuery
  ): Promise<ExecutiveDashboardDto> {
    const isFinancialAuthorized = userRole === 'owner' || userRole === 'admin';
    const isHrAuthorized = userRole === 'owner' || userRole === 'admin';

    const dateRange = query?.dateRange || 'all';
    const now = new Date();
    let periodStart = '1970-01-01';
    let periodEnd = now.toISOString().substring(0, 10);

    if (dateRange === 'today') {
      periodStart = periodEnd;
    } else if (dateRange === 'this_week') {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(d.setDate(diff));
      periodStart = monday.toISOString().substring(0, 10);
    } else if (dateRange === 'this_month') {
      periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    } else if (dateRange === 'this_quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3 + 1;
      periodStart = `${now.getFullYear()}-${String(qMonth).padStart(2, '0')}-01`;
    } else if (dateRange === 'this_year') {
      periodStart = `${now.getFullYear()}-01-01`;
    } else if (dateRange === 'custom') {
      if (query?.startDate) periodStart = query.startDate;
      if (query?.endDate) periodEnd = query.endDate;
    }

    // Helper for date filtering
    const isDateInRange = (dateStr?: string | null): boolean => {
      if (!dateStr || dateRange === 'all') return true;
      const d = dateStr.substring(0, 10);
      return d >= periodStart && d <= periodEnd;
    };

    // 1. CRM Metrics & Sources
    let totalLeadsCount = 0;
    let activeLeadsCount = 0;
    let convertedLeadsCount = 0;
    const leadSourcesMap = new Map<string, number>();

    for (const lead of this.leads.values()) {
      if (lead.organizationId !== orgId || lead.deletedAt) continue;
      if (!isDateInRange(lead.createdAt)) continue;

      totalLeadsCount++;
      if (lead.status === 'converted') {
        convertedLeadsCount++;
      } else if (lead.status !== 'unqualified') {
        activeLeadsCount++;
      }

      const src = lead.source || 'other';
      leadSourcesMap.set(src, (leadSourcesMap.get(src) || 0) + 1);
    }

    const leadConversionRatePercent =
      totalLeadsCount > 0 ? Math.round((convertedLeadsCount / totalLeadsCount) * 100) : 0;

    const leadSources = Array.from(leadSourcesMap.entries()).map(([src, count]) => ({
      source: src,
      sourceLabel: src.charAt(0).toUpperCase() + src.slice(1).replace('_', ' '),
      leadCount: count
    })).sort((a, b) => b.leadCount - a.leadCount);

    // 2. Sales Pipeline Metrics & Funnel
    let openOpportunitiesCount = 0;
    let openPipelineNum = 0;
    let weightedForecastNum = 0;
    let closedWonNum = 0;
    let closedWonCount = 0;
    let closedLostCount = 0;

    const stageFunnelMap = new Map<
      string,
      { count: number; value: number; prob: number; name: string }
    >([
      ['prospecting', { count: 0, value: 0, prob: 10, name: 'Prospecting' }],
      ['qualification', { count: 0, value: 0, prob: 25, name: 'Qualification' }],
      ['proposal', { count: 0, value: 0, prob: 50, name: 'Proposal' }],
      ['negotiation', { count: 0, value: 0, prob: 75, name: 'Negotiation' }],
      ['closed_won', { count: 0, value: 0, prob: 100, name: 'Closed Won' }],
      ['closed_lost', { count: 0, value: 0, prob: 0, name: 'Closed Lost' }]
    ]);

    for (const opp of this.opportunities.values()) {
      if (opp.organizationId !== orgId || opp.deletedAt) continue;
      if (!isDateInRange(opp.createdAt)) continue;

      const amt = Number(opp.amount || 0);
      const prob = opp.probability;

      const funnelEntry = stageFunnelMap.get(opp.stage);
      if (funnelEntry) {
        funnelEntry.count++;
        funnelEntry.value += amt;
      }

      if (opp.stage === 'closed_won') {
        closedWonCount++;
        closedWonNum += amt;
      } else if (opp.stage === 'closed_lost') {
        closedLostCount++;
      } else {
        openOpportunitiesCount++;
        openPipelineNum += amt;
        weightedForecastNum += amt * (prob / 100);
      }
    }

    const totalClosed = closedWonCount + closedLostCount;
    const winRatePercent = totalClosed > 0 ? Math.round((closedWonCount / totalClosed) * 100) : 0;

    const salesPipelineFunnel = Array.from(stageFunnelMap.entries()).map(([st, data]) => ({
      stage: st,
      stageName: data.name,
      dealCount: data.count,
      totalValue: data.value.toFixed(2),
      probability: data.prob
    }));

    // 3. Operational Finance Metrics (Role-gated)
    let totalIncomeStr: string | null = null;
    let totalExpensesStr: string | null = null;
    let netBalanceStr: string | null = null;
    let outstandingInvoicesStr: string | null = null;
    let overdueInvoicesStr: string | null = null;
    let overdueInvoicesCount: number | null = null;
    let monthlyCashFlow: Array<{ month: string; income: string; expense: string; net: string }> = [];

    if (isFinancialAuthorized) {
      let incomeNum = 0;
      let expenseNum = 0;
      const monthlyBuckets = new Map<string, { income: number; expense: number }>();

      for (const tx of this.financialTransactions.values()) {
        if (tx.organizationId !== orgId || tx.deletedAt) continue;
        if (!isDateInRange(tx.date)) continue;

        const amt = Number(tx.amount || 0);
        const mKey = tx.date.substring(0, 7); // YYYY-MM
        const bucket = monthlyBuckets.get(mKey) || { income: 0, expense: 0 };

        if (tx.type === 'income') {
          incomeNum += amt;
          bucket.income += amt;
        } else {
          expenseNum += amt;
          bucket.expense += amt;
        }
        monthlyBuckets.set(mKey, bucket);
      }

      totalIncomeStr = incomeNum.toFixed(2);
      totalExpensesStr = expenseNum.toFixed(2);
      netBalanceStr = (incomeNum - expenseNum).toFixed(2);

      let outstandingNum = 0;
      let overdueNum = 0;
      let overdueCount = 0;
      const todayStr = now.toISOString().substring(0, 10);

      for (const inv of this.invoices.values()) {
        if (inv.organizationId !== orgId || inv.deletedAt) continue;
        if (inv.status === 'paid' || inv.status === 'void') continue;

        const bal = Number(inv.balanceDue || 0);
        outstandingNum += bal;

        if (inv.dueDate && inv.dueDate < todayStr) {
          overdueNum += bal;
          overdueCount++;
        }
      }

      outstandingInvoicesStr = outstandingNum.toFixed(2);
      overdueInvoicesStr = overdueNum.toFixed(2);
      overdueInvoicesCount = overdueCount;

      monthlyCashFlow = Array.from(monthlyBuckets.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([month, data]) => ({
          month,
          income: data.income.toFixed(2),
          expense: data.expense.toFixed(2),
          net: (data.income - data.expense).toFixed(2)
        }));
    }

    // 4. Projects Delivery Metrics
    let totalProjects = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasksCount = 0;

    const taskStatusMap = new Map<string, { count: number; label: string }>([
      ['todo', { count: 0, label: 'To Do' }],
      ['in_progress', { count: 0, label: 'In Progress' }],
      ['in_review', { count: 0, label: 'In Review' }],
      ['completed', { count: 0, label: 'Completed' }]
    ]);

    for (const proj of this.projects.values()) {
      if (proj.organizationId !== orgId || proj.deletedAt) continue;
      totalProjects++;
      if (proj.status === 'completed') completedProjects++;
      else if (proj.status === 'active' || proj.status === 'planning') activeProjects++;
    }

    const todayIsoDate = now.toISOString().substring(0, 10);
    for (const t of this.tasks.values()) {
      if (t.organizationId !== orgId || t.deletedAt) continue;
      if (!isDateInRange(t.createdAt)) continue;

      totalTasks++;
      if (t.status === 'completed') {
        completedTasks++;
      } else if (t.status !== 'cancelled' && t.dueDate && t.dueDate.substring(0, 10) < todayIsoDate) {
        overdueTasksCount++;
      }

      const stEntry = taskStatusMap.get(t.status);
      if (stEntry) stEntry.count++;
    }

    const taskCompletionRatePercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const taskStatusDistribution = Array.from(taskStatusMap.entries()).map(([st, d]) => ({
      status: st,
      statusLabel: d.label,
      taskCount: d.count
    }));

    // 5. Marketing Performance Metrics
    let activeCampaignsCount = 0;
    let totalMarketingSpendNum = 0;
    let totalMarketingBudgetNum = 0;
    const channelMap = new Map<string, { budget: number; actualCost: number; leads: number }>();

    for (const camp of this.campaigns.values()) {
      if (camp.organizationId !== orgId || camp.deletedAt) continue;
      if (!isDateInRange(camp.createdAt)) continue;

      const b = Number(camp.budget || 0);
      const c = Number(camp.actualCost || 0);

      totalMarketingBudgetNum += b;
      totalMarketingSpendNum += c;

      if (camp.status === 'active') activeCampaignsCount++;

      const chEntry = channelMap.get(camp.channel) || { budget: 0, actualCost: 0, leads: 0 };
      chEntry.budget += b;
      chEntry.actualCost += c;
      channelMap.set(camp.channel, chEntry);
    }

    let attributedLeadsCount = 0;
    for (const cl of this.campaignLeads.values()) {
      if (cl.organizationId !== orgId) continue;
      attributedLeadsCount++;

      const camp = this.campaigns.get(cl.campaignId);
      if (camp) {
        const chEntry = channelMap.get(camp.channel);
        if (chEntry) chEntry.leads++;
      }
    }

    const marketingBudgetUtilizationPercent =
      totalMarketingBudgetNum > 0
        ? Math.round((totalMarketingSpendNum / totalMarketingBudgetNum) * 100)
        : 0;

    const marketingConversionRatePercent =
      attributedLeadsCount > 0 ? Math.round((convertedLeadsCount / attributedLeadsCount) * 100) : 0;

    const marketingChannelPerformance = Array.from(channelMap.entries()).map(([ch, d]) => ({
      channel: ch,
      channelLabel: (MARKETING_CHANNEL_LABELS as Record<string, string>)[ch] || ch,
      budget: d.budget.toFixed(2),
      actualCost: d.actualCost.toFixed(2),
      leadsCount: d.leads
    })).sort((a, b) => Number(b.actualCost) - Number(a.actualCost));

    // 6. HR Workforce Metrics (Role-gated)
    let totalEmployees: number | null = null;
    let activeEmployees: number | null = null;
    let onLeaveEmployees: number | null = null;
    let todayAttendancePresencePercent: number | null = null;
    let pendingLeaveRequestsCount: number | null = null;
    let departmentDistribution: Array<{ departmentId: string; departmentName: string; employeeCount: number }> = [];

    let totEmp = 0;
    let actEmp = 0;
    let onLeaveEmp = 0;

    const deptMap = new Map<string, { name: string; count: number }>();
    for (const d of this.departments.values()) {
      if (d.organizationId === orgId && !d.deletedAt) {
        deptMap.set(d.id, { name: d.name, count: 0 });
      }
    }

    for (const emp of this.employees.values()) {
      if (emp.organizationId !== orgId || emp.deletedAt) continue;
      totEmp++;
      if (emp.status === 'active') actEmp++;
      else if (emp.status === 'on_leave') onLeaveEmp++;

      if (emp.departmentId && deptMap.has(emp.departmentId)) {
        deptMap.get(emp.departmentId)!.count++;
      }
    }

    totalEmployees = totEmp;

    if (isHrAuthorized) {
      activeEmployees = actEmp;
      onLeaveEmployees = onLeaveEmp;

      let todayPresent = 0;
      for (const att of this.attendanceRecords.values()) {
        if (att.organizationId === orgId && att.date === todayIsoDate) {
          if (att.status === 'present' || att.status === 'remote' || att.status === 'half_day') {
            todayPresent++;
          }
        }
      }
      todayAttendancePresencePercent =
        actEmp > 0 ? Math.min(100, Math.round((todayPresent / actEmp) * 100)) : 100;

      let pendingLeaves = 0;
      for (const lr of this.leaveRequests.values()) {
        if (lr.organizationId === orgId && lr.status === 'pending') {
          pendingLeaves++;
        }
      }
      pendingLeaveRequestsCount = pendingLeaves;

      departmentDistribution = Array.from(deptMap.entries()).map(([id, d]) => ({
        departmentId: id,
        departmentName: d.name,
        employeeCount: d.count
      })).sort((a, b) => b.employeeCount - a.employeeCount);
    }

    // 7. Recent Activity Feed (Filtered by organization and user visibility)
    const recentActivity = this.activityEvents
      .filter((ev) => ev.organizationId === orgId)
      .slice(-10)
      .reverse()
      .map((ev) => {
        const actor = ev.actorId ? this.users.get(ev.actorId) : null;
        let mod = 'system';
        if (ev.action.startsWith('crm.') || ev.resourceType === 'lead' || ev.resourceType === 'contact') mod = 'crm';
        else if (ev.action.startsWith('sales.') || ev.resourceType === 'opportunity' || ev.resourceType === 'quotation') mod = 'sales';
        else if (ev.action.startsWith('finance.') || ev.resourceType === 'invoice' || ev.resourceType === 'payment') mod = 'finance';
        else if (ev.action.startsWith('project.') || ev.resourceType === 'project' || ev.resourceType === 'task') mod = 'projects';
        else if (ev.action.startsWith('campaign.') || ev.resourceType === 'campaign') mod = 'marketing';
        else if (ev.action.startsWith('hr.') || ev.resourceType === 'employee' || ev.resourceType === 'leave') mod = 'hr';

        return {
          id: ev.id,
          action: ev.action,
          description: ev.description,
          actorName: actor?.fullName || 'System',
          timestamp: ev.createdAt,
          module: mod
        };
      });

    return {
      generatedAt: now.toISOString(),
      dateRange,
      periodStart,
      periodEnd,
      currency: query?.currency || 'USD',
      userRole,
      kpis: {
        activeLeadsCount,
        totalLeadsCount,
        convertedLeadsCount,
        leadConversionRatePercent,
        openOpportunitiesCount,
        openPipelineValue: openPipelineNum.toFixed(2),
        weightedForecastValue: weightedForecastNum.toFixed(2),
        closedWonValue: closedWonNum.toFixed(2),
        closedWonCount,
        winRatePercent,
        totalIncome: totalIncomeStr,
        totalExpenses: totalExpensesStr,
        netOperatingBalance: netBalanceStr,
        outstandingInvoicesAmount: outstandingInvoicesStr,
        overdueInvoicesAmount: overdueInvoicesStr,
        overdueInvoicesCount,
        isFinanceRestricted: !isFinancialAuthorized,
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        overdueTasksCount,
        taskCompletionRatePercent,
        activeCampaignsCount,
        totalMarketingSpend: totalMarketingSpendNum.toFixed(2),
        totalMarketingBudget: totalMarketingBudgetNum.toFixed(2),
        marketingBudgetUtilizationPercent,
        attributedLeadsCount,
        marketingConversionRatePercent,
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        todayAttendancePresencePercent,
        pendingLeaveRequestsCount,
        isHrRestricted: !isHrAuthorized
      },
      charts: {
        monthlyCashFlow,
        salesPipelineFunnel,
        leadSources,
        taskStatusDistribution,
        marketingChannelPerformance,
        departmentDistribution
      },
      recentActivity
    };
  }

  async generateReport(
    orgId: string,
    userRole: Role,
    reportType: ReportType,
    query?: AnalyticsFilterQuery
  ): Promise<CrossModuleReportDto> {
    const isFinancialAuthorized = userRole === 'owner' || userRole === 'admin';
    const isHrAuthorized = userRole === 'owner' || userRole === 'admin';
    const now = new Date();
    const periodStart = query?.startDate || '1970-01-01';
    const periodEnd = query?.endDate || now.toISOString().substring(0, 10);
    const currency = query?.currency || 'USD';

    switch (reportType) {
      case 'sales_pipeline': {
        const headers = ['Opportunity Name', 'Stage', 'Amount ($)', 'Probability (%)', 'Weighted Value ($)', 'Close Date', 'Account'];
        const rows: Array<Record<string, string | number>> = [];
        let totalVal = 0;
        let weightedVal = 0;

        for (const opp of this.opportunities.values()) {
          if (opp.organizationId !== orgId || opp.deletedAt) continue;
          const amt = Number(opp.amount || 0);
          const w = amt * (opp.probability / 100);
          totalVal += amt;
          weightedVal += w;

          const acc = opp.accountId ? this.accounts.get(opp.accountId) : null;
          rows.push({
            'Opportunity Name': opp.name,
            Stage: STAGE_DISPLAY_NAMES[opp.stage] || opp.stage,
            'Amount ($)': amt.toFixed(2),
            'Probability (%)': opp.probability,
            'Weighted Value ($)': w.toFixed(2),
            'Close Date': opp.expectedCloseDate ? opp.expectedCloseDate.substring(0, 10) : '—',
            Account: acc?.name || '—'
          });
        }

        return {
          reportType,
          title: REPORT_TYPE_LABELS[reportType],
          generatedAt: now.toISOString(),
          periodStart,
          periodEnd,
          currency,
          headers,
          rows,
          summaryRow: {
            'Opportunity Name': `Total (${rows.length} Deals)`,
            Stage: '—',
            'Amount ($)': totalVal.toFixed(2),
            'Probability (%)': '—',
            'Weighted Value ($)': weightedVal.toFixed(2),
            'Close Date': '—',
            Account: '—'
          }
        };
      }

      case 'financial_cashflow': {
        if (!isFinancialAuthorized) {
          throw new Error('Unauthorized: Finance reports require Administrator or Owner privileges');
        }
        const headers = ['Date', 'Type', 'Description', 'Category', 'Amount ($)', 'Payment Method', 'Status'];
        const rows: Array<Record<string, string | number>> = [];
        let netFlow = 0;

        for (const tx of this.financialTransactions.values()) {
          if (tx.organizationId !== orgId || tx.deletedAt) continue;
          const amt = Number(tx.amount || 0);
          if (tx.type === 'income') netFlow += amt;
          else netFlow -= amt;

          const cat = this.financialCategories.get(tx.categoryId);
          rows.push({
            Date: tx.date.substring(0, 10),
            Type: tx.type.toUpperCase(),
            Description: tx.description,
            Category: cat?.name || 'Uncategorized',
            'Amount ($)': amt.toFixed(2),
            'Payment Method': tx.paymentMethod,
            Status: tx.status
          });
        }

        return {
          reportType,
          title: REPORT_TYPE_LABELS[reportType],
          generatedAt: now.toISOString(),
          periodStart,
          periodEnd,
          currency,
          headers,
          rows,
          summaryRow: {
            Date: 'Total Net Flow',
            Type: '—',
            Description: `${rows.length} Ledger Transactions`,
            Category: '—',
            'Amount ($)': netFlow.toFixed(2),
            'Payment Method': '—',
            Status: '—'
          }
        };
      }

      case 'project_delivery': {
        const headers = ['Project Name', 'Priority', 'Status', 'Tasks Count', 'Completed Tasks', 'Progress (%)', 'Target End Date'];
        const rows: Array<Record<string, string | number>> = [];

        for (const p of this.projects.values()) {
          if (p.organizationId !== orgId || p.deletedAt) continue;
          let pTasks = 0;
          let pDone = 0;
          for (const t of this.tasks.values()) {
            if (t.projectId === p.id && !t.deletedAt) {
              pTasks++;
              if (t.status === 'completed') pDone++;
            }
          }
          const prog = pTasks > 0 ? Math.round((pDone / pTasks) * 100) : 0;

          rows.push({
            'Project Name': p.name,
            Priority: p.priority.toUpperCase(),
            Status: p.status.toUpperCase(),
            'Tasks Count': pTasks,
            'Completed Tasks': pDone,
            'Progress (%)': prog,
            'Target End Date': p.targetEndDate ? p.targetEndDate.substring(0, 10) : '—'
          });
        }

        return {
          reportType,
          title: REPORT_TYPE_LABELS[reportType],
          generatedAt: now.toISOString(),
          periodStart,
          periodEnd,
          currency,
          headers,
          rows
        };
      }

      case 'marketing_attribution': {
        const headers = ['Campaign Name', 'Channel', 'Status', 'Budget ($)', 'Spent ($)', 'Attributed Leads', 'Utilization (%)'];
        const rows: Array<Record<string, string | number>> = [];
        let totB = 0;
        let totS = 0;

        for (const camp of this.campaigns.values()) {
          if (camp.organizationId !== orgId || camp.deletedAt) continue;
          const b = Number(camp.budget || 0);
          const s = Number(camp.actualCost || 0);
          totB += b;
          totS += s;

          let lCount = 0;
          for (const cl of this.campaignLeads.values()) {
            if (cl.campaignId === camp.id) lCount++;
          }

          rows.push({
            'Campaign Name': camp.name,
            Channel: MARKETING_CHANNEL_LABELS[camp.channel] || camp.channel,
            Status: camp.status.toUpperCase(),
            'Budget ($)': b.toFixed(2),
            'Spent ($)': s.toFixed(2),
            'Attributed Leads': lCount,
            'Utilization (%)': b > 0 ? Math.round((s / b) * 100) : 0
          });
        }

        return {
          reportType,
          title: REPORT_TYPE_LABELS[reportType],
          generatedAt: now.toISOString(),
          periodStart,
          periodEnd,
          currency,
          headers,
          rows,
          summaryRow: {
            'Campaign Name': `Total (${rows.length} Campaigns)`,
            Channel: '—',
            Status: '—',
            'Budget ($)': totB.toFixed(2),
            'Spent ($)': totS.toFixed(2),
            'Attributed Leads': '—',
            'Utilization (%)': totB > 0 ? Math.round((totS / totB) * 100) : 0
          }
        };
      }

      case 'workforce_overview': {
        if (!isHrAuthorized) {
          throw new Error('Unauthorized: Workforce reports require Administrator or Owner privileges');
        }
        const headers = ['Employee ID', 'Full Name', 'Department', 'Designation', 'Status', 'Type', 'Joining Date'];
        const rows: Array<Record<string, string | number>> = [];

        for (const emp of this.employees.values()) {
          if (emp.organizationId !== orgId || emp.deletedAt) continue;
          const dept = emp.departmentId ? this.departments.get(emp.departmentId) : null;
          const des = emp.designationId ? this.designations.get(emp.designationId) : null;

          rows.push({
            'Employee ID': emp.employeeNumber,
            'Full Name': `${emp.firstName} ${emp.lastName}`,
            Department: dept?.name || 'General',
            Designation: des?.title || 'Staff',
            Status: emp.status.toUpperCase(),
            Type: emp.employmentType,
            'Joining Date': emp.joiningDate ? emp.joiningDate.substring(0, 10) : '—'
          });
        }

        return {
          reportType,
          title: REPORT_TYPE_LABELS[reportType],
          generatedAt: now.toISOString(),
          periodStart,
          periodEnd,
          currency,
          headers,
          rows
        };
      }

      case 'executive_summary':
      default: {
        const dash = await this.getExecutiveDashboard(orgId, userRole, query);
        const headers = ['Metric Category', 'Key Performance Indicator', 'Value'];
        const rows: Array<Record<string, string | number>> = [
          { 'Metric Category': 'Sales & Pipeline', 'Key Performance Indicator': 'Open Deals Pipeline Value', Value: `$${dash.kpis.openPipelineValue}` },
          { 'Metric Category': 'Sales & Pipeline', 'Key Performance Indicator': 'Weighted Forecast Value', Value: `$${dash.kpis.weightedForecastValue}` },
          { 'Metric Category': 'Sales & Pipeline', 'Key Performance Indicator': 'Closed Won Deals Value', Value: `$${dash.kpis.closedWonValue}` },
          { 'Metric Category': 'Sales & Pipeline', 'Key Performance Indicator': 'Sales Win Rate', Value: `${dash.kpis.winRatePercent}%` },
          { 'Metric Category': 'CRM & Inbound', 'Key Performance Indicator': 'Active Inbound Leads', Value: dash.kpis.activeLeadsCount },
          { 'Metric Category': 'CRM & Inbound', 'Key Performance Indicator': 'Lead Conversion Rate', Value: `${dash.kpis.leadConversionRatePercent}%` },
          { 'Metric Category': 'Project Delivery', 'Key Performance Indicator': 'Active Projects', Value: dash.kpis.activeProjects },
          { 'Metric Category': 'Project Delivery', 'Key Performance Indicator': 'Task Delivery Rate', Value: `${dash.kpis.taskCompletionRatePercent}%` },
          { 'Metric Category': 'Marketing', 'Key Performance Indicator': 'Active Campaigns', Value: dash.kpis.activeCampaignsCount },
          { 'Metric Category': 'Marketing', 'Key Performance Indicator': 'Attributed Leads Count', Value: dash.kpis.attributedLeadsCount }
        ];

        if (isFinancialAuthorized && dash.kpis.totalIncome) {
          rows.push(
            { 'Metric Category': 'Finance & Cashflow', 'Key Performance Indicator': 'Total Realized Income', Value: `$${dash.kpis.totalIncome}` },
            { 'Metric Category': 'Finance & Cashflow', 'Key Performance Indicator': 'Total Realized Expenses', Value: `$${dash.kpis.totalExpenses}` },
            { 'Metric Category': 'Finance & Cashflow', 'Key Performance Indicator': 'Net Operating Flow', Value: `$${dash.kpis.netOperatingBalance}` },
            { 'Metric Category': 'Finance & Cashflow', 'Key Performance Indicator': 'Outstanding Invoices', Value: `$${dash.kpis.outstandingInvoicesAmount}` }
          );
        }

        if (isHrAuthorized && dash.kpis.totalEmployees) {
          rows.push(
            { 'Metric Category': 'Workforce / HR', 'Key Performance Indicator': 'Total Active Workforce', Value: dash.kpis.activeEmployees || 0 },
            { 'Metric Category': 'Workforce / HR', 'Key Performance Indicator': 'Today Presence Rate', Value: `${dash.kpis.todayAttendancePresencePercent}%` }
          );
        }

        return {
          reportType: 'executive_summary',
          title: 'Executive Business Overview Report',
          generatedAt: now.toISOString(),
          periodStart,
          periodEnd,
          currency,
          headers,
          rows
        };
      }
    }
  }

  async exportReportCsv(
    orgId: string,
    userRole: Role,
    reportType: ReportType,
    query?: AnalyticsFilterQuery
  ): Promise<string> {
    const report = await this.generateReport(orgId, userRole, reportType, query);
    const escapeCsv = (val: string | number | undefined): string => {
      if (val === undefined || val === null) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const lines: string[] = [];
    // Header line
    lines.push(report.headers.map(escapeCsv).join(','));

    // Rows
    for (const r of report.rows) {
      const line = report.headers.map((h) => escapeCsv(r[h])).join(',');
      lines.push(line);
    }

    // Summary row if present
    if (report.summaryRow) {
      const sumLine = report.headers.map((h) => escapeCsv(report.summaryRow![h])).join(',');
      lines.push(sumLine);
    }

    return lines.join('\n');
  }


}

export const repository = new InMemoryRepository();
