import * as dotenv from 'dotenv-flow';

export function loadEnv(config?: dotenv.DotenvFlowConfigOptions): void {
  dotenv.config({
    ...config,
  });
}
