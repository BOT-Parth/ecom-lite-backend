require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }),
  DB_SSL: z.enum(['true', 'false']).default('false'),
  JWT_SECRET: z.string({ required_error: 'JWT_SECRET is required' }),
  CUSTOMER_JWT_SECRET: z.string({ required_error: 'CUSTOMER_JWT_SECRET is required' }),
  JWT_EXPIRES_IN: z.string().default('24h'),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(1).optional(),
  SUPER_ADMIN_USERNAME: z.string().default('admin'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:\n', _env.error.format());
  process.exit(1);
}

module.exports = _env.data;
