import express, { Request, Response } from 'express';
import { Site } from '../models/site';

const router = express.Router();

router.get('/api/sites', async (req: Request, res: Response) => {
  try {
    const sites = await Site.find();

    res.status(200).json({
      sites: sites,
    });
  } catch (error) {
    console.error('Error retrieving public sites:', error);
    res.status(500).send('Internal server error');
  }
});

export { router as publicSitesRouter };
