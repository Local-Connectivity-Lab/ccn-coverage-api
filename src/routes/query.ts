import express, {Request, Response} from 'express'
import fs from 'fs';
import getDataRange from '../utils/get-data-range';

const router = express.Router()

export { router as dataRouter }

// Prepare site information
const sites: Site[] = JSON.parse(
  fs.readFileSync('../../models/sites.json').toString(),
);

// Prepare data ranges
const dataRange = getDataRange([...data, ...sites]);

router.get('/api/sites', async (_, res: Response) => {
  res.send(sites);
});

router.get('/dataRange', (_, res) => {
  res.send(dataRange);
});
