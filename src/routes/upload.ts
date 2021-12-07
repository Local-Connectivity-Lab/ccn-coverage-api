import express, {Request, Response} from 'express'

import { ISignal, SignalData } from '../../models/signal'
import { IMeasurement, MeasurementData } from '../../models/measurement'

// const dom = new JSDOM('')
// global.window = dom.window as any
// global.document = dom.window.document
// global.navigator = dom.window.navigator

const router = express.Router();

// Generate mock-up measurement data
router.get('/dev/gen', async (req: Request, res: Response) => {
  const reqData:{ num?: string} = req.query
  let num: number = 100
  let data: IMeasurement[] = new Array()
  // console.log(req.query)
  if ('num' in reqData && typeof reqData.num === 'string') {
    const reqNum: number = parseInt(reqData.num)
    if (!isNaN(reqNum)) { 
      num = reqNum
    }
  }
  for (let i = 0; i < num; i++) {
    let idLess:any = JSON.parse(JSON.stringify(MeasurementData.randomBuild()))
    delete idLess['_id']
    data.push(idLess);
  }
  return res.status(200).send(data)
})
 
// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/api/upload_signal', async (req: Request, res: Response) => {
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
    return res.status(500).send("Database Error")
  }
})

// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/api/upload_measurement', async (req: Request, res: Response) => {
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
    return res.status(500).send("Database Error")
  }
})

export { router as uploadRouter }
