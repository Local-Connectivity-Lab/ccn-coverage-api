import { components } from '../types/schema';

type DataRange = components['schemas']['DataRangeResponse'];

type Datum = {
  latitude: number;
  longitude: number;
};

// function pushDatum(data: Datum[], lat: number?, lng: number?) {
//   if (lat != undefined && lng != undefined) {
//     data.push({ latitude: lat, longitude: lng})
//   }
// }

// TODO: Add more precise data range without comsuming too much computational power
export default function getDataRange(data: Datum[]): DataRange {
  let minLat = data[0].latitude ?? 0;
  let maxLat = data[0].latitude ?? 0;
  let minLon = data[0].longitude ?? 0;
  let maxLon = data[0].longitude ?? 0;
  for (let x of data) {
    minLat = Math.min(minLat, x.latitude);
    maxLat = Math.max(maxLat, x.latitude);
    minLon = Math.min(minLon, x.longitude);
    maxLon = Math.max(maxLon, x.longitude);
  }
  const center: [number, number] = [
    (minLat + maxLat) / 2,
    (minLon + maxLon) / 2,
  ];

  return { center, minLat, minLon, maxLat, maxLon };
}
