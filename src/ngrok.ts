import ngrok from 'ngrok';
import logger from './logger';

const ngrokSingleton = {
  url: '',
};

export const startServer = async () => {
  ngrokSingleton.url = await ngrok.connect(3000);
  logger.info(`Started server on url ${ngrokSingleton.url}`);
}

export const fetchApiUrl = () => (ngrokSingleton.url);

export const stopServer = async () => {
  await ngrok.kill();
};
