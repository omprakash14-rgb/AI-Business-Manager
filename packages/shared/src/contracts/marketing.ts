import { z } from 'zod';
import { PaginationQuerySchema, PaginatedResult } from './platform.js';
import { LeadStatus } from './crm.js';

// ==========================================
// 1. Enums & Constants
// ==========================================

export const CampaignStatusSchema = z.enum([
  'draft',
  'planned',
  'active',
  'completed',
  'cancelled'
]);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const MarketingChannelSchema = z.enum([
  'social_media',
  'email',
  'search',
  'paid_advertising',
  'website',
  'referral',
  'events',
  'other'
]);
export type MarketingChannel = z.infer<typeof MarketingChannelSchema>;

export const CampaignTypeSchema = z.enum([
  'inbound',
  'outbound',
  'event',
  'email_marketing',
  'content_marketing',
  'paid_ad',
  'promotion',
  'other'
]);
export type CampaignType = z.infer<typeof CampaignTypeSchema>;

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  planned: 'Planned',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const MARKETING_CHANNEL_LABELS: Record<MarketingChannel, string> = {
  social_media: 'Social Media',
  email: 'Email Marketing',
  search: 'Search (SEO / SEM)',
  paid_advertising: 'Paid Ads',
  website: 'Website / Inbound',
  referral: 'Referral & Partner',
  events: 'Events & Webinars',
  other: 'Other Channel'
};

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  inbound: 'Inbound Campaign',
  outbound: 'Outbound Campaign',
  event: 'Event / Tradeshow',
  email_marketing: 'Email Series',
  content_marketing: 'Content Marketing',
  paid_ad: 'Paid Digital Ads',
  promotion: 'Seasonal Promotion',
  other: 'Other Type'
};

// ==========================================
// 2. Campaign Schemas & DTOs
// ==========================================

export const CreateCampaignInputSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required').max(150),
  type: CampaignTypeSchema.default('inbound'),
  channel: MarketingChannelSchema.default('website'),
  status: CampaignStatusSchema.default('planned'),
  objective: z.string().trim().max(255).optional(),
  description: z.string().trim().max(2000).optional(),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount (e.g. 5000.00)').default('0.00'),
  actualCost: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount').default('0.00'),
  currency: z.string().length(3).default('USD'),
  utmSource: z.string().trim().max(100).optional(),
  utmMedium: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(2000).optional()
});
export type CreateCampaignInput = z.input<typeof CreateCampaignInputSchema>;

export const UpdateCampaignInputSchema = CreateCampaignInputSchema.partial().extend({
  ownerId: z.string().uuid().optional()
});
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignInputSchema>;

export interface CampaignDto {
  id: string;
  organizationId: string;
  name: string;
  type: CampaignType;
  channel: MarketingChannel;
  status: CampaignStatus;
  objective?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  budget: string;
  actualCost: string;
  remainingBudget: string;
  utilizationPercent: number;
  currency: string;
  ownerId: string;
  ownerName?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  notes?: string | null;
  totalLeads: number;
  convertedLeads: number;
  conversionRatePercent: number;
  totalPipelineValue: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. Lead Attribution Schemas & DTOs
// ==========================================

export const AssociateLeadInputSchema = z.object({
  leadId: z.string().uuid('Valid lead ID is required'),
  notes: z.string().trim().max(500).optional()
});
export type AssociateLeadInput = z.infer<typeof AssociateLeadInputSchema>;

export interface AttributedLeadDto {
  id: string;
  leadId: string;
  campaignId: string;
  campaignName?: string | null;
  leadTitle: string;
  contactName: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  status: LeadStatus;
  estimatedValue?: string | null;
  attributedAt: string;
  convertedOpportunityId?: string | null;
  convertedOpportunityName?: string | null;
}

// ==========================================
// 4. Marketing Metrics & Reporting
// ==========================================

export interface ChannelPerformanceDto {
  channel: MarketingChannel;
  channelLabel: string;
  campaignCount: number;
  totalBudget: string;
  totalActualCost: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRatePercent: number;
}

export interface MarketingSummaryDto {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  plannedCampaigns: number;
  totalBudget: string;
  totalActualCost: string;
  totalRemainingBudget: string;
  averageBudgetUtilizationPercent: number;
  totalAttributedLeads: number;
  totalConvertedLeads: number;
  overallConversionRatePercent: number;
  currency: string;
  channelPerformance: ChannelPerformanceDto[];
  campaignsByStatus: Record<CampaignStatus, number>;
}
