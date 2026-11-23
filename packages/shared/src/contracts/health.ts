import { z } from 'zod';

export const HealthStatusSchema = z.enum(['ok', 'degraded', 'error']);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const HealthCheckResponseSchema = z.object({
  status: HealthStatusSchema,
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  uptime: z.number(),
  timestamp: z.string()
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
