import express, {Request, Response} from 'express'
import { Data, IData, IQuery } from '../../models/data'

const router = express.Router()

router.get('/api/data', async (req: Request, res: Response) => {
  const reqData:IQuery = req.body
  let data
  if ('cell_id' in reqData) {
    data = await Data.find({cell_id: reqData.cell_id})
  } else {
    data = await Data.find({})
  }
  return res.status(200).send(data)
})
 
router.post('/api/data', async (req: Request, res: Response) => {
  const reqData:IData = req.body
  const data = Data.build(reqData)
  await data.save()
  return res.status(201).send(data)
})


export { router as dataRouter }
