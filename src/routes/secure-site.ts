import express, { Request, Response } from 'express';
import { Site } from '../models/site';
import { components } from '../types/schema';
import connectEnsureLogin from 'connect-ensure-login';
import * as crypto from 'crypto';

const router = express.Router();

type EditSiteRequest = components['schemas']['Site'];
type NewSiteRequest = components['schemas']['NewSiteRequest'];

// Edit an existing site
export const putSecureSite = async (req: Request, res: Response) => {
  try {
    const siteData: EditSiteRequest = req.body;

    if (!siteData.identity) {
      res.status(400).json({ error: 'Site identity is required' });
      return;
    }

    const updatedSite = await Site.findOneAndUpdate(
      { identity: siteData.identity },
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
};

// Create a new site
export const postSecureSite = async (req: Request, res: Response) => {
  try {
    const siteData: NewSiteRequest = req.body;

    // Generate identity using SHA256 hash
    const skpk = siteData.name;
    const identity = crypto.createHash('sha256').update(skpk).digest('hex');

    const siteWithIdentity: EditSiteRequest = {
      identity,
      ...siteData,
    };

    const newSite = Site.build(siteWithIdentity);
    const savedSite = await newSite.save();

    res.status(201).json({ message: 'Site created successfully', identity });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res
        .status(400)
        .json({ error: 'Validation error', details: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete an existing site
export const deleteSecureSite = async (req: Request, res: Response) => {
  try {
    const { identity } = req.body;

    if (!identity) {
      res.status(400).json({ error: 'Site identity is required' });
      return;
    }

    const deletedSite = await Site.findOneAndDelete({ identity });

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
};

router.put(
  '/secure/edit-sites',
  connectEnsureLogin.ensureLoggedIn(),
  putSecureSite,
);
router.post(
  '/secure/edit-sites',
  connectEnsureLogin.ensureLoggedIn(),
  postSecureSite,
);
router.delete(
  '/secure/edit-sites',
  connectEnsureLogin.ensureLoggedIn(),
  deleteSecureSite,
);

export { router as secureSitesRouter };
