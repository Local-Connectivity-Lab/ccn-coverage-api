import mongoose from 'mongoose';
import sites from './sites.json';

interface ISignal {
  latitude: string
  longitude: string
  timestamp: string
  dBm: number
  level_code: number
  cell_id: number
  device_id: string
}

interface SignalModelInterface extends mongoose.Model<SignalDoc> {
  build(attr: ISignal): SignalDoc
}

interface SignalDoc extends mongoose.Document {
  latitude: number
  longitude: number
  timestamp: string
  dBm: number
  level_code: number
  cell_id: string
  device_id: string
}

const signalSchema = new mongoose.Schema({
  latitude:   { type: Number, required: true },
  longitude:  { type: Number, required: true },
  timestamp:  { type: Date,   required: true },
  dBm:        { type: Number, required: true },
  level_code: { type: Number, required: true },
  cell_id:    { type: String, required: true },
  device_id:  { type: String, required: true },
}, {
  versionKey: false
})

signalSchema.statics.build = (attr: ISignal) => {
  // TODO: Add throttling if the number of requests is high
  return new SignalData(attr);
}

const SignalData = mongoose.model<SignalDoc, SignalModelInterface>('Signal', signalSchema)

export { SignalData, ISignal }
