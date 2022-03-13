import express, {Request, Response} from 'express'
import * as Crypto from "crypto"
import { ISignal, SignalData } from '../../models/signal'
import { Admin, IAdmin } from '../../models/admins'
import { IMeasurement, MeasurementData } from '../../models/measurement'
import connectEnsureLogin from 'connect-ensure-login';
import { reduceEachTrailingCommentRange } from 'typescript'
const CSV = require('csv-string');

const router = express.Router();

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

async function removeGroupMeasurement(group: string) {
  await SignalData.find({ group: group }).deleteMany().exec();
  await MeasurementData.find({ group: group }).deleteMany().exec();
}

router.post('/secure/get_groups', connectEnsureLogin.ensureLoggedIn('/api/failure'), async (req: Request, res: Response) => {
  try {
    const signalGroup = await SignalData.find().distinct('group');
    const measurementGroup = await MeasurementData.find().distinct('group');
    const groups = [...new Set([...signalGroup,...measurementGroup])]
    return res.status(200).send(groups);
  } catch(error) {
    console.error(error);
    return res.status(500).send('database error');
  }
});

router.post('/secure/delete_group', connectEnsureLogin.ensureLoggedIn('/api/failure'), async (req: Request, res: Response) => {
  try {
    await removeGroupMeasurement(req.body.group);
    return res.status(200).send('successfully deleted');
  } catch(error) {
    console.error(error);
    return res.status(500).send('database error');
  }
});

router.post('/secure/delete_manual', connectEnsureLogin.ensureLoggedIn('/api/failure'), async (req: Request, res: Response) => {
  try {
    await removeManualMeasurement();
    return res.status(200).send('successfully deleted');
  } catch(error) {
    console.error(error);
    return res.status(500).send('database error');
  }
});

router.post('/secure/upload_data', connectEnsureLogin.ensureLoggedIn('/api/failure'), async (req: Request, res: Response) => {
  try {
    // console.log(req.body.csv)
    // console.log(req.body.group);
    if (!req.body || !req.body.csv) {
      return res.status(400).send("Bad request")
    }
    const data = CSV.parse(req.body.csv, { output: 'objects' });

    await data.forEach((row: any) => {
      if (row.dbm == '' || row.ping == '' || row.download_speed == '' || row.upload_speed == '') {
        return;
      }
      // Split latitude and logitude from coordinate
      row.latitude = Number(row.coordinate.split(',')[0]);
      row.longitude = Number(row.coordinate.split(',')[1]);
      row.level_code = -1;
      // Only get the actual cell_id 
      row.cell_id = row.cell_id.split('-')[1];
      // Parse and merge datetime
      row.timestamp = Date.parse(row.date + 'T' + row.time);
      // Get average of dbm values
      const splitAvg = (arr:any ) => {
        const tmp = arr.split(',').map((x: string) => {return parseFloat(x)});
        return tmp.reduce((a: number, b: number) => a + b / dbms.length, 0);
      }
      row.dbm = splitAvg(row.dbm);
      row.upload_speed = splitAvg(row.upload_speed);
      row.download_speed = splitAvg(row.download_speed);
      row.ping = splitAvg(row.ping);
      // Set group if any
      if (req.body.group != '') {
        row.group = req.body.group;
      }
      row.mid = Crypto.randomBytes(16).toString('hex')
    });
    
    await removeGroupMeasurement(req.body.group);
    const signalPromise = SignalData.insertMany(data, {
      ordered: false
    });
    const MeasurementPromise = MeasurementData.insertMany(data, {
      ordered: false
    });
    Promise.all([signalPromise, MeasurementPromise]).then((values) => {
      return res.status(201).send('successful');
    }).catch((errs) => {
      res.status(503).send(errs[0] + ', ' + errs[1]);
      return;
    });
  } catch(error) {
    console.error(error)
    return res.status(500).send("Incorrect Format or Database Error")
  }
})

export { router as uploadRouter }
