import * as env from 'env-var';
import * as dotenv from 'dotenv';
import * as process from 'process';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

const currEnv =
  Object.values(Environment).includes(
    process.env.NODE_ENV?.trim() as Environment,
  ) || Environment.DEVELOPMENT;

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
    corsOrigin: env.get('CORS_ORIGIN').default('*').asString(),
  },
  database: {
    url: env.get('DATABASE_URL').required().asString(),
  },
  jwt: {
    secret: env.get('JWT_SECRET').required().asString(),
    expiresIn: env.get('JWT_EXPIRATION').default('1d').asString(),
  },
  aws: {
    s3: {
      region: env.get('AWS_S3_REGION').default('eu-central-1').asString(),
      bucket: env.get('AWS_S3_BUCKET_NAME').default('bucket').asString(),
    },
    accessKeyId: env.get('AWS_ACCESS_KEY_ID').required().asString(),
    secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY').required().asString(),
  },
};

export default settings;
