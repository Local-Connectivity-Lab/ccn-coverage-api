import mongoose from 'mongoose';
import { components } from '../types/schema';
import { AuxReportData } from './util';

type Measurement = components['schemas']['ConnectivityReportModel'];

interface IMeasurement extends Measurement, AuxReportData {}

interface MeasurementDoc
  extends mongoose.Document,
    Measurement,
    AuxReportData {}

interface MeasurementModelInterface extends mongoose.Model<MeasurementDoc> {
  build(attr: IMeasurement): MeasurementDoc;
  randomBuild(): MeasurementDoc;
}

const measurementSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    upload_speed: { type: Number, required: true },
    download_speed: { type: Number, required: true },
    ping: { type: Number, required: true },
    cell_id: { type: String, required: true },
    device_id: { type: String, required: true },
    device_type: { type: String, required: true },
    group: { type: String, required: false },
    mid: { type: String, required: false },
    show_data: { type: Boolean, required: false },
  },
  {
    versionKey: false,
  },
);

measurementSchema.statics.build = (attr: IMeasurement) => {
  // TODO: Add timestamp verification
  return new MeasurementData(attr);
};

const MeasurementData = mongoose.model<
  MeasurementDoc,
  MeasurementModelInterface
>('Measurement', measurementSchema);

export { MeasurementData, IMeasurement, MeasurementDoc };
