import express, {Request, Response} from 'express'
import * as crypto from "crypto"
const axios = require('axios').default

import { User, IUser } from '../../models/users'
import { IRegisterRequest, AuthenticationMessage } from '../../models/register'

const EPC_API_ENDPOINT = 'http://localhost:3001/api/'

const instance = axios.create({
  baseURL: EPC_API_ENDPOINT,
  timeout: 1000,
});

const router = express.Router()

// TODO: Work with hardware backed attestation
router.post('/api/register', async (req: Request, res: Response) => {
  // Extract data from the request body.
  const reqBody:IRegisterRequest = req.body
  const publicKey = reqBody.publicKey
  const message = reqBody.message
  const sigMessage = reqBody.sigMessage
  // Serialize data from the authentication message.
  const authMessage = new AuthenticationMessage(message)
  const identity = authMessage.identity
  const attestation = authMessage.attestation

  // Verify the signature
  const keyObject = crypto.KeyObject.from(publicKey)
  const verified = crypto.verify('der', message, keyObject, sigMessage)
  if (!verified) {
    res.status(401).send('Signature Invalid')
  }

  // Asking EPC's database to register a new user
  const response = await instance.post('register', 
    {
      'identity': identity,
      'public_key': publicKey
    }
  )

  if (response.data['success'] == true) {
    const userData = User.build({
      identity: identity,
      public_key: publicKey,
      last_online: new Date().toISOString()
    })
    await userData.save()
    res.status(201).send(response.data)
  } else {
    res.status(200).send(response.data)
  }
})

export { router as registerRouter }