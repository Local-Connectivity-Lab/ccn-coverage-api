import express, {Request, Response} from 'express'
import fs from 'fs';
import { Admin, IAdmin } from '../../models/admins'

async function isAdminAuthenticated (req: Request) {
  // Bypass if there is an unexpired admin token
  if (req.headers['token'] && req.headers['username']) {
    const user = await Admin.findOne({ uid: req.headers['username'], token: req.headers['token'] }).exec();
    if (!user) {
      return false;
    } else if (user.exp < new Date()){
      return false;
    }
    return true;
  }
  return false;
}

const router = express.Router();
// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/secure/edit_sites', async (req: Request, res: Response) => {
  if (!await isAdminAuthenticated(req)) {
    res.status(401).send("not authenticated");
    return;
  }
  try {
    const sites = req.body;
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
