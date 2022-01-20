import express, {Request, Response} from 'express'
import * as Crypto from "crypto"

import { ISignal, SignalData } from '../../models/signal'
import { User, IUser } from '../../models/users'
import { IMeasurement, MeasurementData } from '../../models/measurement'

async function isAuthenticated(req: Request, res: Response) {
  const hpkr = Buffer.from(req.body.h_pkr, 'hex');
  const signature = Buffer.from(req.body.sigma_m, 'hex');
  const message = Buffer.from(req.body.M);
  const user = await User.findOne({ identity: req.body.hpkr }).exec();
  if (!user) {
    res.status(401).send('user not found')
    return false;
  };
  const pkt = Crypto.createPublicKey({
    key: Buffer.from(user.publicKey, 'hex'),
    format: 'der',
    type: 'spki',
  });
  if (!Crypto.verify('sha256', message, pkt, signature)) {
    res.status(403).send('invalid signature');
    return false;
  }
  return true;
}
const router = express.Router();
router.post('/api/report_signal', async (req: Request, res: Response) => {
  if (!req.body || !req.body.h_pkr || !req.body.sigma_m || !req.body.M) {
    res.status(400).send('bad request');
    return;
  }
  if (!isAuthenticated(req, res)) {
    return;
  }
  const M = new Uint8Array(Buffer.from(req.body.M));
  const decoder = new TextDecoder();
  const serializedContents = decoder.decode(M);
  const signal:ISignal = JSON.parse(serializedContents);
  try {
    const data = SignalData.build(signal)
    await data.save()
    return res.status(201).send('successful')
  } catch(error) {
    console.error(error)
    return res.status(500).send('database Error')
  }
})

router.post('/api/report_measurement', async (req: Request, res: Response) => {
  if (!req.body || !req.body.h_pkr || !req.body.sigma_m || !req.body.M) {
    res.status(400).send('bad request');
    return;
  }
  if (!isAuthenticated(req, res)) {
    return;
  }
  const M = new Uint8Array(Buffer.from(req.body.M));
  const decoder = new TextDecoder();
  const serializedContents = decoder.decode(M);
  const signal:IMeasurement = JSON.parse(serializedContents);
  try {
    const data = MeasurementData.build(signal)
    await data.save()
    return res.status(201).send('successful')
  } catch(error) {
    console.error(error)
    return res.status(500).send('database Error')
  }
})

export { router as uploadRouter }
