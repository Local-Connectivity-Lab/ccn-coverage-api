import express, {Request, Response} from 'express'
import { JSDOM } from 'jsdom';
import { ISignal, SignalData } from '../../models/signal'
import { IMeasurement, MeasurementData } from '../../models/measurement'
import fs from 'fs';
import getDataRange from '../utils/get-data-range';
import isMapType from '../utils/is-map-type';
import isMeasurementType from '../utils/is-measurement-type';

const router = express.Router()
const dom = new JSDOM('');
global.window = dom.window as any;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

import * as L from 'leaflet';

export { router as dataRouter }

// Prepare site information
type SiteStatus = 'active' | 'confirmed' | 'in-conversation';
type Site = {
  name: string;
  latitude: number;
  longitude: number;
  status: SiteStatus;
  address: string;
  cell_id?: string[]
};

// Helper functions
const average = (numbers: number[]) => sum(numbers) / numbers.length;
const sum = (numbers: number[]) => numbers.reduce((total, aNumber) => total + aNumber, 0);

const sites: Site[] = JSON.parse(
  fs.readFileSync('models/sites.json').toString(),
);

const cellIdDict: { [name: string]: string[] } = {}
for (let site of sites) {
  if (site.cell_id != undefined) {
    cellIdDict[site.name] = site.cell_id
  }
}

// Prepare data ranges
const dataRange = getDataRange(sites);

router.get('/api/sites', (_, res: Response) => {
  res.send(sites);
});

router.get('/dataRange', (_, res) => {
  res.send(dataRange);
});

router.get('/api/data', async (req, res) => {
  try {
    const width = Number.parseInt(req.query.width + '');
    const height = Number.parseInt(req.query.height + '');
    const top = Number.parseInt(req.query.top + '');
    const left = Number.parseInt(req.query.left + '');
    const binSizeShift = Number.parseInt(req.query.binSizeShift + '');
    const zoom = Number.parseInt(req.query.zoom + '');
    const selectedSites = req.query.selectedSites + '';
    const mapType = req.query.mapType + '';
    const timeFrom = req.query.from;
    const timeTo = req.query.to;
    let cellList: string[] = []
    for (let site of selectedSites.split(',')) {
      if (cellIdDict[site] != undefined) {
        cellList = cellList.concat(cellIdDict[site]);
      }
    }
    const findObj:any = {}
    findObj['cell_id'] = {
      $in: cellList
    }
    if (timeFrom != undefined || timeTo != undefined) {
      findObj['timestamp'] = {}
    }
    if (timeTo != undefined) {
      findObj['timestamp']['$lt'] = timeTo
    }
    if (timeFrom != undefined) {
      findObj['timestamp']['$gte'] = timeFrom
    }
    const bins = new Array<number[]>(
      (width * height) >> (2 * binSizeShift),
    );

    const map = L.map(dom.window.document.createElement('div')).setView(
      dataRange.center,
      zoom,
    );
    if (!isMapType(mapType)) {
      res.status(400).send('Invalid mapType: ' + mapType);
      console.error('Invalid mapType: ' + mapType);
      return;
    }
    if (cellList.length == 0) {
      res.status(400).send('Invalid sites');
      console.error('Invalid sites');
      return;
    }
    // console.log(findObj)
    let data;
    if (isMeasurementType(mapType)) {
      data = await MeasurementData.find(findObj).sort('timestamp');
      data.forEach(d => {
        const { x, y } = map.project([d.latitude, d.longitude], zoom);
        const value: number = d[mapType];
        const index =
          ((x - left) >> binSizeShift) * height + ((y - top) >> binSizeShift);
        (bins[index] = bins[index] ?? []).push(value);
      });
    } else {
      data = await SignalData.find(findObj).sort('timestamp');
      data.forEach(d => {
        const { x, y } = map.project([d.latitude, d.longitude], zoom);
        const value: number = d['dbm'];
        const index =
          ((x - left) >> binSizeShift) * height + ((y - top) >> binSizeShift);
        (bins[index] = bins[index] ?? []).push(value);
      });
    }
    if (data == undefined) {
      res.status(500).send('database error');
      return;
    }
    let result = [];
    for (let bin of bins) {
      if (bin == undefined) {
        result.push(null)
      } else {
        result.push(average(bin));
      }
    }
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

export { router as queryRouter }
