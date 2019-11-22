require('express-async-errors');

import cookieParser from 'cookie-parser';
import express from 'express';
import { Request, Response } from 'express';
import logger from 'morgan';
import path from 'path';
import { BAD_REQUEST } from 'http-status-codes';
import BaseRouter from './routes';

// Init express
const app = express();

// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', BaseRouter);
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack)
  res.status(BAD_REQUEST).send(err.message)
});


// Export express instance
export default app;
