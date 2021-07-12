import { model } from "mongoose";
import { IPointDocument } from "./users.types";
import PointSchema from "./points.schema";

export const pointModel = model<IPointDocument>("point", PointSchema);