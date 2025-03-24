// import mongoose from 'mongoose';
// import { paths, components } from '../types/schema';

// type Measurement = components['schemas']['ConnectivityReportModel'];

// interface IMeasurement {
//   latitude: number
//   longitude: number
//   timestamp: string
//   upload_speed: number
//   download_speed: number
//   ping: number
//   cell_id: string
//   device_id: string
//   device_type: string
//   group?: string
//   mid?: string
//   show_data?: boolean
// }

// interface MeasurementModelInterface extends mongoose.Model<MeasurementDoc> {
//   build(attr: IMeasurement): MeasurementDoc
//   randomBuild(): MeasurementDoc
// }

// interface MeasurementDoc extends mongoose.Document {
//   latitude: number
//   longitude: number
//   timestamp: string
//   upload_speed: number
//   download_speed: number
//   ping: number
//   cell_id: string
//   device_id: string
//   device_type: string
//   group?: string
//   mid?: string
//   show_data?: boolean
// }

// const measurementSchema = new mongoose.Schema({
//   latitude:               { type: Number, required: true },
//   longitude:              { type: Number, required: true },
//   timestamp:              { type: Date,   required: true },
//   upload_speed:           { type: Number, required: true },
//   download_speed:         { type: Number, required: true },
//   ping:                   { type: Number, required: true },
//   cell_id:                { type: String, required: true },
//   device_id:              { type: String, required: true },
//   device_type:              { type: String, required: true },
//   group:              { type: String, required: false },
//   mid:              { type: String, required: false },
//   show_data:              { type: Boolean, required: false },
// }, {
//   versionKey: false
// })

// measurementSchema.statics.build = (attr: IMeasurement) => {
//   // TODO: Add timestamp verification
//   return new MeasurementData(attr);
// }

// const MeasurementData = mongoose.model<MeasurementDoc, MeasurementModelInterface>('Measurement', measurementSchema)

// export { MeasurementData, IMeasurement, MeasurementDoc }

// /*
// {
//     "measurement": {
//         "latitude": string
//         "longitude": string
//         "timestamp": string
//         "upload_speed": double
//         "download_speed": double
//         "ping": double
//         "cell_id": ""
//         "device_id": UUID string (hashed, base64)
//     } => (in bytes),
//     "sig_message": byte[],
//     "pk": hashed pk
// }
// */