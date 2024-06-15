import {
  EnvironmentVariables,
  environmentVariablesSchema,
} from '@app/config/environment-variables/env-vars';

export function validateEnv(
  envConfig: Record<string, unknown>,
): EnvironmentVariables {
  const parseResult = environmentVariablesSchema.safeParse(envConfig);

  if (!parseResult.success) {
    throw new Error(
      'Configuration validation error: ' +
        JSON.stringify(parseResult.error.format()),
    );
  }

  return parseResult.data;
}
