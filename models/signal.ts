import mongoose from 'mongoose';
import { paths, components } from 'schema';

type SignalStrengthReportModel = components['schemas']['SignalStrengthReportModel'];


interface ISignal {
  latitude: string
  longitude: string
  timestamp: string
  dbm: number
  level_code: number
  cell_id: number
  device_id: string
  device_type: string
  group?: string
  mid?: string
  show_data?: boolean
}

interface SignalModelInterface extends mongoose.Model<SignalDoc> {
  build(attr: ISignal): SignalDoc
}

interface SignalDoc extends mongoose.Document {
  latitude: number
  longitude: number
  timestamp: string
  dbm: number
  level_code: number
  cell_id: string
  device_id: string
  device_type: string
  group?: string
  mid?: string
  show_data?: boolean
}

const signalSchema = new mongoose.Schema({
  latitude:   { type: Number, required: true },
  longitude:  { type: Number, required: true },
  timestamp:  { type: Date,   required: true },
  dbm:        { type: Number, required: true },
  level_code: { type: Number, required: true },
  cell_id:    { type: String, required: true },
  device_id:  { type: String, required: true },
  device_type:  { type: String, required: true },
  group:  { type: String, required: false },
  mid:  { type: String, required: false },
  show_data:  { type: Boolean, required: false },
}, {
  versionKey: false
})

signalSchema.statics.build = (attr: ISignal) => {
  // TODO: Add throttling if the number of requests is high
  return new SignalData(attr);
}

const SignalData = mongoose.model<SignalDoc, SignalModelInterface>('Signal', signalSchema)

export { SignalData, ISignal, SignalDoc }
