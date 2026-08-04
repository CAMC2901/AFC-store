import { createApp } from './app';
import { env } from './config/env';
import { initStore } from './data/store';

const bootstrap = async (): Promise<void> => {
  // Seed the in-memory store (replaced by Prisma/PostgreSQL later).
  await initStore();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`[AFC API] running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
};

bootstrap().catch((err) => {
  console.error('[AFC API] failed to start', err);
  process.exit(1);
});
