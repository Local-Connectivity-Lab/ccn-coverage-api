import express, {Request, Response} from 'express'
import * as Crypto from "crypto"

import { ISignal, SignalData } from '../../models/signal'
import { User, IUser } from '../../models/users'
import { IMeasurement, MeasurementData } from '../../models/measurement'

async function isAuthenticated(req: Request) {
  const hpkr = req.body.h_pkr;
  const signature = req.body.sigma_m;
  const message = new Uint8Array(req.body.message);
  const user = await User.findOne({ identity: req.body.hpkr }).exec();
  if (!user) return false;
  const pkt = Crypto.createPublicKey({
    key: Buffer.from(user.publicKey, 'hex'),
    format: 'der',
    type: 'spki',
  });
  if (!Crypto.verify('sha256', message, pkt, signature)) {
    return false;
  }
  return true;
}
const router = express.Router();
// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/api/report_signal', async (req: Request, res: Response) => {
  if (!isAuthenticated(req)) {
    res.status(401).send("not authenticated");
    return;
  }
  req.body.message;
})

// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/api/report_measurement', async (req: Request, res: Response) => {
  if (!isAuthenticated(req)) {
    res.status(401).send("not authenticated");
    return;
  }
  try {
    if (!Array.isArray(req.body)) {
        const reqData:IMeasurement = req.body
        const data = MeasurementData.build(reqData)
        await data.save()
        return res.status(201).send(data)
    } else {
      const reqData:IMeasurement[] = req.body
      for (let i = 0; i < reqData.length; i++) {
        const data = MeasurementData.build(reqData[i])
        await data.save()
      }
      return res.status(201).send("Successful")
    }
  } catch(error) {
    console.error(error)
    return res.status(500).send("Database Error")
  }
})

export { router as uploadRouter }
