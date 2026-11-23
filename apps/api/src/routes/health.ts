import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  HealthCheckResponseSchema,
  type HealthCheckResponse
} from '@ai-business-manager/shared';
import { env } from '../config/env.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const handler = async (_request: FastifyRequest, reply: FastifyReply) => {
    const responsePayload: HealthCheckResponse = {
      status: 'ok',
      service: 'ai-business-manager-api',
      version: '0.1.0',
      environment: env.NODE_ENV,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    };

    // Validate outgoing payload against shared contract schema
    const validated = HealthCheckResponseSchema.parse(responsePayload);
    return reply.status(200).send(validated);
  };

  // Expose both /api/health and /health
  app.get('/health', handler);
  app.get('/api/health', handler);
}
