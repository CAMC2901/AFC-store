import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment configuration.
 * All secrets live in the server only and are never exposed to the client.
 */


const devSecrets = new Map<string, string>();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV !== 'production') {
      if (!devSecrets.has(name)) {
        devSecrets.set(name, `dev_secret_fallback_${name.toLowerCase()}_afc_key_2026`);
        console.warn(`[env] Missing ${name}. Using stable development fallback secret.`);
      }
      return devSecrets.get(name)!;
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3001',

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
  },

  databaseUrl: process.env.DATABASE_URL ?? '',
  prismaEnabled: process.env.PRISMA_ENABLED === 'true',
  n8nWebhookUrl: process.env.N8N_FORGOT_PASSWORD_WEBHOOK_URL ?? '',

  assistant: {
    // Groq is the primary provider (with Gemini as backup if configured).
    // When primary API key is missing or rate-limited, it falls back to local Ollama (llama3).
    groqApiKey: process.env.GROQ_API_KEY ?? '',
    groqModel: process.env.GROQ_MODEL ?? 'groq/compound',
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.6-flash',
    ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL ?? 'llama3',
  },
} as const;

export const isProduction = env.nodeEnv === 'production';
