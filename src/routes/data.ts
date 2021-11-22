import express, {Request, Response} from 'express'

import { Data, IData, IQuery, IAggregate, isIAggregate } from '../../models/data'

// const dom = new JSDOM('')
// global.window = dom.window as any
// global.document = dom.window.document
// global.navigator = dom.window.navigator

const router = express.Router()

// Query any data
router.get('/dev/data', async (req: Request, res: Response) => {
  const reqData:IQuery = req.body
  // console.log(req.body)
  let data
  let findObj:any = {}
  if ('cell_id' in reqData) {
    findObj['cell_id'] = reqData['cell_id']
  }
  if ('timestamp_to' in reqData || 'timestamp_from' in reqData) {
    findObj['timestamp'] = {}
  }
  if ('timestamp_to' in reqData) {
    findObj['timestamp']['$lt'] = reqData['timestamp_to']
  }
  if ('timestamp_from' in reqData) {
    findObj['timestamp']['$gte'] = reqData['timestamp_from']
  }
  console.log(reqData)
  data = await Data.find(findObj).sort('timestamp');
  return res.status(200).send(data)
})

// TODO: Aggregate data to be used in the front end
router.get('/api/agg', async (req: Request, res: Response) => {
  if (!isIAggregate(req.query)) {
    throw new Error('...')
  }
  // const reqData: IAggregate = req.query

  // const map = L.map(dom.window.document.createElement('div')).setView([0, 0], 10 /* zoom level */)
  // // const unproject0 = map.unproject([0, 0], 10 /* zoom */)
  // // const lat0 = unproject0.lat;
  // // const lng0 = unproject0.lng;
  // // const unproject1 = map.unproject([1, 1], 10 /* zoom */)
  // // const lat1 = unproject1.lat;
  // // const lng1 = unproject1.lng;
  // const {lat: lat0, lng: lng0} = map.unproject([0, 0], 10 /* zoom */)
  // const {lat: lat1, lng: lng1} = map.unproject([1, 1], 10 /* zoom */)
  // const binSizeX = Math.abs(lng1 - lng0)
  // const binSizeY = Math.abs(lat1 - lat0)
  
  // console.log(reqData)

  // let data
  // let findObj:any = {}
  // if ('cell_id' in reqData) {
  //   findObj['cell_id'] = reqData['cell_id']
  // }
  // if ('timestamp_to' in reqData || 'timestamp_from' in reqData) {
  //   findObj['timestamp'] = {}
  // }
  // if ('timestamp_to' in reqData) {
  //   findObj['timestamp']['$lt'] = reqData['timestamp_to']
  // }
  // if ('timestamp_from' in reqData) {
  //   findObj['timestamp']['$gte'] = reqData['timestamp_from']
  // }
  // console.log(reqData)
  // data = await Data.find(findObj).sort('timestamp');
  // return res.status(200).send(data)
})

// Generate mock-up data
router.get('/dev/gen', async (req: Request, res: Response) => {
  const reqData:{ num?: string} = req.query
  let num: number = 100
  let data: IData[] = new Array()
  // console.log(req.query)
  if ('num' in reqData && typeof reqData.num === 'string') {
    const reqNum: number = parseInt(reqData.num)
    if (!isNaN(reqNum)) { 
      num = reqNum
    }
  }
  for (let i = 0; i < num; i++) {
    let idLess:any = JSON.parse(JSON.stringify(Data.randomBuild()))
    delete idLess['_id']
    data.push(idLess);
  }
  return res.status(200).send(data)
})
 
// TODO: Check if the user is actually online (calling EPCs is_online/status)
router.post('/api/upload', async (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) {
      const reqData:IData = req.body
      const data = Data.build(reqData)
      await data.save()
      return res.status(201).send(data)
  } else {
    const reqData:IData[] = req.body
    console.log(req.body)
    for (let i = 0; i < reqData.length; i++) {
      const data = Data.build(reqData[i])
      await data.save()
    }
    return res.status(201).send("Successful")
  }
})

export { router as dataRouter }
