import { Document, Model } from "mongoose";

export interface IPoint {
  latitude: float;
  longitude: float;
  timestamp: string;
  upload_speed: float;
  download_speed: float;
  data_since_last_report: Date;
  ping: float;
  site: string;
  device_id: number;
}

export interface IPointDocument extends IPoint, Document {}

export interface IPointModel extends Model<IUserDocument> {}