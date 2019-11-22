import ngrok from 'ngrok';
import logger from './logger';

export const startServer = async () => {
  const url = await ngrok.connect(3000);
  logger.info(`Started server on url ${url}`);
}

export const apiUrl = ngrok.getUrl();

export const stopServer = async () => {
  await ngrok.kill();
};
