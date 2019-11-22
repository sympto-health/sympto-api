import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';

// Init router and path
const router = Router();

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
