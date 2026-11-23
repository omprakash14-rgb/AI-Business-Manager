import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyInstance } from 'fastify';
import { buildServer } from './server.js';
import { env } from './config/env.js';

let appInstance: FastifyInstance | null = null;
let initPromise: Promise<FastifyInstance> | null = null;

/**
 * Initializes Fastify lazily and safely for serverless execution.
 * - Concurrency safe: simultaneous invocations share the in-flight initialization promise.
 * - Failure safe: if initialization fails, the promise is reset so subsequent invocations can retry.
 * - Warm instance reuse: returns the cached instance across warm invocations.
 */
async function getApp(): Promise<FastifyInstance> {
  if (appInstance) {
    return appInstance;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const app = await buildServer();
        await app.ready();
        appInstance = app;
        return app;
      } catch (err) {
        initPromise = null;
        throw err;
      }
    })();
  }

  return initPromise;
}

/**
 * Default HTTP request handler for Vercel Functions.
 * Forwards incoming Node.js HTTP requests/responses directly into Fastify.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const app = await getApp();
    app.server.emit('request', req, res);
  } catch (err) {
    console.error('Failed to initialize or handle request in Vercel Function:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to initialize server application'
        })
      );
    }
  }
}

// Standalone execution for local development
if (process.env.VERCEL !== '1') {
  async function start() {
    const app = await buildServer();

    try {
      await app.listen({
        port: env.PORT,
        host: env.HOST
      });
      app.log.info(`🚀 AI Business Manager API running at http://${env.HOST}:${env.PORT}`);
      app.log.info(`🩺 Health check available at http://${env.HOST}:${env.PORT}/api/health`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        app.log.info(`Received ${signal}. Gracefully terminating server...`);
        try {
          await app.close();
          app.log.info('Server closed successfully.');
          process.exit(0);
        } catch (closeErr) {
          app.log.error(closeErr as Error, 'Error during shutdown');
          process.exit(1);
        }
      });
    }
  }

  start();
}
