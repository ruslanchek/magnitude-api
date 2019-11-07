// PGSQL
export const POSTGRES_PORT = Number(process.env.POSTGRES_PORT);
export const POSTGRES_HOST = String(process.env.POSTGRES_HOST);
export const POSTGRES_PASSWORD = String(process.env.POSTGRES_PASSWORD);
export const POSTGRES_USERNAME = String(process.env.POSTGRES_USERNAME);
export const POSTGRES_DATABASE = String(process.env.POSTGRES_DATABASE);
export const POSTGRES_SYNCHRONIZE = Boolean(process.env.POSTGRES_SYNCHRONIZE === '1');
export const POSTGRES_SSL = Boolean(process.env.POSTGRES_SSL === '1');

// Auth
export const JWT_SECRET = String(process.env.JWT_SECRET);

// Misc
export const BASE_URL = String(process.env.BASE_URL);

// Sendgrid
export const SENDGRID_API_KEY = String(process.env.SENDGRID_API_KEY);

// SMTP
export const SMTP_HOST = String(process.env.SMTP_HOST);
export const SMTP_PORT = Number(process.env.SMTP_PORT);
export const SMTP_SECURE = String(process.env.SMTP_SECURE);
export const SMTP_USER = String(process.env.SMTP_USER);
export const SMTP_PASS = String(process.env.SMTP_PASS);
