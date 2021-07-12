import { Request, Response } from "express";
import { omit } from "lodash";
import { addPoints } from "../service/user.service";
import log from "../logger";

export async function addPointsHandler(req: Request, res: Response) {
  try {
    const point = await addPoints(req.body);
    return res.send(point.toJSON());
  } catch (e) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}
