require('dotenv').config();

export const PRODUCTION = Boolean(process.env.NODE_ENV === 'production');
export const PORT = Number(process.env.PORT);
export const HOST = String(process.env.HOST);
export const MONGO_URL = String(process.env.MONGO_URL);
