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

var sites: Site[] = JSON.parse(
  fs.readFileSync('models/sites.json').toString(),
);

const cellIdDict: { [name: string]: string[] } = {}
const siteNameDict: { [name: string]: string } = {}
for (let site of sites) {
  if (site.cell_id != undefined) {
    cellIdDict[site.name] = site.cell_id;
    for (let cellId of site.cell_id) {
      siteNameDict[cellId] = site.name;
    }
  }
}

// Prepare data ranges
const dataRange = getDataRange(sites);

router.get('/api/sites', (_, res: Response) => {
  sites = JSON.parse(
    fs.readFileSync('models/sites.json').toString(),
  );
  res.send(sites);
});

router.get('/api/dataRange', (_, res) => {
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
    const timeFrom = req.query.from + '';
    const timeTo = req.query.to + '';
    const findObj = getFindObj(timeFrom, timeTo, selectedSites);
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
    let data;
    // Still return nulls if selected sites are invalid
    if (findObj['cell_id'] != undefined) {
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

router.get('/api/sitesSummary', async (req, res) => {
  try {
    const timeFrom = req.query.from + '';
    const timeTo = req.query.to + '';
    let output:any = {};
    let measurementNum:any = {};
    let signalNum:any = {};
    let findObj:any = getFindObj(timeFrom, timeTo, '');
    console.log(findObj);
    const measurement = await MeasurementData.find(findObj).sort('timestamp');
    const signal = await SignalData.find(findObj).sort('timestamp');
    for (let site of sites) {
      output[site.name] = {
        ping: 0,
        download_speed: 0,
        upload_speed: 0,
        dbm: 0
      }
      measurementNum[site.name] = 0;
      signalNum[site.name] = 0;
    }
    for (let m of measurement) {
      let siteName = siteNameDict[m.cell_id];
      if (siteName != undefined && output[siteName] != undefined) {
        output[siteName].ping += m.ping;
        output[siteName].download_speed += m.download_speed;
        output[siteName].upload_speed += m.upload_speed;
        measurementNum[siteName] += 1;
      }
    }
    for (let s of signal) {
      let siteName = siteNameDict[s.cell_id];
      if (siteName != undefined && output[siteName] != undefined) {
        output[siteName].dbm += s.dbm;
        signalNum[siteName] += 1;
      }
    }
    for (let site of sites) {
      if (measurementNum[site.name] > 0) {
        output[site.name].ping /= measurementNum[site.name];
        output[site.name].download_speed /= measurementNum[site.name];
        output[site.name].upload_speed /= measurementNum[site.name];
      }
      if (signalNum[site.name] > 0) {
        output[site.name].dbm /= signalNum[site.name];
      }
    }
    res.send(output);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

router.get('/api/lineSummary', async (req, res) => {
  try {
    const mapType = req.query.mapType + '';
    const selectedSites = req.query.selectedSites + ''
    const timeFrom = req.query.from + '';
    const timeTo = req.query.to + '';
    const findObj = getFindObj(timeFrom, timeTo, selectedSites);
    // Send nothing if no sites
    let agg:any = {};
    if (findObj['cell_id'] == undefined) {
      res.status(200).send([]);
      return;
    }

    if (!isMapType(mapType)) {
      res.status(400).send('Invalid mapType: ' + mapType);
      console.error('Invalid mapType: ' + mapType);
      return;
    }
    let data;
    if (isMeasurementType(mapType)) {
      data = await MeasurementData.find(findObj).sort('timestamp');
      for (let m of data) {
        const siteName = siteNameDict[m.cell_id];
        if (siteName == undefined) {
          continue;
        }
        // console.log(new Date(new Date(m.timestamp).setSeconds(0)).toISOString())
        const time = new Date(new Date(m.timestamp).setSeconds(0)).toISOString();
        agg[siteName] = agg[siteName] ?? {};
        agg[siteName][time] = agg[siteName][time] ?? { sum: 0, count: 0 };
        agg[siteName][time].sum += m[mapType];
        agg[siteName][time].count += 1;
      }
    } else {
      data = await SignalData.find(findObj).sort('timestamp');
      for (let s of data) {
        const siteName = siteNameDict[s.cell_id];
        if (siteName == undefined) {
          continue;
        }
        const time = new Date(new Date(s.timestamp).setSeconds(0)).toISOString();
        agg[siteName] = agg[siteName] ?? {};
        agg[siteName][time] = agg[siteName][time] ?? { sum: 0, count: 0 };
        agg[siteName][time].sum += s.dbm;
        agg[siteName][time].count += 1;
      }
    }
    console.log(agg)
    const aggData = agg as { [site: string]: { [timestamp: string]: { sum: number; count: number } } };

    const avgData = Object.entries(aggData).map(([k, v]) => ({
      site: k,
      values: Object.entries(v).map(([date, { sum, count }]) => ({
        date,
        value: sum / count,
      })),
    }));

    avgData.forEach(a => a.values.sort((a, b) => (a.date < b.date ? -1 : 1)));

    res.send(avgData);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

function getFindObj(timeFrom?: string, timeTo?: string, selectedSites?: string) {
  const findObj:any = {}
  let cellList: string[] = []
  if (selectedSites != undefined && selectedSites != 'undefined') {
    for (let site of selectedSites.split(',')) {
      if (cellIdDict[site] != undefined) {
        cellList = cellList.concat(cellIdDict[site]);
      }
    }
    if (cellList.length > 0) {
      findObj['cell_id'] = {
        $in: cellList
      }
    }
  }
  if (timeFrom != 'undefined' || timeTo != 'undefined') {
    findObj['timestamp'] = {};
  }
  if (timeTo != 'undefined') {
    findObj['timestamp']['$lt'] = timeTo;
  }
  if (timeFrom != 'undefined') {
    findObj['timestamp']['$gte'] = timeFrom;
  }
  return findObj;
}

export { router as queryRouter }
