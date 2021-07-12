import { DocumentDefinition, FilterQuery } from "mongoose";
import Point, { PointDocument } from "../model/point.model";

export async function createPoint(input: DocumentDefinition<PointDocument>) {
  try {
    return await Point.create(input);
  } catch (error) {
    throw new Error(error);
  }
}