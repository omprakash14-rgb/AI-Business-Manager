import { buildServer } from './server.js';
import { env } from './config/env.js';

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
