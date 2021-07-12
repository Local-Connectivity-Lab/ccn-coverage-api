import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

export interface DataDocument extends mongoose.Document {
  latitude: float;
  longitude: float;
  timestamp: datetime;
  upload_speed: float;
  download_speed: float;
}

const dataSchema = new mongoose.Schema(
  {

  },
  { timestamps: true }
);


const Data = mongoose.model<DataDocument>("User", dataSchema);

export default User;