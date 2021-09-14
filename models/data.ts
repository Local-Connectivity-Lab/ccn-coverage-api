import mongoose from 'mongoose';

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

interface DataModelInterface extends mongoose.Model<DataDoc> {
  build(attr: IData): any
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
    type: String,
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

const Data = mongoose.model<DataDoc, DataModelInterface>('Data', dataSchema)

export { Data, IData , IQuery }

/*
Sample Data
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
