import express, {Request, Response} from 'express'

import { ISignal, SignalData } from '../../models/signal'
import { Admin, IAdmin } from '../../models/admins'
import { IMeasurement, MeasurementData } from '../../models/measurement'
import connectEnsureLogin from 'connect-ensure-login';
import { reduceEachTrailingCommentRange } from 'typescript'
const CSV = require('csv-string');

// const dom = new JSDOM('')
// global.window = dom.window as any
// global.document = dom.window.document
// global.navigator = dom.window.navigator

const router = express.Router();
// TODO: Improve parsing performance, return different responses
const manual = [
  'LGG8',
  'CPEL',
  'CPEH',
  'Pixel4'
]

async function removeManualMeasurement() {
  await SignalData.find({ device_id: manual }).deleteMany().exec();
  await MeasurementData.find({ device_id: manual }).deleteMany().exec();
}
router.post('/secure/upload_data', connectEnsureLogin.ensureLoggedIn(), async (req: Request, res: Response) => {
  try {
    console.log(req.body.csv)
    if (!req.body || !req.body.csv) {
      return res.status(400).send("Bad request")
    }
    const data = CSV.parse(req.body.csv, { output: 'objects' });

    data.forEach((row: any) => {
      row.latitude = Number(row.coordinate.split(',')[0]);
      row.longitude = Number(row.coordinate.split(',')[1]);
      row.level_code = -1;
      row.cell_id = row.cell_id.split('-')[1];
      row.timestamp = Date.parse(row.date + 'T' + row.time);
      const dbms = row.dbm.split(',').map((x: string) => {return parseInt(x)})
      row.dbm = dbms.reduce((a: number, b: number) => a + b / dbms.length, 0);
    });
    
    await removeManualMeasurement();
    SignalData.insertMany(data).then(()=> {
      MeasurementData.insertMany(data).then(()=> {
        res.status(201).send('successful');
      }).catch((err: any) => {
        res.status(503).send(err);
        return;
      })
    }).catch((err: any) => {
      res.status(503).send(err);
      return;
    })
  } catch(error) {
    console.error(error)
    return res.status(500).send("Incorrect Format or Database Error")
  }
})

export { router as uploadRouter }
