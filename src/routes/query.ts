import express, { Response } from 'express';
import * as Crypto from 'crypto';
import { JSDOM } from 'jsdom';
import { SignalData, SignalDoc } from '../models/signal';
import { MeasurementData, MeasurementDoc } from '../models/measurement';
import fs from 'fs';
import getDataRange from '../utils/get-data-range';
import isValidMapType from '../utils/is-map-type';
import logger from '../logger';
import path from 'path';
import { components } from '../types/schema';

type Site = components['schemas']['Site'];
type QueryData = components['schemas']['QueryData'];
type LineSummaryItem = components['schemas']['LineSummaryItem'];
type SitesSummary = components['schemas']['SitesSummary'];
type MarkerData = components['schemas']['MarkerData'];

const modelJsonPath = path.join(__dirname + '/../models/sites.json');
const defaultModelJsonPath = path.join(
  __dirname + '/../models/default_sites.json',
);

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
  if (fs.existsSync(modelJsonPath)) {
    return JSON.parse(fs.readFileSync(modelJsonPath).toString());
  } else {
    fs.copyFile(defaultModelJsonPath, modelJsonPath, res => {
      logger.debug('update sites from default');
    });
    return JSON.parse(fs.readFileSync(defaultModelJsonPath).toString());
  }
}

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
    const mapType =
      typeof req.query.mapType === 'string' ? req.query.mapType : '';
    const timeFrom = req.query.timeFrom + '';
    const timeTo = req.query.timeTo + '';
    const findObj = getFindObj(timeFrom, timeTo, selectedSites);
    findObj['show_data'] = true;

    if (!(Array.isArray(dataRange.center) && dataRange.center.length === 2)) {
      logger.error('Invalid dataRange.center: ' + dataRange.center);
      res.status(400).send('[/api/data]: Invalid dataRange center format');
      return;
    }

    if (!isValidMapType(mapType)) {
      logger.error(`[/api/data]: Invalid mapType received: ${mapType}`);
      res.status(400).send(`Invalid mapType: ${mapType}`);
      return;
    }

    const map = L.map(dom.window.document.createElement('div')).setView(
      dataRange.center as [number, number],
      zoom,
    );

    const callback = (dat: Map<number, Array<number>>) => {
      let result = Array<QueryData>();
      for (const [key, value] of dat.entries()) {
        result.push({ bin: key, average: average(value).toFixed(2) });
      }
      res.send(result);
    };

    // Still return nulls if selected sites are invalid
    if (findObj['cell_id'] !== undefined) {
      switch (mapType) {
        case 'dbm':
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
            })
            .catch(err => {
              if (err) {
                logger.error(err);
                res.status(400).send(err);
                return;
              }
            });
          break;
        case 'download_speed':
        case 'ping':
        case 'upload_speed':
          MeasurementData.find(findObj)
            .sort('timestamp')
            .exec()
            .then(data => {
              const dat = new Map<number, Array<number>>();
              data.forEach(d => {
                const { x, y } = map.project([d.latitude, d.longitude], zoom);
                const value: number =
                  d[mapType as 'ping' | 'upload_speed' | 'download_speed'];
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
            })
            .catch(err => {
              if (err) {
                logger.error(err);
                res.status(400).send(err);
                return;
              }
            });
          break;
        default:
          logger.error('[/api/data]: Unknown map type ' + mapType);
          res.status(400).send('Unknown map type ' + mapType);
          return;
      }
    } else {
      callback(new Map<number, Array<number>>());
    }
  } catch (error) {
    logger.error(error);
    res.status(400).send(error);
  }
});

router.get('/api/sitesSummary', (req, res) => {
  try {
    const timeFrom = req.query.timeFrom + '';
    const timeTo = req.query.timeTo + '';
    let output: SitesSummary = {};
    let measurementNum: Record<string, number> = {};
    let signalNum: Record<string, number> = {};
    let findObj: any = getFindObj(timeFrom, timeTo, '');
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
    logger.error(error);
    res.status(400).send(error);
  }
});

router.get('/api/lineSummary', (req, res) => {
  type AggregatedData = {
    [site: string]: { [timestamp: string]: { sum: number; count: number } };
  };

  try {
    const mapType =
      typeof req.query.mapType === 'string' ? req.query.mapType : '';
    const selectedSites = req.query.selectedSites + '';
    const timeFrom = req.query.timeFrom + '';
    const timeTo = req.query.timeTo + '';
    const findObj = getFindObj(timeFrom, timeTo, selectedSites);
    // Send nothing if no sites
    let agg: AggregatedData = {};
    if (findObj['cell_id'] == undefined) {
      res.status(200).send([]);
      return;
    }

    if (!isValidMapType(mapType)) {
      res.status(400).send('[/api/lineSummary]: Invalid mapType: ' + mapType);
      logger.error('Invalid mapType: ' + mapType);
      return;
    }
    const aggCallback = (aggData: AggregatedData) => {
      const avgData: Array<LineSummaryItem> = Object.entries(aggData).map(
        ([k, v]) => ({
          site: k,
          values: Object.entries(v).map(([date, { sum, count }]) => ({
            date,
            value: sum / count,
          })),
        }),
      );

      avgData.forEach(a => a.values.sort((a, b) => (a.date < b.date ? -1 : 1)));

      res.send(avgData);
    };

    switch (mapType) {
      case 'dbm':
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
              logger.error(err);
              res.status(400).send(err);
              return;
            }
          });
        break;
      case 'download_speed':
      case 'ping':
      case 'upload_speed':
        MeasurementData.find(findObj)
          .sort('timestamp')
          .exec()
          .then(data => {
            for (let m of data) {
              const siteName = siteNameDict[m.cell_id];
              if (siteName == undefined) {
                continue;
              }
              const time = new Date(
                new Date(m.timestamp).setSeconds(0),
              ).toISOString();
              agg[siteName] = agg[siteName] ?? {};
              agg[siteName][time] = agg[siteName][time] ?? { sum: 0, count: 0 };
              agg[siteName][time].sum +=
                m[mapType as 'ping' | 'upload_speed' | 'download_speed'];
              agg[siteName][time].count += 1;
            }
            aggCallback(agg);
            return;
          })
          .catch(err => {
            if (err) {
              logger.error(err);
              res.status(400).send(err);
              return;
            }
          });
        break;
      default:
        logger.error('[/api/lineSummary]: Unknown map type ' + mapType);
        res.status(400).send('Unknown map type ' + mapType);
    }
  } catch (error) {
    logger.error(error);
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
      const data: MarkerData[] = [];
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
      res.send(data);
    });
  } catch (error) {
    logger.error(error);
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
