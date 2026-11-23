import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  PaginationQuerySchema,
  CreateOpportunityInputSchema,
  UpdateOpportunityInputSchema,
  UpdateOpportunityStageInputSchema,
  CreateQuotationInputSchema,
  UpdateQuotationStatusInputSchema,
  OpportunityStageSchema,
  QuotationStatusSchema,
  OpportunityStage,
  QuotationStatus
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization } from '../plugins/auth.js';

export async function salesRoutes(app: FastifyInstance): Promise<void> {
  // All Sales routes require authenticated user and active organization context
  app.addHook('preHandler', requireOrganization);

  // ==========================================
  // 1. Opportunities & Deals Endpoints
  // ==========================================

  // GET /api/sales/opportunities — Paginated opportunities with filters and search
  app.get('/opportunities', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { stage, accountId, assignedToId, minAmount, maxAmount } = request.query as Record<
      string,
      string | undefined
    >;
    const orgId = request.organization!.id;

    let parsedStage: OpportunityStage | undefined = undefined;
    if (stage) {
      const stageParse = OpportunityStageSchema.safeParse(stage);
      if (stageParse.success) {
        parsedStage = stageParse.data;
      }
    }

    const opportunities = await repository.listOpportunities(orgId, {
      ...queryResult.data,
      stage: parsedStage,
      accountId,
      assignedToId,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
    });

    return reply.send(opportunities);
  });

  // POST /api/sales/opportunities — Create opportunity
  app.post('/opportunities', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateOpportunityInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid opportunity payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      const opp = await repository.createOpportunity(orgId, parseResult.data, userId);
      return reply.status(201).send({
        success: true,
        data: opp
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'OPPORTUNITY_CREATE_FAILED',
          message: err.message || 'Failed to create opportunity'
        }
      });
    }
  });

  // GET /api/sales/opportunities/:id — Opportunity details with stage history
  app.get(
    '/opportunities/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;

      const opp = await repository.getOpportunityById(orgId, id);
      if (!opp) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Opportunity not found'
          }
        });
      }

      return reply.send({
        success: true,
        data: opp
      });
    }
  );

  // PATCH /api/sales/opportunities/:id — Update opportunity fields
  app.patch(
    '/opportunities/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const parseResult = UpdateOpportunityInputSchema.safeParse(request.body);
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

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateOpportunity(orgId, id, parseResult.data, userId);
        if (!updated) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Opportunity not found'
            }
          });
        }

        return reply.send({
          success: true,
          data: updated
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: err.message || 'Failed to update opportunity'
          }
        });
      }
    }
  );

  // PATCH /api/sales/opportunities/:id/stage — Transition opportunity stage (with win/loss tracking)
  app.patch(
    '/opportunities/:id/stage',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const parseResult = UpdateOpportunityStageInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid stage update payload',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateOpportunityStage(orgId, id, parseResult.data, userId);
        return reply.send({
          success: true,
          data: updated
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'STAGE_UPDATE_FAILED',
            message: err.message || 'Failed to update opportunity stage'
          }
        });
      }
    }
  );

  // GET /api/sales/opportunities/:id/history — Opportunity stage history audit
  app.get(
    '/opportunities/:id/history',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;

      const opp = await repository.getOpportunityById(orgId, id);
      if (!opp) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Opportunity not found'
          }
        });
      }

      const history = await repository.getOpportunityStageHistory(orgId, id);
      return reply.send({
        success: true,
        data: history
      });
    }
  );

  // DELETE /api/sales/opportunities/:id — Soft-delete opportunity
  app.delete(
    '/opportunities/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      const success = await repository.softDeleteOpportunity(orgId, id, userId);
      if (!success) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Opportunity not found'
          }
        });
      }

      return reply.send({
        success: true,
        message: 'Opportunity deleted successfully'
      });
    }
  );

  // ==========================================
  // 2. Sales Forecasting & Pipeline Summary
  // ==========================================

  // GET /api/sales/forecast — Aggregated pipeline and forecast summary
  app.get('/forecast', async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.organization!.id;
    const summary = await repository.getSalesForecastSummary(orgId);
    return reply.send({
      success: true,
      data: summary
    });
  });

  // ==========================================
  // 3. Quotations & Proposals Endpoints
  // ==========================================

  // GET /api/sales/quotations — Paginated quotations list
  app.get('/quotations', async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { opportunityId, accountId, status } = request.query as Record<string, string | undefined>;
    const orgId = request.organization!.id;

    let parsedStatus: QuotationStatus | undefined = undefined;
    if (status) {
      const statusParse = QuotationStatusSchema.safeParse(status);
      if (statusParse.success) {
        parsedStatus = statusParse.data;
      }
    }

    const quotations = await repository.listQuotations(orgId, {
      ...queryResult.data,
      opportunityId,
      accountId,
      status: parsedStatus
    });

    return reply.send(quotations);
  });

  // POST /api/sales/quotations — Create quotation with line items
  app.post('/quotations', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateQuotationInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid quotation payload',
          details: parseResult.error.format()
        }
      });
    }

    const orgId = request.organization!.id;
    const userId = request.user!.id;

    try {
      const quotation = await repository.createQuotation(orgId, userId, parseResult.data);
      return reply.status(201).send({
        success: true,
        data: quotation
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'QUOTATION_CREATE_FAILED',
          message: err.message || 'Failed to create quotation'
        }
      });
    }
  });

  // GET /api/sales/quotations/:id — Get quotation details with line items
  app.get(
    '/quotations/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;

      const quotation = await repository.getQuotationById(orgId, id);
      if (!quotation) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Quotation not found'
          }
        });
      }

      return reply.send({
        success: true,
        data: quotation
      });
    }
  );

  // PATCH /api/sales/quotations/:id/status — Transition quotation status
  app.patch(
    '/quotations/:id/status',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const parseResult = UpdateQuotationStatusInputSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid quotation status payload',
            details: parseResult.error.format()
          }
        });
      }

      const orgId = request.organization!.id;
      const userId = request.user!.id;

      try {
        const updated = await repository.updateQuotationStatus(orgId, id, parseResult.data, userId);
        if (!updated) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Quotation not found'
            }
          });
        }

        return reply.send({
          success: true,
          data: updated
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'STATUS_UPDATE_FAILED',
            message: err.message || 'Failed to update quotation status'
          }
        });
      }
    }
  );

  // DELETE /api/sales/quotations/:id — Soft delete quotation
  app.delete(
    '/quotations/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const orgId = request.organization!.id;
      const userId = request.user!.id;

      const success = await repository.softDeleteQuotation(orgId, id, userId);
      if (!success) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Quotation not found'
          }
        });
      }

      return reply.send({
        success: true,
        message: 'Quotation deleted successfully'
      });
    }
  );
}
