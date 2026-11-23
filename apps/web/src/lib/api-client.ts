import type {
  HealthCheckResponse,
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  InviteMemberInput,
  CreateFileMetadataInput,
  Role,
  AuthSessionDto,
  UserDto,
  OrganizationDto,
  OrganizationMembershipDto,
  InvitationDto,
  FileMetadataDto,
  NotificationDto,
  ActivityEventDto,
  AuditLogDto,
  PaginationQuery,
  PaginatedResult,
  LeadDto,
  CreateLeadInput,
  UpdateLeadInput,
  AccountDto,
  CreateAccountInput,
  UpdateAccountInput,
  ContactDto,
  CreateContactInput,
  UpdateContactInput,
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
  FinancialTransactionDto,
  CreateTransactionInput,
  UpdateTransactionInput,
  InvoiceDto,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  PaymentRecordDto,
  CreatePaymentInput,
  BudgetDto,
  CreateBudgetInput,
  UpdateBudgetInput,
  FinancialSummaryDto,
  ProjectDto,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectMemberDto,
  AddProjectMemberInput,
  MilestoneDto,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  TaskDto,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  CommentDto,
  CreateCommentInput,
  ProjectSummaryDto,
  CampaignDto,
  CreateCampaignInput,
  UpdateCampaignInput,
  AttributedLeadDto,
  AssociateLeadInput,
  MarketingSummaryDto,
  ChannelPerformanceDto,
  DepartmentDto,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DesignationDto,
  CreateDesignationInput,
  UpdateDesignationInput,
  EmployeeDto,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  AttendanceRecordDto,
  RecordAttendanceInput,
  UpdateAttendanceInput,
  LeaveRequestDto,
  CreateLeaveRequestInput,
  UpdateLeaveStatusInput,
  HrSummaryDto,
  ExecutiveDashboardDto,
  CrossModuleReportDto,
  ReportType,
  AnalyticsDateRange,
  AnalyticsFilterQuery
} from '@ai-business-manager/shared';

export interface HealthCheckResult {
  isOnline: boolean;
  data: HealthCheckResponse | null;
  error: string | null;
  latencyMs: number;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function buildQueryString(query?: Partial<PaginationQuery> & Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(query)) {
    if (val !== undefined && val !== null && val !== '') {
      params.append(key, String(val));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Ensure cookies are sent with every request
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers
    }
  });

  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    const errorMsg = payload.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    (error as unknown as { code?: string }).code = payload.error?.code;
    throw error;
  }

  return (payload.data !== undefined ? payload.data : payload) as T;
}

export const apiClient = {
  getBaseUrl(): string {
    return API_BASE_URL || window.location.origin;
  },

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    const endpoint = '/api/health';

    try {
      const data = await fetchJson<HealthCheckResponse>(endpoint);
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        isOnline: data.status === 'ok',
        data,
        error: null,
        latencyMs
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        isOnline: false,
        data: null,
        error: err instanceof Error ? err.message : 'Connection failed',
        latencyMs
      };
    }
  },

  // ==========================================
  // Auth
  // ==========================================
  async register(data: RegisterInput): Promise<AuthSessionDto> {
    return fetchJson<AuthSessionDto>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async login(data: LoginInput): Promise<AuthSessionDto> {
    return fetchJson<AuthSessionDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async logout(): Promise<void> {
    await fetchJson('/api/auth/logout', { method: 'POST' });
  },

  async getMe(): Promise<AuthSessionDto> {
    return fetchJson<AuthSessionDto>('/api/auth/me');
  },

  // ==========================================
  // Users
  // ==========================================
  async updateProfile(data: UpdateProfileInput): Promise<UserDto> {
    return fetchJson<UserDto>('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // ==========================================
  // Organizations
  // ==========================================
  async createOrganization(data: CreateOrganizationInput): Promise<{ organization: OrganizationDto; membership: OrganizationMembershipDto }> {
    return fetchJson('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getOrganizations(): Promise<(OrganizationDto & { role: Role; membershipStatus: string })[]> {
    return fetchJson('/api/organizations');
  },

  async switchOrganization(organizationId: string): Promise<{ activeOrganization: OrganizationDto; currentMembership: OrganizationMembershipDto }> {
    return fetchJson('/api/organizations/switch', {
      method: 'POST',
      body: JSON.stringify({ organizationId })
    });
  },

  async getCurrentOrganization(): Promise<{ organization: OrganizationDto; membership: OrganizationMembershipDto }> {
    return fetchJson('/api/organizations/current');
  },

  async updateCurrentOrganization(data: UpdateOrganizationInput): Promise<OrganizationDto> {
    return fetchJson<OrganizationDto>('/api/organizations/current', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // ==========================================
  // Members & Invitations
  // ==========================================
  async getMembers(): Promise<(OrganizationMembershipDto & { user: UserDto })[]> {
    return fetchJson('/api/organizations/current/members');
  },

  async updateMemberRole(memberId: string, role: Role): Promise<OrganizationMembershipDto> {
    return fetchJson(`/api/organizations/current/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  async removeMember(memberId: string): Promise<void> {
    await fetchJson(`/api/organizations/current/members/${memberId}`, {
      method: 'DELETE'
    });
  },

  async getInvitations(): Promise<InvitationDto[]> {
    return fetchJson('/api/organizations/current/invitations');
  },

  async inviteMember(data: InviteMemberInput): Promise<{ invitation: InvitationDto; invitationToken: string }> {
    return fetchJson('/api/organizations/current/invitations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async revokeInvitation(invitationId: string): Promise<void> {
    await fetchJson(`/api/organizations/current/invitations/${invitationId}`, {
      method: 'DELETE'
    });
  },

  async acceptInvitation(token: string): Promise<{ message: string; membership: OrganizationMembershipDto; organization: OrganizationDto }> {
    return fetchJson('/api/organizations/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  // ==========================================
  // Phase 3: Files & Storage
  // ==========================================
  async getFiles(query?: Partial<PaginationQuery> & { visibility?: string }): Promise<PaginatedResult<FileMetadataDto>> {
    return fetchJson<PaginatedResult<FileMetadataDto>>(`/api/files${buildQueryString(query)}`);
  },

  async listFiles(query?: Partial<PaginationQuery> & { visibility?: string }): Promise<PaginatedResult<FileMetadataDto>> {
    return this.getFiles(query);
  },

  async createFileMetadata(data: CreateFileMetadataInput): Promise<{ file: FileMetadataDto; uploadUrl: string; expiresAt: string }> {
    return fetchJson('/api/files/metadata', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getFileAccessUrl(fileId: string): Promise<{ downloadUrl: string; expiresAt: string; fileName: string; mimeType: string }> {
    return fetchJson(`/api/files/${fileId}/access-url`);
  },

  async deleteFile(fileId: string): Promise<void> {
    await fetchJson(`/api/files/${fileId}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 3: Notifications
  // ==========================================
  async getNotifications(query?: Partial<PaginationQuery>, unreadOnly?: boolean): Promise<PaginatedResult<NotificationDto>> {
    const combined = { ...query, unreadOnly };
    return fetchJson<PaginatedResult<NotificationDto>>(`/api/notifications${buildQueryString(combined)}`);
  },

  async getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
    return fetchJson<{ unreadCount: number }>('/api/notifications/unread-count');
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetchJson(`/api/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetchJson('/api/notifications/mark-all-read', {
      method: 'POST'
    });
  },

  // ==========================================
  // Phase 3: Activities & Audit
  // ==========================================
  async getActivities(query?: Partial<PaginationQuery>, resourceType?: string): Promise<PaginatedResult<ActivityEventDto>> {
    const combined = { ...query, resourceType };
    return fetchJson<PaginatedResult<ActivityEventDto>>(`/api/activities${buildQueryString(combined)}`);
  },

  async getAuditLogs(query?: Partial<PaginationQuery> & { action?: string }): Promise<PaginatedResult<AuditLogDto>> {
    return fetchJson<PaginatedResult<AuditLogDto>>(`/api/audit-logs${buildQueryString(query)}`);
  },

  // ==========================================
  // Phase 4: CRM — Leads
  // ==========================================
  async getLeads(
    query?: Partial<PaginationQuery> & { status?: string; source?: string; assignedToId?: string }
  ): Promise<PaginatedResult<LeadDto>> {
    return fetchJson<PaginatedResult<LeadDto>>(`/api/crm/leads${buildQueryString(query)}`);
  },

  async getLead(id: string): Promise<LeadDto> {
    return fetchJson<LeadDto>(`/api/crm/leads/${id}`);
  },

  async createLead(data: CreateLeadInput): Promise<LeadDto> {
    return fetchJson<LeadDto>('/api/crm/leads', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateLead(id: string, data: UpdateLeadInput): Promise<LeadDto> {
    return fetchJson<LeadDto>(`/api/crm/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async assignLead(id: string, assignedToId: string | null): Promise<LeadDto> {
    return fetchJson<LeadDto>(`/api/crm/leads/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedToId })
    });
  },

  async convertLead(id: string, data: ConvertLeadInput): Promise<ConvertLeadResultDto> {
    return fetchJson<ConvertLeadResultDto>(`/api/crm/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteLead(id: string): Promise<void> {
    await fetchJson(`/api/crm/leads/${id}`, {
      method: 'DELETE'
    });
  },

  async checkCrmDuplicates(data: CheckDuplicatesInput): Promise<DuplicateCheckResultDto> {
    return fetchJson<DuplicateCheckResultDto>('/api/crm/leads/check-duplicates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // ==========================================
  // Phase 4: CRM — Accounts (Companies)
  // ==========================================
  async getAccounts(
    query?: Partial<PaginationQuery> & { industry?: string }
  ): Promise<PaginatedResult<AccountDto>> {
    return fetchJson<PaginatedResult<AccountDto>>(`/api/crm/accounts${buildQueryString(query)}`);
  },

  async getAccount(id: string): Promise<AccountDto> {
    return fetchJson<AccountDto>(`/api/crm/accounts/${id}`);
  },

  async createAccount(data: CreateAccountInput): Promise<AccountDto> {
    return fetchJson<AccountDto>('/api/crm/accounts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAccount(id: string, data: UpdateAccountInput): Promise<AccountDto> {
    return fetchJson<AccountDto>(`/api/crm/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteAccount(id: string): Promise<void> {
    await fetchJson(`/api/crm/accounts/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 4: CRM — Contacts
  // ==========================================
  async getContacts(
    query?: Partial<PaginationQuery> & { accountId?: string }
  ): Promise<PaginatedResult<ContactDto>> {
    return fetchJson<PaginatedResult<ContactDto>>(`/api/crm/contacts${buildQueryString(query)}`);
  },

  async getContact(id: string): Promise<ContactDto> {
    return fetchJson<ContactDto>(`/api/crm/contacts/${id}`);
  },

  async createContact(data: CreateContactInput): Promise<ContactDto> {
    return fetchJson<ContactDto>('/api/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateContact(id: string, data: UpdateContactInput): Promise<ContactDto> {
    return fetchJson<ContactDto>(`/api/crm/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteContact(id: string): Promise<void> {
    await fetchJson(`/api/crm/contacts/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 4: CRM — Activities & Follow-ups
  // ==========================================
  async getCrmActivities(
    query?: Partial<PaginationQuery> & {
      leadId?: string;
      contactId?: string;
      accountId?: string;
      status?: string;
      type?: string;
    }
  ): Promise<PaginatedResult<CrmActivityDto>> {
    return fetchJson<PaginatedResult<CrmActivityDto>>(`/api/crm/activities${buildQueryString(query)}`);
  },

  async createCrmActivity(data: CreateCrmActivityInput): Promise<CrmActivityDto> {
    return fetchJson<CrmActivityDto>('/api/crm/activities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateCrmActivity(id: string, data: UpdateCrmActivityInput): Promise<CrmActivityDto> {
    return fetchJson<CrmActivityDto>(`/api/crm/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // ==========================================
  // Phase 5: Sales — Opportunities & Pipeline
  // ==========================================
  async getOpportunities(
    query?: Partial<PaginationQuery> & {
      stage?: string;
      accountId?: string;
      assignedToId?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ): Promise<PaginatedResult<DetailedOpportunityDto>> {
    return fetchJson<PaginatedResult<DetailedOpportunityDto>>(`/api/sales/opportunities${buildQueryString(query)}`);
  },

  async getOpportunity(id: string): Promise<DetailedOpportunityDto> {
    return fetchJson<DetailedOpportunityDto>(`/api/sales/opportunities/${id}`);
  },

  async createOpportunity(data: CreateOpportunityInput): Promise<DetailedOpportunityDto> {
    return fetchJson<DetailedOpportunityDto>('/api/sales/opportunities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateOpportunity(id: string, data: UpdateOpportunityInput): Promise<DetailedOpportunityDto> {
    return fetchJson<DetailedOpportunityDto>(`/api/sales/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async updateOpportunityStage(id: string, data: UpdateOpportunityStageInput): Promise<DetailedOpportunityDto> {
    return fetchJson<DetailedOpportunityDto>(`/api/sales/opportunities/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async getOpportunityHistory(id: string): Promise<OpportunityStageHistoryDto[]> {
    return fetchJson<OpportunityStageHistoryDto[]>(`/api/sales/opportunities/${id}/history`);
  },

  async deleteOpportunity(id: string): Promise<void> {
    await fetchJson(`/api/sales/opportunities/${id}`, {
      method: 'DELETE'
    });
  },

  async getSalesForecast(): Promise<SalesForecastSummaryDto> {
    return fetchJson<SalesForecastSummaryDto>('/api/sales/forecast');
  },

  // ==========================================
  // Phase 5: Sales — Quotations & Proposals
  // ==========================================
  async getQuotations(
    query?: Partial<PaginationQuery> & {
      opportunityId?: string;
      accountId?: string;
      status?: string;
    }
  ): Promise<PaginatedResult<QuotationDto>> {
    return fetchJson<PaginatedResult<QuotationDto>>(`/api/sales/quotations${buildQueryString(query)}`);
  },

  async getQuotation(id: string): Promise<QuotationDto> {
    return fetchJson<QuotationDto>(`/api/sales/quotations/${id}`);
  },

  async createQuotation(data: CreateQuotationInput): Promise<QuotationDto> {
    return fetchJson<QuotationDto>('/api/sales/quotations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateQuotationStatus(id: string, data: UpdateQuotationStatusInput): Promise<QuotationDto> {
    return fetchJson<QuotationDto>(`/api/sales/quotations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteQuotation(id: string): Promise<void> {
    await fetchJson(`/api/sales/quotations/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 6: Operational Finance — Categories
  // ==========================================
  async getFinancialCategories(type?: string): Promise<FinancialCategoryDto[]> {
    return fetchJson<FinancialCategoryDto[]>(`/api/finance/categories${buildQueryString({ type })}`);
  },

  async createFinancialCategory(data: CreateFinancialCategoryInput): Promise<FinancialCategoryDto> {
    return fetchJson<FinancialCategoryDto>('/api/finance/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateFinancialCategory(id: string, data: UpdateFinancialCategoryInput): Promise<FinancialCategoryDto> {
    return fetchJson<FinancialCategoryDto>(`/api/finance/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteFinancialCategory(id: string): Promise<void> {
    await fetchJson(`/api/finance/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 6: Operational Finance — Transactions
  // ==========================================
  async getFinancialTransactions(
    query?: Partial<PaginationQuery> & {
      type?: string;
      categoryId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      accountId?: string;
    }
  ): Promise<PaginatedResult<FinancialTransactionDto>> {
    return fetchJson<PaginatedResult<FinancialTransactionDto>>(
      `/api/finance/transactions${buildQueryString(query)}`
    );
  },

  async getFinancialTransaction(id: string): Promise<FinancialTransactionDto> {
    return fetchJson<FinancialTransactionDto>(`/api/finance/transactions/${id}`);
  },

  async createFinancialTransaction(data: CreateTransactionInput): Promise<FinancialTransactionDto> {
    return fetchJson<FinancialTransactionDto>('/api/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateFinancialTransaction(
    id: string,
    data: UpdateTransactionInput
  ): Promise<FinancialTransactionDto> {
    return fetchJson<FinancialTransactionDto>(`/api/finance/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteFinancialTransaction(id: string): Promise<void> {
    await fetchJson(`/api/finance/transactions/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 6: Operational Finance — Invoices
  // ==========================================
  async getInvoices(
    query?: Partial<PaginationQuery> & {
      accountId?: string;
      status?: string;
      isOverdue?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResult<InvoiceDto>> {
    return fetchJson<PaginatedResult<InvoiceDto>>(`/api/finance/invoices${buildQueryString(query)}`);
  },

  async getInvoice(id: string): Promise<InvoiceDto> {
    return fetchJson<InvoiceDto>(`/api/finance/invoices/${id}`);
  },

  async createInvoice(data: CreateInvoiceInput): Promise<InvoiceDto> {
    return fetchJson<InvoiceDto>('/api/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async createInvoiceFromQuotation(quotationId: string): Promise<InvoiceDto> {
    return fetchJson<InvoiceDto>(`/api/finance/invoices/from-quotation/${quotationId}`, {
      method: 'POST'
    });
  },

  async updateInvoiceStatus(id: string, status: string): Promise<InvoiceDto> {
    return fetchJson<InvoiceDto>(`/api/finance/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async deleteInvoice(id: string): Promise<void> {
    await fetchJson(`/api/finance/invoices/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 6: Operational Finance — Payments
  // ==========================================
  async getPaymentRecords(
    query?: Partial<PaginationQuery> & {
      invoiceId?: string;
      accountId?: string;
    }
  ): Promise<PaginatedResult<PaymentRecordDto>> {
    return fetchJson<PaginatedResult<PaymentRecordDto>>(`/api/finance/payments${buildQueryString(query)}`);
  },

  async getPaymentRecord(id: string): Promise<PaymentRecordDto> {
    return fetchJson<PaymentRecordDto>(`/api/finance/payments/${id}`);
  },

  async recordPayment(data: CreatePaymentInput): Promise<PaymentRecordDto> {
    return fetchJson<PaymentRecordDto>('/api/finance/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async voidPaymentRecord(id: string): Promise<void> {
    await fetchJson(`/api/finance/payments/${id}/void`, {
      method: 'PATCH'
    });
  },

  // ==========================================
  // Phase 6: Operational Finance — Budgets
  // ==========================================
  async getBudgets(query?: Partial<PaginationQuery>): Promise<PaginatedResult<BudgetDto>> {
    return fetchJson<PaginatedResult<BudgetDto>>(`/api/finance/budgets${buildQueryString(query)}`);
  },

  async getBudget(id: string): Promise<BudgetDto> {
    return fetchJson<BudgetDto>(`/api/finance/budgets/${id}`);
  },

  async createBudget(data: CreateBudgetInput): Promise<BudgetDto> {
    return fetchJson<BudgetDto>('/api/finance/budgets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateBudget(id: string, data: UpdateBudgetInput): Promise<BudgetDto> {
    return fetchJson<BudgetDto>(`/api/finance/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteBudget(id: string): Promise<void> {
    await fetchJson(`/api/finance/budgets/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 6: Operational Finance — Summaries & Reports
  // ==========================================
  async getFinancialSummary(params?: {
    startDate?: string;
    endDate?: string;
    currency?: string;
  }): Promise<FinancialSummaryDto> {
    return fetchJson<FinancialSummaryDto>(`/api/finance/summary${buildQueryString(params)}`);
  },

  // ==========================================
  // Phase 7: Project Management
  // ==========================================
  async getProjectSummary(): Promise<ProjectSummaryDto> {
    return fetchJson<ProjectSummaryDto>('/api/projects/summary');
  },

  async getProjects(
    query?: Partial<PaginationQuery> & {
      status?: string;
      priority?: string;
      ownerId?: string;
      accountId?: string;
      opportunityId?: string;
    }
  ): Promise<PaginatedResult<ProjectDto>> {
    return fetchJson<PaginatedResult<ProjectDto>>(`/api/projects${buildQueryString(query)}`);
  },

  async getProject(id: string): Promise<ProjectDto> {
    return fetchJson<ProjectDto>(`/api/projects/${id}`);
  },

  async createProject(data: CreateProjectInput): Promise<ProjectDto> {
    return fetchJson<ProjectDto>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateProject(id: string, data: UpdateProjectInput): Promise<ProjectDto> {
    return fetchJson<ProjectDto>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteProject(id: string): Promise<void> {
    await fetchJson(`/api/projects/${id}`, {
      method: 'DELETE'
    });
  },

  // Project Members
  async getProjectMembers(projectId: string): Promise<ProjectMemberDto[]> {
    return fetchJson<ProjectMemberDto[]>(`/api/projects/${projectId}/members`);
  },

  async addProjectMember(projectId: string, data: AddProjectMemberInput): Promise<ProjectMemberDto> {
    return fetchJson<ProjectMemberDto>(`/api/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await fetchJson(`/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE'
    });
  },

  // Milestones
  async getProjectMilestones(projectId: string): Promise<MilestoneDto[]> {
    return fetchJson<MilestoneDto[]>(`/api/projects/${projectId}/milestones`);
  },

  async createMilestone(projectId: string, data: CreateMilestoneInput): Promise<MilestoneDto> {
    return fetchJson<MilestoneDto>(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateMilestone(id: string, data: UpdateMilestoneInput): Promise<MilestoneDto> {
    return fetchJson<MilestoneDto>(`/api/projects/milestones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteMilestone(id: string): Promise<void> {
    await fetchJson(`/api/projects/milestones/${id}`, {
      method: 'DELETE'
    });
  },

  // Tasks & Subtasks
  async getTasks(
    query?: Partial<PaginationQuery> & {
      projectId?: string;
      milestoneId?: string;
      parentTaskId?: string | null;
      status?: string;
      priority?: string;
      assigneeId?: string;
      isOverdue?: boolean;
      sortBy?: string;
      sortOrder?: string;
    }
  ): Promise<PaginatedResult<TaskDto>> {
    return fetchJson<PaginatedResult<TaskDto>>(`/api/projects/tasks${buildQueryString(query)}`);
  },

  async getTask(id: string): Promise<TaskDto> {
    return fetchJson<TaskDto>(`/api/projects/tasks/${id}`);
  },

  async createTask(data: CreateTaskInput): Promise<TaskDto> {
    return fetchJson<TaskDto>('/api/projects/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateTask(id: string, data: UpdateTaskInput): Promise<TaskDto> {
    return fetchJson<TaskDto>(`/api/projects/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async updateTaskStatus(id: string, data: UpdateTaskStatusInput): Promise<TaskDto> {
    return fetchJson<TaskDto>(`/api/projects/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteTask(id: string): Promise<void> {
    await fetchJson(`/api/projects/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  // Comments
  async getProjectComments(projectId: string, taskId?: string): Promise<CommentDto[]> {
    return fetchJson<CommentDto[]>(`/api/projects/${projectId}/comments${buildQueryString({ taskId })}`);
  },

  async createProjectComment(projectId: string, data: CreateCommentInput): Promise<CommentDto> {
    return fetchJson<CommentDto>(`/api/projects/${projectId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteProjectComment(commentId: string): Promise<void> {
    await fetchJson(`/api/projects/comments/${commentId}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 8: Marketing Management
  // ==========================================

  async getMarketingSummary(): Promise<MarketingSummaryDto> {
    return fetchJson<MarketingSummaryDto>('/api/marketing/summary');
  },

  async getCampaigns(
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      channel?: string;
      type?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResult<CampaignDto>> {
    return fetchJson<PaginatedResult<CampaignDto>>(`/api/marketing/campaigns${buildQueryString(query)}`);
  },

  async getCampaign(id: string): Promise<CampaignDto> {
    return fetchJson<CampaignDto>(`/api/marketing/campaigns/${id}`);
  },

  async createCampaign(data: CreateCampaignInput): Promise<CampaignDto> {
    return fetchJson<CampaignDto>('/api/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateCampaign(id: string, data: UpdateCampaignInput): Promise<CampaignDto> {
    return fetchJson<CampaignDto>(`/api/marketing/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteCampaign(id: string): Promise<void> {
    await fetchJson(`/api/marketing/campaigns/${id}`, {
      method: 'DELETE'
    });
  },

  async getCampaignLeads(campaignId: string): Promise<AttributedLeadDto[]> {
    return fetchJson<AttributedLeadDto[]>(`/api/marketing/campaigns/${campaignId}/leads`);
  },

  async associateLeadToCampaign(campaignId: string, data: AssociateLeadInput): Promise<AttributedLeadDto> {
    return fetchJson<AttributedLeadDto>(`/api/marketing/campaigns/${campaignId}/leads`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async removeLeadFromCampaign(campaignId: string, leadId: string): Promise<void> {
    await fetchJson(`/api/marketing/campaigns/${campaignId}/leads/${leadId}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 9: HR Management
  // ==========================================

  // --- HR Summary ---

  async getHrSummary(): Promise<HrSummaryDto> {
    return fetchJson<HrSummaryDto>('/api/hr/summary');
  },

  // --- Departments ---

  async getDepartments(): Promise<DepartmentDto[]> {
    return fetchJson<DepartmentDto[]>('/api/hr/departments');
  },

  async getDepartment(id: string): Promise<DepartmentDto> {
    return fetchJson<DepartmentDto>(`/api/hr/departments/${id}`);
  },

  async createDepartment(data: CreateDepartmentInput): Promise<DepartmentDto> {
    return fetchJson<DepartmentDto>('/api/hr/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateDepartment(id: string, data: UpdateDepartmentInput): Promise<DepartmentDto> {
    return fetchJson<DepartmentDto>(`/api/hr/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteDepartment(id: string): Promise<void> {
    await fetchJson(`/api/hr/departments/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Designations ---

  async getDesignations(departmentId?: string): Promise<DesignationDto[]> {
    return fetchJson<DesignationDto[]>(`/api/hr/designations${buildQueryString({ departmentId })}`);
  },

  async getDesignation(id: string): Promise<DesignationDto> {
    return fetchJson<DesignationDto>(`/api/hr/designations/${id}`);
  },

  async createDesignation(data: CreateDesignationInput): Promise<DesignationDto> {
    return fetchJson<DesignationDto>('/api/hr/designations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateDesignation(id: string, data: UpdateDesignationInput): Promise<DesignationDto> {
    return fetchJson<DesignationDto>(`/api/hr/designations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteDesignation(id: string): Promise<void> {
    await fetchJson(`/api/hr/designations/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Employees ---

  async getEmployees(
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
    return fetchJson<PaginatedResult<EmployeeDto>>(`/api/hr/employees${buildQueryString(query)}`);
  },

  async getMyEmployeeProfile(): Promise<EmployeeDto> {
    return fetchJson<EmployeeDto>('/api/hr/employees/me');
  },

  async getEmployee(id: string): Promise<EmployeeDto> {
    return fetchJson<EmployeeDto>(`/api/hr/employees/${id}`);
  },

  async createEmployee(data: CreateEmployeeInput): Promise<EmployeeDto> {
    return fetchJson<EmployeeDto>('/api/hr/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateEmployee(id: string, data: UpdateEmployeeInput): Promise<EmployeeDto> {
    return fetchJson<EmployeeDto>(`/api/hr/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteEmployee(id: string): Promise<void> {
    await fetchJson(`/api/hr/employees/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Attendance ---

  async getAttendance(
    query?: {
      page?: number;
      limit?: number;
      date?: string;
      employeeId?: string;
      status?: string;
      month?: string;
    }
  ): Promise<PaginatedResult<AttendanceRecordDto>> {
    return fetchJson<PaginatedResult<AttendanceRecordDto>>(`/api/hr/attendance${buildQueryString(query)}`);
  },

  async recordAttendance(data: RecordAttendanceInput): Promise<AttendanceRecordDto> {
    return fetchJson<AttendanceRecordDto>('/api/hr/attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAttendance(id: string, data: UpdateAttendanceInput): Promise<AttendanceRecordDto> {
    return fetchJson<AttendanceRecordDto>(`/api/hr/attendance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteAttendance(id: string): Promise<void> {
    await fetchJson(`/api/hr/attendance/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Leave Requests ---

  async getLeaveRequests(
    query?: {
      page?: number;
      limit?: number;
      employeeId?: string;
      status?: string;
      leaveType?: string;
      year?: string;
    }
  ): Promise<PaginatedResult<LeaveRequestDto>> {
    return fetchJson<PaginatedResult<LeaveRequestDto>>(`/api/hr/leaves${buildQueryString(query)}`);
  },

  async getLeaveRequest(id: string): Promise<LeaveRequestDto> {
    return fetchJson<LeaveRequestDto>(`/api/hr/leaves/${id}`);
  },

  async createLeaveRequest(data: CreateLeaveRequestInput): Promise<LeaveRequestDto> {
    return fetchJson<LeaveRequestDto>('/api/hr/leaves', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateLeaveStatus(id: string, data: UpdateLeaveStatusInput): Promise<LeaveRequestDto> {
    return fetchJson<LeaveRequestDto>(`/api/hr/leaves/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async cancelLeaveRequest(id: string): Promise<void> {
    await fetchJson(`/api/hr/leaves/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // Phase 10: Executive Dashboard & Analytics
  // ==========================================

  async getExecutiveDashboard(query?: AnalyticsFilterQuery): Promise<ExecutiveDashboardDto> {
    return fetchJson<ExecutiveDashboardDto>(`/api/analytics/dashboard${buildQueryString(query as any)}`);
  },

  async getReport(reportType: ReportType, query?: AnalyticsFilterQuery): Promise<CrossModuleReportDto> {
    return fetchJson<CrossModuleReportDto>(`/api/analytics/reports/${reportType}${buildQueryString(query as any)}`);
  },

  getReportExportUrl(reportType: ReportType, query?: AnalyticsFilterQuery): string {
    return `${API_BASE_URL}/api/analytics/export/${reportType}${buildQueryString(query as any)}`;
  }
};
