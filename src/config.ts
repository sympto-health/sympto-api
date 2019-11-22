import dotenv from 'dotenv';

dotenv.config();

export const clientId = process.env.CLIENT_ID;
export const clientSecret = process.env.CLIENT_SECRET;
export const clientURL = process.env.CLIENT_URL;
export const clientFrontendURL = process.env.CLIENT_FRONTEND_URL;
