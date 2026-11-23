import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PaginationQuerySchema } from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization, requireRole } from '../plugins/auth.js';

export async function activityRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/activities — Paginated organization activity timeline
  app.get('/activities', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = PaginationQuerySchema.safeParse(request.query);
    const query = parseResult.success
      ? parseResult.data
      : { page: 1, limit: 20, sortOrder: 'desc' as const };

    const rawQuery = request.query as Record<string, unknown>;
    const resourceType = typeof rawQuery.resourceType === 'string' ? rawQuery.resourceType : undefined;

    const result = await repository.getOrganizationActivities(
      request.organization!.id,
      query,
      resourceType
    );

    return reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/audit-logs — Paginated security and administrative audit log (Owner/Admin only)
  app.get(
    '/audit-logs',
    { preHandler: requireRole(['owner', 'admin']) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = PaginationQuerySchema.safeParse(request.query);
      const query = parseResult.success
        ? parseResult.data
        : { page: 1, limit: 20, sortOrder: 'desc' as const };

      const result = await repository.getOrganizationAuditLogs(
        request.organization!.id,
        query
      );

      return reply.status(200).send({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    }
  );
}
