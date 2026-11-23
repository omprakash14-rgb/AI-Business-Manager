import { pgTable, uuid, varchar, text, timestamp, unique, index, integer, boolean, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  status: varchar('status', { length: 30 }).default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  status: varchar('status', { length: 30 }).default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 30 }).notNull(), // 'owner' | 'admin' | 'member'
    status: varchar('status', { length: 30 }).default('active').notNull(), // 'active' | 'invited' | 'suspended'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    unique('org_user_uniq').on(table.organizationId, table.userId),
    index('idx_org_members_org_id').on(table.organizationId),
    index('idx_org_members_user_id').on(table.userId)
  ]
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey().notNull(), // SHA-256 hash of random session token
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    activeOrganizationId: uuid('active_organization_id')
      .references(() => organizations.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_sessions_user_id').on(table.userId),
    index('idx_sessions_expires_at').on(table.expiresAt)
  ]
);

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 30 }).notNull(), // 'admin' | 'member'
    tokenHash: text('token_hash').notNull().unique(),
    invitedById: uuid('invited_by_id').references(() => users.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 30 }).default('pending').notNull(), // 'pending' | 'accepted' | 'revoked' | 'expired'
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_invitations_org_id').on(table.organizationId),
    index('idx_invitations_email').on(table.email)
  ]
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(),
    metadata: text('metadata'),
    ipAddress: varchar('ip_address', { length: 50 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_audit_org_id').on(table.organizationId),
    index('idx_audit_created_at').on(table.createdAt)
  ]
);

// ==========================================
// Phase 3: Shared Platform Services Tables
// ==========================================

export const files = pgTable(
  'files',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    uploadedById: uuid('uploaded_by_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileKey: text('file_key').notNull().unique(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    storageProvider: varchar('storage_provider', { length: 50 }).default('local-private').notNull(),
    visibility: varchar('visibility', { length: 30 }).default('organization').notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft deletion support
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_files_org_id').on(table.organizationId),
    index('idx_files_file_key').on(table.fileKey),
    index('idx_files_deleted_at').on(table.deletedAt)
  ]
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    body: text('body').notNull(),
    type: varchar('type', { length: 50 }).default('system').notNull(),
    link: text('link'),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_notifications_org_user_read').on(table.organizationId, table.userId, table.isRead),
    index('idx_notifications_created_at').on(table.createdAt)
  ]
);

export const activityEvents = pgTable(
  'activity_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    resourceType: varchar('resource_type', { length: 50 }).notNull(),
    resourceId: varchar('resource_id', { length: 100 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    description: text('description').notNull(),
    metadata: text('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_activity_org_id').on(table.organizationId),
    index('idx_activity_resource').on(table.resourceType, table.resourceId),
    index('idx_activity_created_at').on(table.createdAt)
  ]
);

// ==========================================
// Phase 4: CRM & Lead Management Tables
// ==========================================

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    industry: varchar('industry', { length: 100 }),
    website: varchar('website', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    assignedToId: uuid('assigned_to_id').references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_accounts_org_id').on(table.organizationId),
    index('idx_accounts_name').on(table.organizationId, table.name),
    index('idx_accounts_created_at').on(table.organizationId, table.createdAt),
    index('idx_accounts_deleted_at').on(table.deletedAt)
  ]
);

export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    jobTitle: varchar('job_title', { length: 100 }),
    assignedToId: uuid('assigned_to_id').references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_contacts_org_id').on(table.organizationId),
    index('idx_contacts_account_id').on(table.organizationId, table.accountId),
    index('idx_contacts_email').on(table.organizationId, table.email),
    index('idx_contacts_created_at').on(table.organizationId, table.createdAt),
    index('idx_contacts_deleted_at').on(table.deletedAt)
  ]
);

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).default('').notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    companyName: varchar('company_name', { length: 200 }),
    source: varchar('source', { length: 50 }).default('website').notNull(),
    status: varchar('status', { length: 50 }).default('new').notNull(),
    assignedToId: uuid('assigned_to_id').references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'),
    estimatedValue: numeric('estimated_value', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    convertedAt: timestamp('converted_at', { withTimezone: true }),
    convertedAccountId: uuid('converted_account_id').references(() => accounts.id, { onDelete: 'set null' }),
    convertedContactId: uuid('converted_contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    convertedOpportunityId: uuid('converted_opportunity_id'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_leads_org_id').on(table.organizationId),
    index('idx_leads_status').on(table.organizationId, table.status),
    index('idx_leads_assigned_to').on(table.organizationId, table.assignedToId),
    index('idx_leads_email').on(table.organizationId, table.email),
    index('idx_leads_created_at').on(table.organizationId, table.createdAt),
    index('idx_leads_deleted_at').on(table.deletedAt)
  ]
);

export const opportunities = pgTable(
  'opportunities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    stage: varchar('stage', { length: 50 }).default('prospecting').notNull(),
    probability: integer('probability').default(20).notNull(),
    expectedCloseDate: timestamp('expected_close_date', { withTimezone: true }),
    assignedToId: uuid('assigned_to_id').references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'),
    winLossReason: text('win_loss_reason'),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_opportunities_org_id').on(table.organizationId),
    index('idx_opportunities_stage').on(table.organizationId, table.stage),
    index('idx_opportunities_account').on(table.organizationId, table.accountId),
    index('idx_opportunities_created_at').on(table.organizationId, table.createdAt),
    index('idx_opportunities_deleted_at').on(table.deletedAt)
  ]
);

export const crmActivities = pgTable(
  'crm_activities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).default('note').notNull(),
    subject: varchar('subject', { length: 255 }).notNull(),
    description: text('description'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    status: varchar('status', { length: 50 }).default('completed').notNull(),
    createdByUserId: uuid('created_by_user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    assignedToUserId: uuid('assigned_to_user_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_crm_activities_org_id').on(table.organizationId),
    index('idx_crm_activities_lead').on(table.organizationId, table.leadId),
    index('idx_crm_activities_contact').on(table.organizationId, table.contactId),
    index('idx_crm_activities_account').on(table.organizationId, table.accountId),
    index('idx_crm_activities_scheduled').on(table.organizationId, table.scheduledAt),
    index('idx_crm_activities_created_at').on(table.organizationId, table.createdAt)
  ]
);

// ==========================================
// Phase 5: Sales Management Tables
// ==========================================

export const opportunityStageHistory = pgTable(
  'opportunity_stage_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    opportunityId: uuid('opportunity_id')
      .references(() => opportunities.id, { onDelete: 'cascade' })
      .notNull(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    fromStage: varchar('from_stage', { length: 50 }),
    toStage: varchar('to_stage', { length: 50 }).notNull(),
    changedByUserId: uuid('changed_by_user_id').references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_opp_history_opp_id').on(table.opportunityId),
    index('idx_opp_history_org_id').on(table.organizationId),
    index('idx_opp_history_created_at').on(table.createdAt)
  ]
);

export const quotations = pgTable(
  'quotations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    opportunityId: uuid('opportunity_id')
      .references(() => opportunities.id, { onDelete: 'cascade' })
      .notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    quotationNumber: varchar('quotation_number', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('draft').notNull(),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).default('0.00').notNull(),
    taxPercent: numeric('tax_percent', { precision: 5, scale: 2 }).default('0.00').notNull(),
    taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
    discountAmount: numeric('discount_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    notes: text('notes'),
    terms: text('terms'),
    createdById: uuid('created_by_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_quotations_org_id').on(table.organizationId),
    index('idx_quotations_opp_id').on(table.organizationId, table.opportunityId),
    index('idx_quotations_status').on(table.organizationId, table.status),
    index('idx_quotations_number').on(table.organizationId, table.quotationNumber),
    index('idx_quotations_created_at').on(table.organizationId, table.createdAt),
    index('idx_quotations_deleted_at').on(table.deletedAt)
  ]
);

export const quotationItems = pgTable(
  'quotation_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quotationId: uuid('quotation_id')
      .references(() => quotations.id, { onDelete: 'cascade' })
      .notNull(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).default('1.00').notNull(),
    unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).default('0.00').notNull(),
    totalPrice: numeric('total_price', { precision: 15, scale: 2 }).default('0.00').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_quotation_items_quotation_id').on(table.quotationId),
    index('idx_quotation_items_org_id').on(table.organizationId)
  ]
);

// ==========================================
// Phase 6: Operational Finance Tables
// ==========================================

export const financialCategories = pgTable(
  'financial_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
    color: varchar('color', { length: 20 }).default('#64748b').notNull(),
    description: varchar('description', { length: 255 }),
    isDefault: boolean('is_default').default(false).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_fin_categories_org').on(table.organizationId),
    index('idx_fin_categories_type').on(table.organizationId, table.type),
    index('idx_fin_categories_deleted').on(table.deletedAt)
  ]
);

export const financialTransactions = pgTable(
  'financial_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
    categoryId: uuid('category_id')
      .references(() => financialCategories.id, { onDelete: 'restrict' })
      .notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    counterparty: varchar('counterparty', { length: 255 }),
    reference: varchar('reference', { length: 100 }),
    paymentMethod: varchar('payment_method', { length: 50 }).default('bank_transfer').notNull(),
    status: varchar('status', { length: 50 }).default('completed').notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    invoiceId: uuid('invoice_id'),
    notes: text('notes'),
    recordedByUserId: uuid('recorded_by_user_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_fin_tx_org').on(table.organizationId),
    index('idx_fin_tx_type').on(table.organizationId, table.type),
    index('idx_fin_tx_category').on(table.organizationId, table.categoryId),
    index('idx_fin_tx_date').on(table.organizationId, table.date),
    index('idx_fin_tx_status').on(table.organizationId, table.status),
    index('idx_fin_tx_account').on(table.organizationId, table.accountId),
    index('idx_fin_tx_deleted').on(table.deletedAt)
  ]
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
    accountId: uuid('account_id')
      .references(() => accounts.id, { onDelete: 'restrict' })
      .notNull(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    opportunityId: uuid('opportunity_id').references(() => opportunities.id, { onDelete: 'set null' }),
    quotationId: uuid('quotation_id').references(() => quotations.id, { onDelete: 'set null' }),
    issueDate: timestamp('issue_date', { withTimezone: true }).defaultNow().notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).default('0.00').notNull(),
    taxPercent: numeric('tax_percent', { precision: 5, scale: 2 }).default('0.00').notNull(),
    taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
    discountAmount: numeric('discount_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
    paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).default('0.00').notNull(),
    balanceDue: numeric('balance_due', { precision: 15, scale: 2 }).default('0.00').notNull(),
    status: varchar('status', { length: 50 }).default('draft').notNull(), // 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'void'
    notes: text('notes'),
    terms: text('terms'),
    createdByUserId: uuid('created_by_user_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_invoices_org').on(table.organizationId),
    index('idx_invoices_number').on(table.organizationId, table.invoiceNumber),
    index('idx_invoices_account').on(table.organizationId, table.accountId),
    index('idx_invoices_status').on(table.organizationId, table.status),
    index('idx_invoices_due_date').on(table.organizationId, table.dueDate),
    index('idx_invoices_deleted').on(table.deletedAt)
  ]
);

export const invoiceLineItems = pgTable(
  'invoice_line_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceId: uuid('invoice_id')
      .references(() => invoices.id, { onDelete: 'cascade' })
      .notNull(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).default('1.00').notNull(),
    unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).default('0.00').notNull(),
    totalPrice: numeric('total_price', { precision: 15, scale: 2 }).default('0.00').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_invoice_items_invoice').on(table.invoiceId),
    index('idx_invoice_items_org').on(table.organizationId)
  ]
);

export const paymentRecords = pgTable(
  'payment_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    paymentNumber: varchar('payment_number', { length: 50 }).notNull(),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    paymentDate: timestamp('payment_date', { withTimezone: true }).defaultNow().notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }).default('bank_transfer').notNull(),
    reference: varchar('reference', { length: 100 }),
    notes: text('notes'),
    status: varchar('status', { length: 50 }).default('completed').notNull(),
    recordedByUserId: uuid('recorded_by_user_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_payments_org').on(table.organizationId),
    index('idx_payments_invoice').on(table.organizationId, table.invoiceId),
    index('idx_payments_account').on(table.organizationId, table.accountId),
    index('idx_payments_date').on(table.organizationId, table.paymentDate),
    index('idx_payments_deleted').on(table.deletedAt)
  ]
);

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    categoryId: uuid('category_id').references(() => financialCategories.id, { onDelete: 'set null' }),
    period: varchar('period', { length: 20 }).default('quarterly').notNull(), // 'monthly' | 'quarterly' | 'yearly'
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    budgetAmount: numeric('budget_amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    description: text('description'),
    createdByUserId: uuid('created_by_user_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_budgets_org').on(table.organizationId),
    index('idx_budgets_category').on(table.organizationId, table.categoryId),
    index('idx_budgets_period').on(table.organizationId, table.period),
    index('idx_budgets_dates').on(table.organizationId, table.startDate, table.endDate),
    index('idx_budgets_deleted').on(table.deletedAt)
  ]
);

// ==========================================
// Phase 7: Project Management
// ==========================================

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 150 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 50 }).default('planning').notNull(), // 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
    priority: varchar('priority', { length: 20 }).default('medium').notNull(), // 'low' | 'medium' | 'high' | 'urgent'
    ownerId: uuid('owner_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    startDate: timestamp('start_date', { withTimezone: true }),
    targetEndDate: timestamp('target_end_date', { withTimezone: true }),
    actualEndDate: timestamp('actual_end_date', { withTimezone: true }),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    opportunityId: uuid('opportunity_id').references(() => opportunities.id, { onDelete: 'set null' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_projects_org').on(table.organizationId),
    index('idx_projects_status').on(table.organizationId, table.status),
    index('idx_projects_owner').on(table.organizationId, table.ownerId),
    index('idx_projects_account').on(table.organizationId, table.accountId),
    index('idx_projects_opportunity').on(table.organizationId, table.opportunityId),
    index('idx_projects_deleted').on(table.deletedAt)
  ]
);

export const projectMembers = pgTable(
  'project_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 30 }).default('contributor').notNull(), // 'lead' | 'contributor' | 'viewer'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    unique('project_user_uniq').on(table.projectId, table.userId),
    index('idx_pm_project').on(table.projectId),
    index('idx_pm_user').on(table.userId),
    index('idx_pm_org').on(table.organizationId)
  ]
);

export const projectMilestones = pgTable(
  'project_milestones',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description'),
    targetDate: timestamp('target_date', { withTimezone: true }),
    status: varchar('status', { length: 30 }).default('pending').notNull(), // 'pending' | 'completed'
    completedAt: timestamp('completed_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_milestones_project').on(table.organizationId, table.projectId),
    index('idx_milestones_status').on(table.organizationId, table.status),
    index('idx_milestones_deleted').on(table.deletedAt)
  ]
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    milestoneId: uuid('milestone_id').references(() => projectMilestones.id, { onDelete: 'set null' }),
    parentTaskId: uuid('parent_task_id').references((): any => tasks.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 50 }).default('todo').notNull(), // 'todo' | 'in_progress' | 'in_review' | 'completed' | 'cancelled'
    priority: varchar('priority', { length: 20 }).default('medium').notNull(), // 'low' | 'medium' | 'high' | 'urgent'
    assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    createdById: uuid('created_by_user_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    startDate: timestamp('start_date', { withTimezone: true }),
    dueDate: timestamp('due_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    estimatedHours: numeric('estimated_hours', { precision: 6, scale: 2 }),
    orderIndex: integer('order_index').default(0).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_tasks_project').on(table.organizationId, table.projectId),
    index('idx_tasks_milestone').on(table.organizationId, table.milestoneId),
    index('idx_tasks_parent').on(table.organizationId, table.parentTaskId),
    index('idx_tasks_status').on(table.organizationId, table.status),
    index('idx_tasks_assignee').on(table.organizationId, table.assigneeId),
    index('idx_tasks_due').on(table.organizationId, table.dueDate),
    index('idx_tasks_deleted').on(table.deletedAt)
  ]
);

export const taskComments = pgTable(
  'task_comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    content: text('content').notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_comments_task').on(table.organizationId, table.taskId),
    index('idx_comments_project').on(table.organizationId, table.projectId),
    index('idx_comments_deleted').on(table.deletedAt)
  ]
);

// ==========================================
// Phase 8: Marketing Management
// ==========================================

export const campaigns = pgTable(
  'campaigns',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 150 }).notNull(),
    type: varchar('type', { length: 50 }).default('inbound').notNull(), // 'inbound' | 'outbound' | 'event' | 'email_marketing' | 'content_marketing' | 'paid_ad' | 'promotion' | 'other'
    channel: varchar('channel', { length: 50 }).default('website').notNull(), // 'social_media' | 'email' | 'search' | 'paid_advertising' | 'website' | 'referral' | 'events' | 'other'
    status: varchar('status', { length: 50 }).default('planned').notNull(), // 'draft' | 'planned' | 'active' | 'completed' | 'cancelled'
    objective: varchar('objective', { length: 255 }),
    description: text('description'),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    budget: numeric('budget', { precision: 15, scale: 2 }).default('0.00').notNull(),
    actualCost: numeric('actual_cost', { precision: 15, scale: 2 }).default('0.00').notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    ownerId: uuid('owner_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    utmSource: varchar('utm_source', { length: 100 }),
    utmMedium: varchar('utm_medium', { length: 100 }),
    notes: text('notes'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_campaigns_org').on(table.organizationId),
    index('idx_campaigns_status').on(table.organizationId, table.status),
    index('idx_campaigns_channel').on(table.organizationId, table.channel),
    index('idx_campaigns_dates').on(table.organizationId, table.startDate, table.endDate),
    index('idx_campaigns_deleted').on(table.deletedAt)
  ]
);

export const campaignLeads = pgTable(
  'campaign_leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    campaignId: uuid('campaign_id')
      .references(() => campaigns.id, { onDelete: 'cascade' })
      .notNull(),
    leadId: uuid('lead_id')
      .references(() => leads.id, { onDelete: 'cascade' })
      .notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    unique('campaign_lead_uniq').on(table.campaignId, table.leadId),
    index('idx_cl_campaign').on(table.campaignId),
    index('idx_cl_lead').on(table.leadId),
    index('idx_cl_org').on(table.organizationId)
  ]
);

// ==========================================
// Phase 9: HR Management Tables
// ==========================================

export const departments = pgTable(
  'departments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }),
    description: text('description'),
    managerId: uuid('manager_id'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_departments_org').on(table.organizationId),
    index('idx_departments_name').on(table.organizationId, table.name),
    index('idx_departments_deleted').on(table.deletedAt)
  ]
);

export const designations = pgTable(
  'designations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    departmentId: uuid('department_id')
      .references(() => departments.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }),
    description: text('description'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_designations_org').on(table.organizationId),
    index('idx_designations_dept').on(table.departmentId),
    index('idx_designations_deleted').on(table.deletedAt)
  ]
);

export const employees = pgTable(
  'employees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'set null' }),
    employeeNumber: varchar('employee_number', { length: 50 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    workEmail: varchar('work_email', { length: 255 }).notNull(),
    workPhone: varchar('work_phone', { length: 50 }),
    departmentId: uuid('department_id')
      .references(() => departments.id, { onDelete: 'set null' }),
    designationId: uuid('designation_id')
      .references(() => designations.id, { onDelete: 'set null' }),
    reportingManagerId: uuid('reporting_manager_id'),
    employmentType: varchar('employment_type', { length: 50 }).default('full_time').notNull(),
    status: varchar('status', { length: 50 }).default('active').notNull(),
    joiningDate: timestamp('joining_date', { withTimezone: true }).notNull(),
    terminationDate: timestamp('termination_date', { withTimezone: true }),
    notes: text('notes'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    unique('emp_org_number_uniq').on(table.organizationId, table.employeeNumber),
    index('idx_employees_org').on(table.organizationId),
    index('idx_employees_user').on(table.userId),
    index('idx_employees_dept').on(table.organizationId, table.departmentId),
    index('idx_employees_status').on(table.organizationId, table.status),
    index('idx_employees_deleted').on(table.deletedAt)
  ]
);

export const attendanceRecords = pgTable(
  'attendance_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employees.id, { onDelete: 'cascade' })
      .notNull(),
    date: varchar('date', { length: 10 }).notNull(), // 'YYYY-MM-DD'
    status: varchar('status', { length: 50 }).default('present').notNull(),
    checkInTime: timestamp('check_in_time', { withTimezone: true }),
    checkOutTime: timestamp('check_out_time', { withTimezone: true }),
    notes: text('notes'),
    createdById: uuid('created_by_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    unique('attendance_emp_date_uniq').on(table.organizationId, table.employeeId, table.date),
    index('idx_attendance_org_date').on(table.organizationId, table.date),
    index('idx_attendance_emp').on(table.employeeId)
  ]
);

export const leaveRequests = pgTable(
  'leave_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employees.id, { onDelete: 'cascade' })
      .notNull(),
    leaveType: varchar('leave_type', { length: 50 }).notNull(),
    startDate: varchar('start_date', { length: 10 }).notNull(), // 'YYYY-MM-DD'
    endDate: varchar('end_date', { length: 10 }).notNull(),     // 'YYYY-MM-DD'
    daysCount: numeric('days_count', { precision: 4, scale: 1 }).notNull(),
    reason: text('reason'),
    status: varchar('status', { length: 50 }).default('pending').notNull(),
    approvedById: uuid('approved_by_id')
      .references(() => users.id, { onDelete: 'set null' }),
    approvalNotes: text('approval_notes'),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    createdById: uuid('created_by_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('idx_leaves_org').on(table.organizationId),
    index('idx_leaves_emp').on(table.employeeId),
    index('idx_leaves_status').on(table.organizationId, table.status),
    index('idx_leaves_dates').on(table.organizationId, table.startDate, table.endDate)
  ]
);
