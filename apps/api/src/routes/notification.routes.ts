import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  PaginationQuerySchema,
  CreateNotificationInputSchema
} from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireOrganization, requireRole } from '../plugins/auth.js';

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/notifications — Paginated notifications for current user
  app.get('/', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = PaginationQuerySchema.safeParse(request.query);
    const query = parseResult.success
      ? parseResult.data
      : { page: 1, limit: 20, sortOrder: 'desc' as const };

    const rawQuery = request.query as Record<string, unknown>;
    const unreadOnly = rawQuery.unreadOnly === 'true' || rawQuery.unreadOnly === true;

    const result = await repository.getUserNotifications(
      request.organization!.id,
      request.user!.id,
      query,
      unreadOnly
    );

    return reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/notifications/unread-count — Fast unread badge counter
  app.get('/unread-count', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    const count = await repository.getUnreadNotificationCount(
      request.organization!.id,
      request.user!.id
    );

    return reply.status(200).send({
      success: true,
      data: { unreadCount: count },
      timestamp: new Date().toISOString()
    });
  });

  // PATCH /api/notifications/:id/read — Mark single notification as read
  app.patch('/:id/read', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      await repository.markNotificationAsRead(id, request.organization!.id, request.user!.id);
      return reply.status(200).send({
        success: true,
        data: { message: 'Notification marked as read' },
        timestamp: new Date().toISOString()
      });
    } catch {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  // POST /api/notifications/mark-all-read — Mark all notifications as read in active organization
  app.post('/mark-all-read', { preHandler: requireOrganization }, async (request: FastifyRequest, reply: FastifyReply) => {
    await repository.markAllNotificationsAsRead(request.organization!.id, request.user!.id);
    return reply.status(200).send({
      success: true,
      data: { message: 'All notifications marked as read' },
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/notifications — Trigger a notification (Admin/Owner or system event)
  app.post('/', { preHandler: requireRole(['owner', 'admin']) }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateNotificationInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid notification payload'
        },
        timestamp: new Date().toISOString()
      });
    }

    const notif = await repository.createNotification({
      organizationId: request.organization!.id,
      ...parseResult.data
    });

    return reply.status(201).send({
      success: true,
      data: notif,
      timestamp: new Date().toISOString()
    });
  });
}
