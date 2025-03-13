import express, { Request, Response } from 'express';
import * as Crypto from 'crypto';
import fs from 'fs';
import { Admin, AdminDoc } from '../../models/admins';
import { User } from '../models/user';
import { deflateRaw } from 'zlib';
import connectEnsureLogin from 'connect-ensure-login';
import logger from '../logger';

const router = express.Router();
const pka_str = fs.readFileSync('keys/api-pub', {
  encoding: 'utf8',
  flag: 'r',
});
const pka = Crypto.createPublicKey(pka_str);
const ska_str = fs.readFileSync('keys/api-secret', {
  encoding: 'utf8',
  flag: 'r',
});
const ska = Crypto.createPrivateKey(ska_str);

// Add a new register UE by generating a new key pair.
// Need an admin token for this API
router.post(
  '/secure/new-user',
  connectEnsureLogin.ensureLoggedIn(),
  async (req: Request, res: Response) => {
    const email = req.body.email || '';
    const firstName = req.body.firstName || '';
    const lastName = req.body.lastName || '';
    Crypto.generateKeyPair(
      'ec',
      {
        namedCurve: 'secp256k1',
      },
      (err, publicKey, privateKey) => {
        if (err) {
          res.status(500).send(err);
        } else {
          var result = {};
          const pk = publicKey.export({ format: 'der', type: 'spki' });
          const sk = privateKey.export({ format: 'der', type: 'pkcs8' });
          const signature = Crypto.sign('sha256', sk, ska).toString('hex');
          // TODO: Concatenation
          const skpk = new Uint8Array([...sk, ...pk]);
          const identity = Crypto.createHash('sha256')
            .update(skpk)
            .digest('hex');
          result = {
            sigma_t: signature,
            sk_t: sk.toString('hex'),
            pk_a: pka.export({ format: 'der', type: 'spki' }).toString('hex'),
          };
          logger.debug(`User identity: ${identity}, result: ${result}`);
          User.findOneAndUpdate(
            { identity: identity },
            {
              email: email,
              firstName: firstName,
              lastName: lastName,
              registered: false,
              issueDate: new Date(),
              isEnabled: false,
              publicKey: pk.toString('hex'),
              qrCode: JSON.stringify(result),
            },
            { upsert: true, new: true },
          )
            .exec()
            .then(() => {
              res.status(201).send(result);
            })
            .catch(err => {
              res.status(503).send(`database error ${err}`);
              logger.error(`Database error: ${err}`);
            });
        }
      },
    );
  },
);

export { router as newUserRouter };
