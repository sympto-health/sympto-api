import app from '@server';
import winston from 'winston';

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ],
});

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
