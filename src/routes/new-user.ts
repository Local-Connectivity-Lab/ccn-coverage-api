import express, {Request, Response} from 'express'
import * as Crypto from "crypto"
import fs from 'fs';
import { Admin, AdminDoc } from '../../models/admins'
import { User, UserDoc } from '../../models/users'
import { deflateRaw } from 'zlib';

const router = express.Router();
const pka_str = fs.readFileSync('keys/api-pub', {encoding:'utf8', flag:'r'});
const pka = Crypto.createPublicKey(pka_str);
const ska_str = fs.readFileSync('keys/api-secret', {encoding:'utf8', flag:'r'});
const ska = Crypto.createPrivateKey(ska_str);

// Add a new register UE by generating a new key pair.
// Need an admin token for this API
router.post('/secure/new-user', async (req: Request, res: Response) => {
  const username = req.body.username;
  const token = req.body.token;
  const email = req.body.email || "";
  const firstName = req.body.firstName || "";
  const lastName = req.body.lastName || "";
  const user = await Admin.findOne({ uid: username, token: token }).exec();
  if (!user) {
    res.status(401).send('user is not authenticated');
    return;
  } else if (user.exp < new Date()){
    res.status(401).send('sesssion expired');
    return;
  }
  Crypto.generateKeyPair('rsa', {
    modulusLength: 2048,
  }, (err, publicKey, privateKey) => {
    if (err) {
      res.status(500).send(err);
    } else {
      var result = {};
      const pk = publicKey.export({ format: 'der', type: 'spki' });
      const sk = privateKey.export({ format: 'der', type: 'pkcs8' });
      const signature = Crypto.sign('sha256', sk, ska).toString('hex');
      // TODO: Concatenation
      const skpk = new Uint8Array([ ...sk, ...pk]);
      const identity = Crypto.createHash('sha256').update(skpk).digest('hex');
      result = {
        sigma_t: signature,
        sk_t: sk.toString('hex'),
        pk_a: pka.export({ format: 'der', type: 'spki' }).toString('hex')
      }
      // console.log(result);
      User.findOneAndUpdate({identity: identity, }, {
        email: email,
        firstName: firstName,
        lastName: lastName,
        registered: false,
        issueDate: new Date(),
        isEnabled: false,
        publicKey: pk.toString('hex')
      }, {upsert: true, new: true}).exec().then(()=> {
        res.status(201).send(result);
      }).catch((err) => {
        res.status(503).send('database error');
      })
    }
  });
});

export { router as newUserRouter }