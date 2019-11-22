import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';
import axios from 'axios';
import { clientId, clientSecret, clientURL } from '../config';

import logger from '../logger';

// Init router and path
const router = Router();

console.log({ clientId, clientSecret, clientURL } );

/**
 * Webhook used as clinic endpoint
 */
router.post('/webhook', async (req: Request, res: Response) => {
  logger.info('Request from Sympto Health');
});

/**
 * Generate auth code and create a set of users and groups
 */
router.get('/setup', async (req: Request, res: Response) => {
  logger.info('Fetching auth code');

  // Generates auth code
  const { data: { Response: authCode } } = await axios.post(`${clientURL}/authorization`, {
    clientId,
    clientSecret,
  });
  logger.info(`Auth code is ${authCode}`);
  throw new Error('wow');
});

router.get('/users', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching auth code');

    // Generates auth code
    const { data: { Response: authCode } } = await axios.post(`${clientURL}/authorization`, {
      clientId,
      clientSecret,
    });
    logger.info(`Auth code is ${authCode}`);

    // Create 3 groups
    const { data: { Response: groupId } } = await axios.post(`${clientURL}/clinicAdmin/groups`, {
      groupName: 'Group 1',
    });
    res.send(authCode);

  } catch (err) {
    return res.status(BAD_REQUEST).json({
      error: err.message,
    });
  }
});

/***
 * Create a set of users and groups
 */


router.get('/all', async (req: Request, res: Response) => {
  try {
      return res.status(OK).json({});
  } catch (err) {
      return res.status(BAD_REQUEST).json({
          error: err.message,
      });
  }
});

// Export the base-router
export default router;
