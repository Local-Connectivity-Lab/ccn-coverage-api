import express, {Request, Response} from 'express'
import * as Crypto from "crypto"
import fs from 'fs';
import { Admin, AdminDoc } from '../../models/admins'
import { User, UserDoc } from '../../models/users'
import date from 'date-and-time';
import connectEnsureLogin from 'connect-ensure-login';

const router = express.Router();
// Calculate how long not to display expired registration request
const expDisplayLimitMin = 30000;

// Get users
// Need an admin token for this API
router.post('/secure/get-users', connectEnsureLogin.ensureLoggedIn(), async (req: Request, res: Response) => {
  const registered = await User.find({ registered: true }).sort('-issueDate').exec();
  const exp = date.addMinutes(new Date(), -expDisplayLimitMin);
  const pending = await User.find({ registered: false, issueDate: { $gte: exp} }).sort('-issueDate').exec();
  res.status(200).send({
    pending: pending,
    registered: registered
  })
});

router.post('/secure/toggle-users', connectEnsureLogin.ensureLoggedIn(), async (req: Request, res: Response) => {
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