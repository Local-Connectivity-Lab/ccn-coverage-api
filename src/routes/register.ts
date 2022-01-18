import express, {Request, Response} from 'express'
import * as Crypto from "crypto"
import fs from 'fs';
import { User, IUser } from '../../models/users'
import { IRegisterRequest, AuthenticationMessage } from '../../models/register'
import date from 'date-and-time';

const router = express.Router()

// Need to register within n minutes after issue a QR code
const registerTimeoutMin = 30;

router.post('/api/register', async (req: Request, res: Response) => {
  const sigma_r = req.body.sigma_r;
  const h = req.body.h;
  const r = req.body.r;
  const user = await User.findOne({ identity: h });

  if (!user) {
    res.status(401).send('registration not issued by admins');
    return;
  }

  const exp = date.addMinutes(user.issueDate, registerTimeoutMin);
  if (new Date() > exp) {
    res.status(403).send('registration period expired');
    return;
  }
  
  const pk = Crypto.createPublicKey(user.publicKey);
  if (!Crypto.verify('ed25519', h, pk, sigma_r)) {
    res.status(403).send('invalid signature');
    return;
  }
  console.log(h);
  // const hpkr = 

});

export { router as registerRouter }