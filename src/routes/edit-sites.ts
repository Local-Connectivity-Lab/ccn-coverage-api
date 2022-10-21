import express, {Request, Response} from 'express'
import fs from 'fs';
import { Admin, IAdmin } from '../../models/admins'
import connectEnsureLogin from 'connect-ensure-login';

const router = express.Router();
// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/secure/edit_sites', connectEnsureLogin.ensureLoggedIn(), async (req: Request, res: Response) => {
  try {
    const sites = req.body.sites.replace(/(^"|"$)/g, '');
    fs.writeFile(__dirname + '/../../models/sites.json', JSON.stringify(sites), function(err) {
      if (err) {
        console.error(err);
        res.status(500).send("database error");
        return;
      }
      res.status(201).send('updated');
      return;
    })
  } catch (err) {
    res.status(400).send('bad request');
  }
});

export { router as editSitesRouter }
