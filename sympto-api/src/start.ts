import app from '@server';
import logger from './logger';
import { startServer } from './ngrok';

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
    logger.info('Express server started on port: ' + port);
    await startServer();
});
