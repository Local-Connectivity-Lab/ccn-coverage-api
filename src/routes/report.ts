import express, { Request, Response } from 'express';
import * as Crypto from 'crypto';

import { ISignal, SignalData } from '../models/signal';
import { User } from '../models/user';
import { IMeasurement, MeasurementData } from '../models/measurement';
import logger from '../logger';

function runIfAuthenticated(req: Request, res: Response, next: any) {
  const hpkr = Buffer.from(req.body.h_pkr, 'hex');
  const signature = Buffer.from(req.body.sigma_m, 'hex');
  const message = Buffer.from(req.body.M, 'hex');
  User.findOne({ identity: req.body.h_pkr.toLowerCase() })
    .then((user) => {
      if (!user) {
        res.status(401).send('user not found');
        logger.debug('User not found');
        return false;
      }
      const pkt = Crypto.createPublicKey({
        key: Buffer.from(user.publicKey, 'hex'),
        format: 'der',
        type: 'spki',
      });
      if (!Crypto.verify('sha256', message, pkt, signature)) {
        res.status(403).send('invalid signature');
        logger.debug('Invalid signature');
        return false;
      }
      return next(req, res);
    })
    .catch((err: any) => {
      res.status(401).send('user not found');
      logger.debug(`User not found: ${err}`);
      return false;
    });
}

const reportSignal = (req: Request, res: Response) => {
  try {
    const M = new Uint8Array(Buffer.from(req.body.M, 'hex'));
    const decoder = new TextDecoder();
    const serializedContents = decoder.decode(M);
    const signal: ISignal = JSON.parse(serializedContents);
    if (req.body.show_data && req.body.show_data === true) {
      signal.show_data = true;
    }
    signal.device_type ??= 'Android';
    const data = SignalData.build(signal);
    data
      .save()
      .then(() => {
        res.status(201).send('successful');
        logger.debug('Signal data saved');
      })
      .catch(e => {
        res.status(500).send(e);
        logger.error(`Signal data save error: ${e}`);
      });
  } catch (error) {
    res.status(500).send('database Error');
    logger.error(`Database error while saving signal data: ${error}`);
  }
};

const reportMeasurement = (req: Request, res: Response) => {
  try {
    const M = new Uint8Array(Buffer.from(req.body.M, 'hex'));
    const decoder = new TextDecoder();
    const serializedContents = decoder.decode(M);
    const signal: IMeasurement = JSON.parse(serializedContents);
    if (req.body.show_data && req.body.show_data === true) {
      signal.show_data = true;
    }
    signal.device_type ??= 'Android';
    const data = MeasurementData.build(signal);
    data
      .save()
      .then(() => {
        res.status(201).send('successful');
        logger.info('Measurement data saved');
      })
      .catch(e => {
        res.status(500).send(e);
        logger.error(`Measurement data save error: ${e}`);
      });
  } catch (error) {
    res.status(500).send('database Error');
    logger.error(`Database error while saving measurement data: ${error}`);
  }
};

const router = express.Router();

router.post('/api/report_signal', (req: Request, res: Response) => {
  if (!req.body || !req.body.h_pkr || !req.body.sigma_m || !req.body.M) {
    res.status(400).send('bad request');
    return;
  }
  logger.debug('report_signal');
  runIfAuthenticated(req, res, reportSignal);
});

router.post('/api/report_measurement', (req: Request, res: Response) => {
  if (!req.body || !req.body.h_pkr || !req.body.sigma_m || !req.body.M) {
    res.status(400).send('bad request');
    return;
  }
  logger.debug('report_measurement');
  runIfAuthenticated(req, res, reportMeasurement);
});

export { router as reportRouter };
