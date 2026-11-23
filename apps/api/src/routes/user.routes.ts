import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UpdateProfileInputSchema } from '@ai-business-manager/shared';
import { repository } from '../db/index.js';
import { requireAuth } from '../plugins/auth.js';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // PATCH /api/users/profile
  app.patch('/profile', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = UpdateProfileInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid profile data'
        },
        timestamp: new Date().toISOString()
      });
    }

    const updatedUser = await repository.updateUser(request.user!.id, parseResult.data);

    await repository.createAuditLog({
      userId: request.user!.id,
      organizationId: request.organization ? request.organization.id : null,
      action: 'user.profile_update',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.status(200).send({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt
      },
      timestamp: new Date().toISOString()
    });
  });
}
