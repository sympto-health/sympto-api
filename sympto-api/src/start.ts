import app from './Server';
import logger from './logger';
import { startServer, stopServer } from './ngrok';

// Start the server
const PORT_NUM = 3000;
const server = app.listen(PORT_NUM, async () => {
    await startServer();
    logger.info('Express server started on port: ' + PORT_NUM);
});

const stopNode = async () => {
    console.log("Stopping express app..")
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });
    await stopServer();
}
process.on('SIGTERM', stopNode);
process.on('SIGINT', stopNode);
