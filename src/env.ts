require('dotenv').config();

export const PORT = Number(process.env.PORT);
export const MONGO_URL = String(process.env.MONGO_URL);
