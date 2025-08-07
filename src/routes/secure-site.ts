import express, { Request, Response } from 'express';
import { Site } from '../models/site';
// import connectEnsureLogin from 'connect-ensure-login';
import { components } from '../types/schema';

const router = express.Router();

type SiteRequest = components['schemas']['Site'];

// Edit an existing site
router.put(
  '/api/secure-site',
  //   connectEnsureLogin.ensureLoggedIn('/api/failure'),
  async (req: Request, res: Response) => {
    try {
      const siteData: SiteRequest = req.body;

      if (!siteData.name) {
        res.status(400).json({ error: 'Site name is required' });
        return;
      }

      const updatedSite = await Site.findOneAndUpdate(
        { name: siteData.name },
        siteData,
        { new: true, runValidators: true },
      );

      if (!updatedSite) {
        res.status(404).json({ error: 'Site not found' });
        return;
      }

      res.status(200).json({ message: 'Site updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Create a new site
router.post(
  '/api/secure-site',
  //   connectEnsureLogin.ensureLoggedIn('/api/failure'),
  async (req: Request, res: Response) => {
    try {
      const siteData: SiteRequest = req.body;

      const newSite = Site.build(siteData);
      const savedSite = await newSite.save();

      res.status(201).json(savedSite);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        res
          .status(400)
          .json({ error: 'Validation error', details: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Delete an existing site
router.delete(
  '/api/secure-site',
  //   connectEnsureLogin.ensureLoggedIn('/api/failure'),
  async (req: Request, res: Response) => {
    try {
      const siteData: SiteRequest = req.body;

      if (!siteData.name) {
        res.status(400).json({ error: 'Site name is required' });
        return;
      }

      const deletedSite = await Site.findOneAndDelete({ name: siteData.name });

      if (!deletedSite) {
        res.status(404).json({ error: 'Site not found' });
        return;
      }

      res
        .status(200)
        .json({ message: 'Site deleted successfully', site: deletedSite });
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export { router as secureSitesRouter };
