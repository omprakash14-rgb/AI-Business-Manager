import dotenv from 'dotenv';
import { z } from 'zod';

// Load local environment variables from .env if present
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5174,http://localhost:5173,http://localhost:5175,http://localhost:3000'),
  COOKIE_SECRET: z.string().default('dev-session-cookie-secret-key-32chars'),
  // Supabase PostgreSQL Database Configuration
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional()
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid backend environment variables:', result.error.format());
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
