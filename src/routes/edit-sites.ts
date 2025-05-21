import express, { Request, Response } from 'express';
import fs from 'fs';
import { Admin, IAdmin } from '../models/admins';
import connectEnsureLogin from 'connect-ensure-login';
import logger from '../logger';

const router = express.Router();
// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post(
  '/secure/edit_sites',
  connectEnsureLogin.ensureLoggedIn(),
  async (req: Request, res: Response) => {
    try {
      const sites = JSON.parse(req.body.sites);

      fs.writeFile(
        __dirname + '/../models/sites.json',
        JSON.stringify(sites),
        err => {
          if (err) {
            logger.error(`Cannot save updated sites: ${err}`);
            res.status(500).send('database error');
            return;
          }
          res.status(201).send('updated');
          logger.debug(`Saved new sites info: ${sites}`);
          return;
        },
      );
    } catch (err) {
      res.status(400).send('bad request');
    }
  },
);

export { router as editSitesRouter };
