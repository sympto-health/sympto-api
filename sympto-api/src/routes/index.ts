import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';
import axios from 'axios';
import { clientId, clientSecret, clientURL } from '../config';

// Init router and path
const router = Router();

console.log({ clientId, clientSecret, clientURL } );

/**
 * Generate auth code and create a set of users and groups
 */
router.get('/setup', async (req: Request, res: Response) => {
  // Generates auth code
  const authCode = await axios.post('/authorization', {
    clientId,
    clientSecret,
  });
  res.send(authCode);
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
