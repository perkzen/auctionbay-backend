import * as env from 'env-var';
import * as dotenv from 'dotenv';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

const currEnv = process.env.NODE_ENV?.trim() || Environment.DEVELOPMENT;

dotenv.config({
  path: `${process.cwd()}/.env.${currEnv}`,
});

const settings = {
  app: {
    port: env.get('PORT').required().asPortNumber(),
    environment: env
      .get('NODE_ENV')
      .required()
      .asEnum(Object.values(Environment)),
    swaggerPath: env.get('SWAGGER_PATH').default('docs').asString(),
  },
};

export default settings;
