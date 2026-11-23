import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { ApiResponseEnvelope } from '@ai-business-manager/shared';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;

    const errorResponse: ApiResponseEnvelope = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: statusCode === 500 && process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred. Please contact support.'
          : error.message
      },
      timestamp: new Date().toISOString()
    };

    reply.status(statusCode).send(errorResponse);
  });
}
