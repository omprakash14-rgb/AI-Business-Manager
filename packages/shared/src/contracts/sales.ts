import { z } from 'zod';
import { PaginationQuerySchema, PaginatedResult } from './platform.js';
import { OpportunityStageSchema, OpportunityStage } from './crm.js';

export { OpportunityStageSchema, type OpportunityStage };

// ==========================================
// 1. Stage Constants and Probabilities
// ==========================================

export const STAGE_DEFAULT_PROBABILITIES: Record<OpportunityStage, number> = {
  prospecting: 10,
  qualification: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0
};

export const STAGE_DISPLAY_NAMES: Record<OpportunityStage, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal / Quotation',
  negotiation: 'Negotiation / Review',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost'
};

// ==========================================
// 2. Opportunities Schemas & DTOs
// ==========================================

export const CreateOpportunityInputSchema = z.object({
  name: z.string().trim().min(1, 'Deal name is required').max(255),
  accountId: z.string().uuid().optional().nullable(),
  contactId: z.string().uuid().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid fixed-precision decimal amount').default('0.00'),
  currency: z.string().length(3).default('USD'),
  stage: OpportunityStageSchema.default('prospecting'),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(4000).optional()
});
export type CreateOpportunityInput = z.infer<typeof CreateOpportunityInputSchema>;

export const UpdateOpportunityInputSchema = CreateOpportunityInputSchema.partial().extend({
  winLossReason: z.string().trim().max(1000).optional()
});
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunityInputSchema>;

export const UpdateOpportunityStageInputSchema = z.object({
  stage: OpportunityStageSchema,
  winLossReason: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(1000).optional()
});
export type UpdateOpportunityStageInput = z.infer<typeof UpdateOpportunityStageInputSchema>;

export interface OpportunityStageHistoryDto {
  id: string;
  opportunityId: string;
  fromStage: OpportunityStage | null;
  toStage: OpportunityStage;
  changedByUserId: string;
  changedByName?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface DetailedOpportunityDto {
  id: string;
  organizationId: string;
  name: string;
  accountId?: string | null;
  accountName?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  leadId?: string | null;
  leadTitle?: string | null;
  amount: string;
  currency: string;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  notes?: string | null;
  winLossReason?: string | null;
  closedAt?: string | null;
  stageHistory?: OpportunityStageHistoryDto[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. Quotations & Proposals
// ==========================================

export const QuotationStatusSchema = z.enum([
  'draft',
  'sent',
  'approved',
  'rejected',
  'expired'
]);
export type QuotationStatus = z.infer<typeof QuotationStatusSchema>;

export const QuotationItemInputSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required').max(255),
  quantity: z.number().min(0.01, 'Quantity must be greater than zero').default(1),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid unit price decimal')
});
export type QuotationItemInput = z.infer<typeof QuotationItemInputSchema>;

export const CreateQuotationInputSchema = z.object({
  opportunityId: z.string().uuid(),
  accountId: z.string().uuid().optional().nullable(),
  contactId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1, 'Quotation title is required').max(255),
  currency: z.string().length(3).default('USD'),
  taxPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount').default('0.00'),
  validUntil: z.string().datetime().optional().nullable(),
  notes: z.string().trim().max(2000).optional(),
  terms: z.string().trim().max(2000).optional(),
  items: z.array(QuotationItemInputSchema).min(1, 'At least one line item is required')
});
export type CreateQuotationInput = z.infer<typeof CreateQuotationInputSchema>;

export const UpdateQuotationStatusInputSchema = z.object({
  status: QuotationStatusSchema,
  notes: z.string().trim().max(1000).optional()
});
export type UpdateQuotationStatusInput = z.infer<typeof UpdateQuotationStatusInputSchema>;

export interface QuotationItemDto {
  id: string;
  quotationId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sortOrder: number;
}

export interface QuotationDto {
  id: string;
  organizationId: string;
  opportunityId: string;
  opportunityName?: string | null;
  accountId?: string | null;
  accountName?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  quotationNumber: string;
  title: string;
  status: QuotationStatus;
  subtotal: string;
  taxPercent: number;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  currency: string;
  validUntil?: string | null;
  notes?: string | null;
  terms?: string | null;
  createdById: string;
  createdByName?: string | null;
  items: QuotationItemDto[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Sales Forecasting & Summaries
// ==========================================

export interface StageSummaryDto {
  stage: OpportunityStage;
  label: string;
  dealCount: number;
  totalValue: string;
  weightedValue: string;
  averageProbability: number;
}

export interface MonthlyForecastDto {
  month: string; // "YYYY-MM"
  unweightedValue: string;
  weightedValue: string;
  dealCount: number;
}

export interface SalesForecastSummaryDto {
  totalPipelineValue: string;
  weightedForecastValue: string;
  wonRevenue: string;
  lostValue: string;
  totalDealsCount: number;
  openDealsCount: number;
  wonDealsCount: number;
  lostDealsCount: number;
  winRatePercent: number;
  currency: string;
  stageSummaries: StageSummaryDto[];
  monthlyForecast: MonthlyForecastDto[];
}
