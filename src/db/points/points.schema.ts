import { Schema } from "mongoose";

const PointSchema = new Schema({
  latitude: float;
  longitude: float;
  timestamp: string;
  upload_speed: float;
  download_speed: float;
  data_since_last_report: Date;
  ping: float;
  site: string;
  device_id: number;
});

export default PointSchema;