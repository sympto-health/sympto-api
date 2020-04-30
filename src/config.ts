import dotenv from 'dotenv';

dotenv.config();

const fetchEnvValue = (envValue: string) => {
	if (!(envValue in process.env)) {
		throw new Error(`${envValue} not configured in .env`)
	}
	return String(process.env[envValue]);
}
export const clientId: string = fetchEnvValue('CLIENT_ID');
export const clientSecret: string = fetchEnvValue('CLIENT_SECRET');
export const clientURL: string = fetchEnvValue('CLIENT_URL');
export const clientFrontendURL: string = fetchEnvValue('CLIENT_FRONTEND_URL');
