import express, {Request, Response} from 'express'
import * as Crypto from "crypto"
import fs from 'fs';
import { Admin, AdminDoc } from '../../models/admins'
import { deflateRaw } from 'zlib';

const router = express.Router();
const pka_str = fs.readFileSync('keys/api-pub', {encoding:'utf8', flag:'r'});
const pka = Crypto.createPublicKey(pka_str);
const ska_str = fs.readFileSync('keys/api-secret', {encoding:'utf8', flag:'r'});
const ska = Crypto.createPrivateKey(ska_str);

// Add a new register UE by generating a new key pair.
// Need an admin token for this API
router.post('/api/new-user', async (req: Request, res: Response) => {
  const username = req.body.username;
  const token = req.body.token;
  const user = await Admin.findOne({ uid: username, token: token }).exec();
  if (!user) {
    res.status(401).send('user is not authenticated');
    return;
  } else if (user.exp < new Date()){
    res.status(401).send('sesssion expired');
    return;
  }
  Crypto.generateKeyPair('ed25519', {
    modulusLength: 4096,
  }, (err, publicKey, privateKey) => {
    if (err) {
      res.status(500).send(err);
    } else {
      var result = {};
      const pk = publicKey.export({ format: 'der', type: 'spki' });
      const sk = privateKey.export({ format: 'der', type: 'pkcs8' });
      const signature = Crypto.sign(null, sk, ska).toString('hex');
      result = {
        sigma_t: signature,
        sk_t: sk.toString('hex'),
        pk_a: pka.export({ format: 'der', type: 'spki' }).toString('hex')
      }
      console.log(result);
      
      // console.log(privateKey.toString('hex'));
      res.status(201).send(result);
    }
  });
});

export { router as newUserRouter }