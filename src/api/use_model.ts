import { Request, Response, NextFunction } from "express";
import Model from "../model";

async function useModel(req: Request, res: Response, next: NextFunction): Promise<void>
{
   req.model = new Model();

   next();
}

export default useModel;