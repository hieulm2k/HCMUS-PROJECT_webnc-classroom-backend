import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(4000),
  STAGE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  FE_URL: Joi.string().required(),
  GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
  GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required(),
});
