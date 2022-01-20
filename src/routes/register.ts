import express, {Request, Response} from 'express'
import * as Crypto from "crypto"
import fs from 'fs';
import { User, IUser } from '../../models/users'
import { IRegisterRequest, AuthenticationMessage } from '../../models/register'
import date from 'date-and-time';

const router = express.Router()

// Need to register within n minutes after issue a QR code
const registerTimeoutMin = 30000;

router.post('/api/register', async (req: Request, res: Response) => {
  if (!req.body || !req.body.sigma_r || !req.body.h || !req.body.R) {
    res.status(400).send('bad request');
    return;
  }
  const sigma_r = Buffer.from(req.body.sigma_r, 'hex');
  const h = Buffer.from(req.body.h, 'hex');

  // Deconstruct hashes
  const hpkr = h.slice(0, 32).toString('hex');
  const hsec = h.slice(32).toString('hex');
  const R = Buffer.from(req.body.R, 'hex');
  const r = new Uint8Array(R);

  // Check if the user is already registered
  const authUser = await User.findOne({ identity: hpkr });
  if (authUser && authUser.registered) {
    res.status(200).send('already registered');
    return;
  }
  // Get user infromation from the database by identity.
  const user = await User.findOne({ identity: hsec });

  // Return error when the registration is never issued by admins
  if (!user) {
    res.status(401).send('registration not issued by admins');
    return;
  }

  // Check if the registration period has expired
  const exp = date.addMinutes(user.issueDate, registerTimeoutMin);
  if (new Date() > exp) {
    res.status(403).send('registration period expired');
    return;
  }

  // Get public key of the pending registration from the database
  const pk = Crypto.createPublicKey({
    key: Buffer.from(user.publicKey, 'hex'),
    format: 'der',
    type: 'spki'
  });

  // Verify signature
  if (!Crypto.verify('sha256', h, pk, sigma_r)) {
    res.status(403).send('invalid signature');
    return;
  }

  // Verify if the requet from Android matches the issued registration.
  const pkt = pk.export({ format: 'der', type: 'spki' });
  const pktr = new Uint8Array([ ...pkt, ...r]);
  const hpktr = Crypto.createHash('sha256').update(pktr).digest('hex');
  if (hpktr !== hpkr) {
    res.status(403).send('outdate request, please try again');
    return;
  }

  // Register the user
  User.findOneAndUpdate({identity: hsec, }, {
    registered: true,
    identity: hpkr,
    isEnabled: true,
    privateKey: ""
  }, {upsert: true, new: true}).exec().then(()=> {
    res.status(201).send('registered');
  }).catch((err) => {
    res.status(503).send('database error');
  })
});

export { router as registerRouter }