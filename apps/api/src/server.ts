import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { registerAuthPlugin } from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { organizationRoutes } from './routes/organization.routes.js';
import { fileRoutes } from './routes/file.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { activityRoutes } from './routes/activity.routes.js';
import { crmRoutes } from './routes/crm.routes.js';
import { salesRoutes } from './routes/sales.routes.js';
import { financeRoutes } from './routes/finance.routes.js';
import { projectRoutes } from './routes/projects.routes.js';
import { marketingRoutes } from './routes/marketing.routes.js';
import { hrRoutes } from './routes/hr.routes.js';
import { analyticsRoutes } from './routes/analytics.routes.js';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: env.NODE_ENV !== 'production'
        ? undefined
        : undefined
    }
  });

  // Register CORS
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return cb(null, true);

      // Support comma-separated origins or single origin from configuration
      const allowedOrigins = new Set(
        env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
      );

      // Helper to add sanitized HTTPS origin from Vercel environment variables
      const addVercelOrigin = (host?: string) => {
        if (!host) return;
        const clean = host.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
        if (clean) {
          allowedOrigins.add(`https://${clean}`);
        }
      };

      // Support exact current Vercel deployment hostname
      addVercelOrigin(env.VERCEL_URL || process.env.VERCEL_URL);

      // Support exact Vercel production hostname
      addVercelOrigin(env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL);

      // Support exact Vercel branch deployment hostname
      addVercelOrigin(env.VERCEL_BRANCH_URL || process.env.VERCEL_BRANCH_URL);

      if (allowedOrigins.has(origin)) {
        return cb(null, true);
      }

      // Safe rejection: deny cross-origin access without generating an HTTP 500 error
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  });

  // Register Cookie & Authentication context plugin
  await registerAuthPlugin(app);

  // Centralized Error Handling
  registerErrorHandler(app);

  // Root welcome route
  app.get('/', async (_req, reply) => {
    return reply.send({
      service: 'AI Business Manager API',
      status: 'online',
      version: '0.1.0',
      phase: 'Phase 8: Marketing Management',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        users: '/api/users',
        organizations: '/api/organizations',
        files: '/api/files',
        notifications: '/api/notifications',
        activities: '/api/activities',
        auditLogs: '/api/audit-logs',
        crm: '/api/crm',
        sales: '/api/sales',
        finance: '/api/finance',
        projects: '/api/projects',
        marketing: '/api/marketing'
      }
    });
  });

  // Register Core Routes
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(organizationRoutes, { prefix: '/api/organizations' });

  // Register Phase 3 Shared Platform Services Routes
  await app.register(fileRoutes, { prefix: '/api/files' });
  await app.register(notificationRoutes, { prefix: '/api/notifications' });
  await app.register(activityRoutes, { prefix: '/api' });

  // Register Phase 4 CRM & Lead Management Routes
  await app.register(crmRoutes, { prefix: '/api/crm' });

  // Register Phase 5 Sales Management Routes
  await app.register(salesRoutes, { prefix: '/api/sales' });

  // Register Phase 6 Operational Finance Routes
  await app.register(financeRoutes, { prefix: '/api/finance' });

  // Register Phase 7 Project Management Routes
  await app.register(projectRoutes, { prefix: '/api/projects' });

  // Register Phase 8 Marketing Management Routes
  await app.register(marketingRoutes, { prefix: '/api/marketing' });

  // Register Phase 9 HR Management Routes
  await app.register(hrRoutes, { prefix: '/api/hr' });

  // Register Phase 10 Executive Dashboard & Analytics Routes
  await app.register(analyticsRoutes, { prefix: '/api/analytics' });

  return app;
}
