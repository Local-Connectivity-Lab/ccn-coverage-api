import express, {Request, Response} from 'express'
import * as Crypto from "crypto"

import { ISignal, SignalData } from '../../models/signal'
import { User, IUser } from '../../models/users'
import { IMeasurement, MeasurementData } from '../../models/measurement'

function runIfAuthenticated(req: Request, res: Response, next: any) {
  const hpkr = Buffer.from(req.body.h_pkr, 'hex');
  const signature = Buffer.from(req.body.sigma_m, 'hex');
  const message = Buffer.from(req.body.M, 'hex');
  User.findOne({ identity: req.body.h_pkr }, (err: any, user: any) => {
    if (err || !user) {
      res.status(401).send('user not found')
      return false;
    } else {
      const pkt = Crypto.createPublicKey({
        key: Buffer.from(user.publicKey, 'hex'),
        format: 'der',
        type: 'spki',
      });
      if (!Crypto.verify('sha256', message, pkt, signature)) {
        res.status(403).send('invalid signature');
        return false;
      }
      return next(req, res);
    }
  });
}

const router = express.Router();
const reportSignal = (req: Request, res: Response) => {
  try {
    const M = Buffer.from(req.body.M, 'hex');
    const decoder = new TextDecoder();
    const serializedContents = decoder.decode(M);
    const signal:ISignal = JSON.parse(serializedContents);
    const data = SignalData.build(signal)
    data.save().then(() => {
      return res.status(201).send('successful')
    })
  } catch(error) {
    console.error(error)
    return res.status(500).send('database Error')
  }
}

const reportMeasurement = (req: Request, res: Response) => {
  try {
    const M = new Uint8Array(Buffer.from(req.body.M, 'hex'));
    const decoder = new TextDecoder();
    const serializedContents = decoder.decode(M);
    const signal:IMeasurement = JSON.parse(serializedContents);
    const data = MeasurementData.build(signal)
    data.save().then(() => {
      return res.status(201).send('successful')
    })
    return res.status(201).send('successful')
  } catch(error) {
    console.error(error)
    return res.status(500).send('database Error')
  }
}

router.post('/api/report_signal', (req: Request, res: Response) => {
  if (!req.body || !req.body.h_pkr || !req.body.sigma_m || !req.body.M) {
    res.status(400).send('bad request');
    return;
  }
  runIfAuthenticated(req, res, reportSignal);
  
})

router.post('/api/report_measurement', async (req: Request, res: Response) => {
  if (!req.body || !req.body.h_pkr || !req.body.sigma_m || !req.body.M) {
    res.status(400).send('bad request');
    return;
  }
  runIfAuthenticated(req, res, reportMeasurement);
})

export { router as reportRouter }
