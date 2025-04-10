import { z } from "zod";

const envSchema = z.object({
  VITE_BASE_API_URL: z.string().url(),
});

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  COOKIE_SECRET_PASSWORD: z.string().min(1),
});

export const env = envSchema.parse(import.meta.env);
export const serverEnv = serverEnvSchema.parse(process.env);
