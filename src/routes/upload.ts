import express, {Request, Response} from 'express'
import * as Crypto from "crypto"

import { ISignal, SignalData } from '../../models/signal'
import { Admin, IAdmin } from '../../models/admins'
import { IMeasurement, MeasurementData } from '../../models/measurement'
import connectEnsureLogin from 'connect-ensure-login';

// const dom = new JSDOM('')
// global.window = dom.window as any
// global.document = dom.window.document
// global.navigator = dom.window.navigator

const router = express.Router();
// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/secure/upload_signal', connectEnsureLogin.ensureLoggedIn(), async (req: Request, res: Response) => {
  try {
    if (!Array.isArray(req.body)) {
        const reqData:ISignal = req.body
        const data = SignalData.build(reqData)
        await data.save()
        return res.status(201).send(data)
    } else {
      const reqData:ISignal[] = req.body
      for (let i = 0; i < reqData.length; i++) {
        const data = SignalData.build(reqData[i])
        await data.save()
      }
      return res.status(201).send("Successful")
    }
  } catch(error) {
    console.error(error)
    return res.status(500).send("Database Error")
  }
})

// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/secure/upload_measurement', connectEnsureLogin.ensureLoggedIn(), async (req: Request, res: Response) => {
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
