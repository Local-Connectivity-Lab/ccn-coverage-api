import express, {Request, Response} from 'express'
import * as Crypto from "crypto"
import fs from 'fs';
import { Admin, AdminDoc } from '../../models/admins'
import { User, UserDoc } from '../../models/users'
import date from 'date-and-time';

const router = express.Router();
// Calculate how long not to display expired registration request
const expDisplayLimitMin = 30000;

async function isAuthenticated(username: string, token: string) {
  const admin = await Admin.findOne({ uid: username, token: token }).exec();
  if (!admin) {
    return false;
  } else if (admin.exp < new Date()){
    return false;
  }
  return true;
}

// Get users
// Need an admin token for this API
router.post('/secure/get-users', async (req: Request, res: Response) => {
  const username = req.body.username || "";
  const token = req.body.token || "";
  if (!isAuthenticated) {
    res.status(401).send('user is not authenticated');
    return;
  }

  const registered = await User.find({ registered: true }).sort('-issueDate').exec();
  const exp = date.addMinutes(new Date(), -expDisplayLimitMin);
  const pending = await User.find({ registered: false, issueDate: { $gte: exp} }).sort('-issueDate').exec();
  res.status(200).send({
    pending: pending,
    registered: registered
  })
});

router.post('/secure/toggle-users', async (req: Request, res: Response) => {
  const username = req.body.username || "";
  const token = req.body.token || "";
  if (!isAuthenticated) {
    res.status(401).send('user is not authenticated');
    return;
  }

  if (!req.body.identity || !req.body.enabled) {
    res.status(400).send('invalid parameters')
    return;
  }
  const identity = req.body.identity;
  const enabled = req.body.enabled;
  User.findOneAndUpdate({identity: identity, }, {
    isEnabled: enabled
  }).exec().then(()=> {
    res.status(201).send('toggled');
  }).catch((err) => {
    res.status(503).send('database error');
  })
});

export { router as usersRouter }