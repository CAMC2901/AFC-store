import { createApp } from './app';
import { env } from './config/env';
import { initStore } from './data/store';
import { initializeRagEngine } from './services/rag.service';

const bootstrap = async (): Promise<void> => {
  // Seed the in-memory store (replaced by Prisma/PostgreSQL later).
  await initStore();

  // Initialize RAG Engine & ChromaDB vector store
  await initializeRagEngine();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`[AFC API] running on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  // Slowloris DoS defense: Set socket and header timeouts
  server.setTimeout(10000); // 10s socket timeout
  server.headersTimeout = 15000; // 15s headers timeout
};

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

bootstrap().catch((err) => {
  console.error('[AFC API] failed to start', err);
  process.exit(1);
});
