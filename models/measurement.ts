import mongoose from 'mongoose';
import sites from './sites.json';

interface IMeasurement {
  latitude: number
  longitude: number
  timestamp: string
  upload_speed: number
  download_speed: number
  data_since_last_report: number
  ping: number
  cell_id: string
  device_id: string
}

interface MeasurementModelInterface extends mongoose.Model<MeasurementDoc> {
  build(attr: IMeasurement): MeasurementDoc
  randomBuild(): MeasurementDoc
}

interface MeasurementDoc extends mongoose.Document {
  latitude: number
  longitude: number
  timestamp: string
  upload_speed: number
  download_speed: number
  ping: number
  data_since_last_report: number
  cell_id: string
  device_id: string
}

const measurementSchema = new mongoose.Schema({
  latitude:               { type: Number, required: true },
  longitude:              { type: Number, required: true },
  timestamp:              { type: Date,   required: true },
  upload_speed:           { type: Number, required: true },
  download_speed:         { type: Number, required: true },
  data_since_last_report: { type: Number, required: true },
  ping:                   { type: Number, required: true },
  cell_id:                { type: String, required: true },
  device_id:              { type: String, required: true },
}, {
  versionKey: false
})

measurementSchema.statics.build = (attr: IMeasurement) => {
  // TODO: Add timestamp verification
  return new MeasurementData(attr);
}

measurementSchema.statics.randomBuild = () => {
  const randSiteId = Math.floor(Math.random() * sites.length)
  const androidID = [...Array(15)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return new MeasurementData({
    latitude: 47.45 + Math.random() * 0.3,
    longitude: -122.42 + Math.random() * 0.2,
    timestamp: (new Date(new Date(2021, 0, 1).getTime() + Math.random() * (new Date(2021, 6, 1).getTime() - new Date(2021, 0, 1).getTime()))).toISOString(),
    upload_speed: Math.random() * 10,
    download_speed: Math.random() * 10,
    data_since_last_report: Math.random() * 1000,
    ping: Math.random() * 160,
    cell_id: sites[randSiteId].name,
    device_id: androidID
  });
}

const MeasurementData = mongoose.model<MeasurementDoc, MeasurementModelInterface>('Measurement', measurementSchema)

export { MeasurementData, IMeasurement, MeasurementDoc }

/*
{
    "measurement": {
        "latitude": string
        "longitude": string
        "timestamp": string
        "upload_speed": double
        "download_speed": double
        "ping": double
        "cell_id": ""
        "device_id": UUID string (hashed, base64)
    } => (in bytes),
    "sig_message": byte[],
    "pk": hashed pk
}
*/