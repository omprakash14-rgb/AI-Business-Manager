import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  PaginationQuerySchema,
  CreateCampaignInputSchema,
  UpdateCampaignInputSchema,
  AssociateLeadInputSchema,
  CampaignStatusSchema,
  MarketingChannelSchema,
  CampaignTypeSchema,
  CampaignStatus,
  MarketingChannel,
  CampaignType
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization } from '../plugins/auth.js';

export async function marketingRoutes(app: FastifyInstance): Promise<void> {
  // All Marketing routes require authenticated user and active organization context
  app.addHook('preHandler', requireOrganization);

  // ==========================================
  // 1. Marketing Summary & Analytics
  // ==========================================

  // GET /api/marketing/summary — High-level campaign KPIs & channel distribution
  app.get('/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const summary = await repository.getMarketingSummary(orgId);
    return reply.send(summary);
  });

  // ==========================================
  // 2. Campaigns Endpoints
  // ==========================================

  // GET /api/marketing/campaigns — Paginated campaigns list with filters
  app.get('/campaigns', async (request: FastifyRequest, reply: FastifyReply) => {
    const queryResult = PaginationQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid pagination query parameters',
          details: queryResult.error.format()
        }
      });
    }

    const { status, channel, type, ownerId } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    let parsedStatus: CampaignStatus | undefined = undefined;
    if (status) {
      const sp = CampaignStatusSchema.safeParse(status);
      if (sp.success) parsedStatus = sp.data;
    }

    let parsedChannel: MarketingChannel | undefined = undefined;
    if (channel) {
      const cp = MarketingChannelSchema.safeParse(channel);
      if (cp.success) parsedChannel = cp.data;
    }

    let parsedType: CampaignType | undefined = undefined;
    if (type) {
      const tp = CampaignTypeSchema.safeParse(type);
      if (tp.success) parsedType = tp.data;
    }

    const campaigns = await repository.listCampaigns(orgId, {
      ...queryResult.data,
      status: parsedStatus,
      channel: parsedChannel,
      type: parsedType,
      ownerId
    });

    return reply.send(campaigns);
  });

  // POST /api/marketing/campaigns — Create a new campaign
  app.post('/campaigns', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateCampaignInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid campaign payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      const campaign = await repository.createCampaign(orgId, userId, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'campaign.created',
        metadata: JSON.stringify({ campaignId: campaign.id, name: campaign.name }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.status(201).send(campaign);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'CAMPAIGN_CREATION_FAILED',
          message: err.message || 'Failed to create campaign'
        }
      });
    }
  });

  // GET /api/marketing/campaigns/:id — Get campaign details
  app.get('/campaigns/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const campaign = await repository.getCampaignById(orgId, id);
    if (!campaign) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found'
        }
      });
    }

    return reply.send(campaign);
  });

  // PATCH /api/marketing/campaigns/:id — Update campaign
  app.patch('/campaigns/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const parseResult = UpdateCampaignInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const updated = await repository.updateCampaign(orgId, id, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'campaign.updated',
        metadata: JSON.stringify({ campaignId: id, updates: Object.keys(parseResult.data) }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.send(updated);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: err.message || 'Failed to update campaign'
        }
      });
    }
  });

  // DELETE /api/marketing/campaigns/:id — Soft-delete campaign
  app.delete('/campaigns/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const success = await repository.softDeleteCampaign(orgId, id);
    if (!success) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found or already deleted'
        }
      });
    }

    await repository.createAuditLog({
      organizationId: orgId,
      userId,
      action: 'campaign.deleted',
      metadata: JSON.stringify({ campaignId: id }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.send({ success: true });
  });

  // ==========================================
  // 3. Lead Attribution Endpoints
  // ==========================================

  // GET /api/marketing/campaigns/:id/leads — List leads attributed to campaign
  app.get('/campaigns/:id/leads', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;

    const leads = await repository.listCampaignLeads(orgId, id);
    return reply.send(leads);
  });

  // POST /api/marketing/campaigns/:id/leads — Link lead to campaign
  app.post('/campaigns/:id/leads', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const parseResult = AssociateLeadInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid attribution payload',
          details: parseResult.error.format()
        }
      });
    }

    try {
      const attributed = await repository.associateLeadToCampaign(orgId, id, parseResult.data);

      await repository.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'campaign.lead_attributed',
        metadata: JSON.stringify({ campaignId: id, leadId: parseResult.data.leadId }),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.status(201).send(attributed);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'ATTRIBUTION_FAILED',
          message: err.message || 'Failed to attribute lead to campaign'
        }
      });
    }
  });

  // DELETE /api/marketing/campaigns/:id/leads/:leadId — Disassociate lead
  app.delete('/campaigns/:id/leads/:leadId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, leadId } = request.params as { id: string; leadId: string };
    const orgId = request.organization!.id;
    const userId = request.user!.id;

    const success = await repository.removeLeadFromCampaign(orgId, id, leadId);
    if (!success) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Attribution record not found'
        }
      });
    }

    await repository.createAuditLog({
      organizationId: orgId,
      userId,
      action: 'campaign.lead_removed',
      metadata: JSON.stringify({ campaignId: id, leadId }),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.send({ success: true });
  });
}
