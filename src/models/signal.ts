import mongoose from 'mongoose';
import { components } from 'schema';
import { AuxReportData } from './util';

type SignalStrength = components['schemas']['SignalStrengthReportModel'];

interface ISignal extends SignalStrength, AuxReportData {}
interface SignalDoc extends mongoose.Document, SignalStrength, AuxReportData {}

interface SignalModelInterface extends mongoose.Model<SignalDoc> {
  build(attr: ISignal): SignalDoc
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