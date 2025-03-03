import express, { Request, Response } from 'express';
import * as Crypto from 'crypto';
import { JSDOM } from 'jsdom';
import { ISignal, SignalData, SignalDoc } from '../../models/signal';
import {
  IMeasurement,
  MeasurementData,
  MeasurementDoc,
} from '../../models/measurement';
import fs from 'fs';
import getDataRange from '../utils/get-data-range';
import isMapType from '../utils/is-map-type';
import isMeasurementType from '../utils/is-measurement-type';

const router = express.Router();
const dom = new JSDOM('');
global.window = dom.window as any;
global.document = dom.window.document;

Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: true,
});

import * as L from 'leaflet';

export { router as dataRouter };

// Prepare site information
type SiteStatus = 'active' | 'confirmed' | 'in-conversation';
type Site = {
  name: string;
  latitude: number;
  longitude: number;
  status: SiteStatus;
  address: string;
  cell_id?: string[];
};

// Helper functions
const average = (numbers: number[]) => sum(numbers) / numbers.length;
const sum = (numbers: number[]) =>
  numbers.reduce((total, aNumber) => total + aNumber, 0);

var sites: Site[] = updateSite();

const cellIdDict: { [name: string]: string[] } = {};
const siteNameDict: { [name: string]: string } = {};
for (let site of sites) {
  if (site.cell_id != undefined) {
    cellIdDict[site.name] = site.cell_id;
    for (let cellId of site.cell_id) {
      siteNameDict[cellId] = site.name;
    }
  }
}

// Prepare data ranges
console;
const dataRange = getDataRange(sites);

function updateSite() {
  if (fs.existsSync('models/sites.json')) {
    return JSON.parse(fs.readFileSync('models/sites.json').toString());
  } else {
    fs.copyFile('models/sites-default.json', 'models/sites.json', res => {
      console.log('update sites from default');
    });
    return JSON.parse(fs.readFileSync('models/sites-default.json').toString());
  }
}
router.get('/api/sites', (_, res: Response) => {
  sites = updateSite();
  res.send(sites);
});

router.get('/api/dataRange', (_, res) => {
  res.send(dataRange);
});

router.get('/api/data', (req, res) => {
  try {
    const width = Number.parseInt(req.query.width + '');
    const height = Number.parseInt(req.query.height + '');
    const top = Number.parseInt(req.query.top + '');
    const left = Number.parseInt(req.query.left + '');
    const binSizeShift = Number.parseInt(req.query.binSizeShift + '');
    const zoom = Number.parseInt(req.query.zoom + '');
    const selectedSites = req.query.selectedSites + '';
    const mapType = req.query.mapType + '';
    const timeFrom = req.query.timeFrom + '';
    const timeTo = req.query.timeTo + '';
    const findObj = getFindObj(timeFrom, timeTo, selectedSites);
    findObj['show_data'] = true;
    const map = L.map(dom.window.document.createElement('div')).setView(
      dataRange.center,
      zoom,
    );
    if (!isMapType(mapType)) {
      res.status(400).send('Invalid mapType: ' + mapType);
      console.error('Invalid mapType: ' + mapType);
      return;
    }
    const callback = (dat: Map<number, Array<number>>) => {
      let result = [];
      for (const [key, value] of dat.entries()) {
        result.push([key, average(value).toFixed(2)]);
      }
      res.send(result);
    };
    // Still return nulls if selected sites are invalid
    if (findObj['cell_id'] != undefined) {
      if (isMeasurementType(mapType)) {
        MeasurementData.find(findObj)
          .sort('timestamp')
          .exec()
          .then(data => {
            const dat = new Map<number, Array<number>>();
            data.forEach(d => {
              const { x, y } = map.project([d.latitude, d.longitude], zoom);
              const value: number = d[mapType];
              const index =
                ((x - left) >> binSizeShift) * height +
                ((y - top) >> binSizeShift);
              if (!dat.has(index)) {
                dat.set(index, new Array());
              }
              var ar = dat.get(index);
              if (ar !== undefined) {
                ar.push(value);
              }
            });
            callback(dat);
            return;
          })
          .catch(err => {
            if (err) {
              console.error(err);
              res.status(400).send(err);
              return;
            }
          });
      } else {
        SignalData.find(findObj)
          .sort('timestamp')
          .exec()
          .then(data => {
            const dat = new Map<number, Array<number>>();
            data.forEach(d => {
              const { x, y } = map.project([d.latitude, d.longitude], zoom);
              const value: number = d['dbm'];
              const index =
                ((x - left) >> binSizeShift) * height +
                ((y - top) >> binSizeShift);
              if (!dat.has(index)) {
                dat.set(index, new Array());
              }
              var ar = dat.get(index);
              if (ar !== undefined) {
                ar.push(value);
              }
            });
            callback(dat);
            return;
          })
          .catch(err => {
            if (err) {
              console.error(err);
              res.status(400).send(err);
              return;
            }
          });
      }
    } else {
      callback(new Map<number, Array<number>>());
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

router.get('/api/sitesSummary', (req, res) => {
  try {
    const timeFrom = req.query.timeFrom + '';
    const timeTo = req.query.timeTo + '';
    let output: any = {};
    let measurementNum: any = {};
    let signalNum: any = {};
    let findObj: any = getFindObj(timeFrom, timeTo, '');
    // console.log(findObj);
    const measurementPromise = MeasurementData.find(findObj)
      .sort('timestamp')
      .exec();
    const signalPromise = SignalData.find(findObj).sort('timestamp').exec();
    Promise.all([measurementPromise, signalPromise]).then(values => {
      const measurement = values[0];
      const signal = values[1];
      for (let site of sites) {
        output[site.name] = {
          ping: 0,
          download_speed: 0,
          upload_speed: 0,
          dbm: 0,
        };
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
    });
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

router.get('/api/lineSummary', (req, res) => {
  try {
    const mapType = req.query.mapType + '';
    const selectedSites = req.query.selectedSites + '';
    const timeFrom = req.query.timeFrom + '';
    const timeTo = req.query.timeTo + '';
    const findObj = getFindObj(timeFrom, timeTo, selectedSites);
    // Send nothing if no sites
    let agg: any = {};
    if (findObj['cell_id'] == undefined) {
      res.status(200).send([]);
      return;
    }
    if (!isMapType(mapType)) {
      res.status(400).send('Invalid mapType: ' + mapType);
      console.error('Invalid mapType: ' + mapType);
      return;
    }
    const aggCallback = (agg: any) => {
      const aggData = agg as {
        [site: string]: { [timestamp: string]: { sum: number; count: number } };
      };

      const avgData = Object.entries(aggData).map(([k, v]) => ({
        site: k,
        values: Object.entries(v).map(([date, { sum, count }]) => ({
          date,
          value: sum / count,
        })),
      }));

      avgData.forEach(a => a.values.sort((a, b) => (a.date < b.date ? -1 : 1)));

      res.send(avgData);
    };
    if (isMeasurementType(mapType)) {
      MeasurementData.find(findObj)
        .sort('timestamp')
        .exec()
        .then(data => {
          for (let m of data) {
            const siteName = siteNameDict[m.cell_id];
            if (siteName == undefined) {
              continue;
            }
            // console.log(new Date(new Date(m.timestamp).setSeconds(0)).toISOString())
            const time = new Date(
              new Date(m.timestamp).setSeconds(0),
            ).toISOString();
            agg[siteName] = agg[siteName] ?? {};
            agg[siteName][time] = agg[siteName][time] ?? { sum: 0, count: 0 };
            agg[siteName][time].sum += m[mapType];
            agg[siteName][time].count += 1;
          }
          aggCallback(agg);
          return;
        })
        .catch(err => {
          if (err) {
            console.error(err);
            res.status(400).send(err);
            return;
          }
        });
    } else {
      SignalData.find(findObj)
        .sort('timestamp')
        .exec()
        .then(data => {
          for (let s of data) {
            const siteName = siteNameDict[s.cell_id];
            if (siteName == undefined) {
              continue;
            }
            const time = new Date(
              new Date(s.timestamp).setSeconds(0),
            ).toISOString();
            agg[siteName] = agg[siteName] ?? {};
            agg[siteName][time] = agg[siteName][time] ?? { sum: 0, count: 0 };
            agg[siteName][time].sum += s.dbm;
            agg[siteName][time].count += 1;
          }
          aggCallback(agg);
          return;
        })
        .catch(err => {
          if (err) {
            console.error(err);
            res.status(400).send(err);
            return;
          }
        });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

router.get('/api/markers', (req, res) => {
  try {
    const selectedSites = req.query.sites + '';
    const selectedDevices = req.query.devices + '';
    const timeFrom = req.query.timeFrom + '';
    const timeTo = req.query.timeTo + '';
    const findObj = getFindObj(
      timeFrom,
      timeTo,
      selectedSites,
      selectedDevices,
    );
    findObj['show_data'] = true;
    const signalPromise = SignalData.find(findObj).exec();
    const measurementPromise = MeasurementData.find(findObj).exec();
    Promise.all([signalPromise, measurementPromise]).then(values => {
      const signal: SignalDoc[] = values[0];
      const measurement: MeasurementDoc[] = values[1];
      const lookup = new Map<string, number>();
      const data: any = [];
      signal.forEach((row: SignalDoc) => {
        if (row.mid) {
          lookup.set(row.mid, row.dbm);
        }
      });
      measurement.forEach((row: MeasurementDoc) => {
        if (row.mid) {
          data.push({
            latitude: row.latitude,
            longitude: row.longitude,
            device_id: row.device_id,
            site: siteNameDict[row.cell_id],
            dbm: lookup.get(row.mid),
            upload_speed: row.upload_speed,
            download_speed: row.download_speed,
            ping: row.ping,
            mid: row.mid,
          });
        } else {
          data.push({
            latitude: row.latitude,
            longitude: row.longitude,
            device_id: row.device_id,
            site: siteNameDict[row.cell_id],
            upload_speed: row.upload_speed,
            download_speed: row.download_speed,
            ping: row.ping,
            mid: Crypto.randomBytes(16).toString('hex'),
          });
        }
      });
      // console.log(data);
      return res.send(data);
    });
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

function getFindObj(
  timeFrom?: string,
  timeTo?: string,
  selectedSites?: string,
  selectedDevices?: string,
) {
  const findObj: any = {};
  let cellList: string[] = [];
  if (selectedSites != undefined && selectedSites != 'undefined') {
    for (let site of selectedSites.split(',')) {
      if (cellIdDict[site] != undefined) {
        cellList = cellList.concat(cellIdDict[site]);
      }
    }
    if (cellList.length > 0) {
      findObj['cell_id'] = {
        $in: cellList,
      };
    }
  }
  if (timeFrom !== 'undefined' || timeTo !== 'undefined') {
    findObj['timestamp'] = {};
  }
  if (timeTo !== 'undefined') {
    findObj['timestamp']['$lt'] = timeTo;
  }
  if (timeFrom !== 'undefined') {
    findObj['timestamp']['$gte'] = timeFrom;
  }
  let deviceList: string[] = [];
  if (selectedDevices != undefined && selectedDevices != 'undefined') {
    if (selectedDevices === '') {
      findObj['device_type'] = {
        $in: '',
      };
    } else {
      findObj['device_type'] = {
        $in: selectedDevices.split(','),
      };
    }
  }
  return findObj;
}

export { router as queryRouter };
