import express, {Request, Response} from 'express'
import { Data, IData, IQuery } from '../../models/data'

const router = express.Router()

router.get('/api/data', async (req: Request, res: Response) => {
  const reqData:IQuery = req.body
  console.log(req.body)
  let data
  if ('cell_id' in reqData) {
    data = await Data.find({cell_id: reqData.cell_id})
  } else {
    data = await Data.find({})
  }
  return res.status(200).send(data)
})

router.get('/api/gen', async (req: Request, res: Response) => {
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
    console.log(idLess)
    data.push(idLess);
  }
  return res.status(200).send(data)
})
 
router.post('/api/data', async (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) {
      const reqData:IData = req.body
      const data = Data.build(reqData)
      await data.save()
      return res.status(201).send(data)
  } else {
    const reqData:IData[] = req.body
    for (let i = 0; i < reqData.length; i++) {
      const data = Data.build(reqData[i])
      await data.save()
    }
    return res.status(201).send("Successful")
  }
})


export { router as dataRouter }
