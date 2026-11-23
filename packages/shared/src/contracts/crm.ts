import { z } from 'zod';
import { PaginationQuerySchema, PaginatedResult } from './platform.js';

// ==========================================
// 1. Enums and Basic Types
// ==========================================

export const LeadStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'unqualified',
  'converted',
  'lost'
]);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const LeadSourceSchema = z.enum([
  'website',
  'referral',
  'cold_outreach',
  'event',
  'partner',
  'inbound',
  'advertisement',
  'other'
]);
export type LeadSource = z.infer<typeof LeadSourceSchema>;

export const CrmActivityTypeSchema = z.enum([
  'note',
  'call',
  'meeting',
  'follow_up',
  'task'
]);
export type CrmActivityType = z.infer<typeof CrmActivityTypeSchema>;

export const CrmActivityStatusSchema = z.enum([
  'pending',
  'completed',
  'cancelled'
]);
export type CrmActivityStatus = z.infer<typeof CrmActivityStatusSchema>;

export const OpportunityStageSchema = z.enum([
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
]);
export type OpportunityStage = z.infer<typeof OpportunityStageSchema>;

// ==========================================
// 2. Account (Company) Schemas & DTOs
// ==========================================

export const CreateAccountInputSchema = z.object({
  name: z.string().trim().min(1, 'Company name is required').max(200),
  industry: z.string().trim().max(100).optional(),
  website: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().trim().max(500).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(2000).optional()
});
export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;

export const UpdateAccountInputSchema = CreateAccountInputSchema.partial();
export type UpdateAccountInput = z.infer<typeof UpdateAccountInputSchema>;

export interface AccountDto {
  id: string;
  organizationId: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  notes?: string | null;
  contactCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. Contact Schemas & DTOs
// ==========================================

export const CreateContactInputSchema = z.object({
  accountId: z.string().uuid().optional().nullable(),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().max(50).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(2000).optional()
});
export type CreateContactInput = z.infer<typeof CreateContactInputSchema>;

export const UpdateContactInputSchema = CreateContactInputSchema.partial();
export type UpdateContactInput = z.infer<typeof UpdateContactInputSchema>;

export interface ContactDto {
  id: string;
  organizationId: string;
  accountId?: string | null;
  accountName?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Lead Schemas & DTOs
// ==========================================

export const CreateLeadInputSchema = z.object({
  title: z.string().trim().min(1, 'Lead title or inquiry subject is required').max(200),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().max(100).default(''),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().max(50).optional(),
  companyName: z.string().trim().max(200).optional(),
  source: LeadSourceSchema.default('website'),
  status: LeadStatusSchema.default('new'),
  assignedToId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(2000).optional(),
  estimatedValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount').optional().or(z.literal('')),
  currency: z.string().length(3).default('USD')
});
export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

export const UpdateLeadInputSchema = CreateLeadInputSchema.partial();
export type UpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;

export const AssignLeadInputSchema = z.object({
  assignedToId: z.string().uuid().nullable()
});
export type AssignLeadInput = z.infer<typeof AssignLeadInputSchema>;

export interface LeadDto {
  id: string;
  organizationId: string;
  title: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  source: LeadSource;
  status: LeadStatus;
  assignedToId?: string | null;
  assignedToName?: string | null;
  notes?: string | null;
  estimatedValue?: string | null;
  currency: string;
  convertedAt?: string | null;
  convertedAccountId?: string | null;
  convertedAccountName?: string | null;
  convertedContactId?: string | null;
  convertedContactName?: string | null;
  convertedOpportunityId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. CRM Activities & Follow-ups
// ==========================================

export const CreateCrmActivityInputSchema = z.object({
  leadId: z.string().uuid().optional().nullable(),
  contactId: z.string().uuid().optional().nullable(),
  accountId: z.string().uuid().optional().nullable(),
  type: CrmActivityTypeSchema.default('note'),
  subject: z.string().trim().min(1, 'Subject is required').max(255),
  description: z.string().trim().max(4000).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  assignedToUserId: z.string().uuid().optional().nullable()
});
export type CreateCrmActivityInput = z.infer<typeof CreateCrmActivityInputSchema>;

export const UpdateCrmActivityInputSchema = z.object({
  subject: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(4000).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  status: CrmActivityStatusSchema.optional()
});
export type UpdateCrmActivityInput = z.infer<typeof UpdateCrmActivityInputSchema>;

export interface CrmActivityDto {
  id: string;
  organizationId: string;
  leadId?: string | null;
  contactId?: string | null;
  accountId?: string | null;
  type: CrmActivityType;
  subject: string;
  description?: string | null;
  scheduledAt?: string | null;
  completedAt?: string | null;
  status: CrmActivityStatus;
  createdByUserId: string;
  createdByName?: string | null;
  assignedToUserId?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. Lead Conversion & Opportunity Interface
// ==========================================

export const ConvertLeadInputSchema = z.object({
  createAccount: z.boolean().default(true),
  existingAccountId: z.string().uuid().optional().nullable(),
  accountName: z.string().trim().max(200).optional(),

  createContact: z.boolean().default(true),
  existingContactId: z.string().uuid().optional().nullable(),
  contactFirstName: z.string().trim().max(100).optional(),
  contactLastName: z.string().trim().max(100).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal('')),
  contactPhone: z.string().trim().max(50).optional(),
  contactJobTitle: z.string().trim().max(100).optional(),

  createOpportunity: z.boolean().default(false),
  opportunityName: z.string().trim().max(255).optional(),
  opportunityAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().or(z.literal('')),
  opportunityExpectedCloseDate: z.string().datetime().optional().nullable()
});
export type ConvertLeadInput = z.infer<typeof ConvertLeadInputSchema>;

export interface OpportunityDto {
  id: string;
  organizationId: string;
  name: string;
  accountId?: string | null;
  accountName?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  leadId?: string | null;
  amount?: string | null;
  currency: string;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConvertLeadResultDto {
  lead: LeadDto;
  account: AccountDto | null;
  contact: ContactDto | null;
  opportunity: OpportunityDto | null;
}

// ==========================================
// 7. Duplicate Detection Contracts
// ==========================================

export const CheckDuplicatesInputSchema = z.object({
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  companyName: z.string().trim().optional()
});
export type CheckDuplicatesInput = z.infer<typeof CheckDuplicatesInputSchema>;

export interface DuplicateCheckResultDto {
  hasPotentialDuplicates: boolean;
  duplicateLeads: LeadDto[];
  duplicateContacts: ContactDto[];
  duplicateAccounts: AccountDto[];
}
