import { z } from 'zod';
import { Environment } from '@app/config/environment-variables/enums/env.enum';

export const environmentVariablesSchema = z.object({
  NODE_ENV: z.nativeEnum(Environment),
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string(),
  SWAGGER_PATH: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string().optional(),
  AWS_S3_REGION: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
