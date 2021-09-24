import mongoose from 'mongoose';
import sites from './sites.json';

interface ISite {
  name: string
  latitude: number
  longitude: number
  status: string
  address: string
}

interface IData {
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

interface IQuery {
  lat_max?: number
  lat_min?: number
  lng_max?: number
  lng_min?: number
  timestamp_from?: string
  timestamp_to?: string
  upload_speed_min?: number
  upload_speed_max?: number
  download_speed_min?: number
  download_speed_max?: number
  data_since_last_report_min?: number
  data_since_last_report_max?: number
  ping_min?: number
  ping_max?: number
  cell_id?: string
  device_id?: string
}

interface IAggregate {
  left: number
  top: number
  width: number
  height: number
  selected_sites: string
  map_type: string
}

function isIAggregate(x: any): x is IAggregate {
  return 'left' in x && 'top' in x && 'width' in x && 'height' in x && 'selected_sites' in x && 'map_type' in x
}

interface DataModelInterface extends mongoose.Model<DataDoc> {
  build(attr: IData): DataDoc
  randomBuild(): DataDoc
}

interface DataDoc extends mongoose.Document {
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

const dataSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  upload_speed: {
    type: Number,
    required: true
  },
  download_speed: {
    type: Number,
    required: true
  },
  data_since_last_report: {
    type: Number,
    required: true
  },
  ping: {
    type: Number,
    required: true
  },
  cell_id: {
    type: String,
    required: true
  },
  device_id: {
    type: String,
    required: true
  }
}, {
  versionKey: false
})


dataSchema.statics.build = (attr: IData) => {
  // TODO: Add timestamp verification
  return new Data(attr);
}

dataSchema.statics.randomBuild = () => {
  const randSiteId = Math.floor(Math.random() * sites.length)
  const androidID = [...Array(15)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return new Data({
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

const Data = mongoose.model<DataDoc, DataModelInterface>('Data', dataSchema)

export { Data, IData , IQuery, IAggregate, isIAggregate }

/*
Sample IData
{
  "latitude": 47.551642902162804,
  "longitude": -122.28339617848889,
  "timestamp": "2021-03-08T12:55:26.350403+00:00",
  "upload_speed": 980392.1568627451,
  "download_speed": 4901960.784313725,
  "data_since_last_report": 4732548294.36119,
  "ping": 971.32,
  "cell_id": "Filipino Community Center",
  "device_id": "00000000-910b-e6c1-0000-000046c1fa63"
}
*/

/*
Sample IRequest
{
  "lat_min": 47.551642902162804,
  "lat_max": 48.28339617848889,
  "lng_min": -10.551642902162804,
  "lng_max": -6.28339617848889,
  "timestamp_min": "2021-03-08T12:55:26.350403+00:00",
  "timestamp_max": "2021-04-08T12:55:26.350403+00:00",
  "upload_speed_min": 980392.1568627451,
  "download_speed_min": 4901960.784313725,
  "data_since_last_report_max": 4732548294.36119,
  "ping_max": 971.32,
  "cell_id": "Filipino Community Center",
}
*/