import { Request, Response, NextFunction } from "express";
import Router from "../router/";
import RouteMap, { MethodType } from "../router/route_map";
import StatusCode from "../status_code";
import ErrorResponse from "../error_response";
import { Multer } from "multer";
import ErrorType from "./error";
import ImageKeeper from "../../image_keeper";
import useModel from "../use_model";
import checkSession from "../check_session";

class UploadAPI extends Router
{
   constructor(upload: Multer)
   {
      super([
         new RouteMap(MethodType.Post, "/image", "uploadImage")
      ]);

      this.registerFunction("uploadImage", this.uploadImage);

      this.useMiddleware(useModel);
      this.useMiddleware(checkSession, [ "/image" ]);
      this.useMiddleware(upload.single("image"), [ "/image" ]);
   }

   async uploadImage(req: Request, res: Response): Promise<any>
   {
      const imageKeeper = new ImageKeeper(req.user.document);
      try
      {
         var imgUrl = await imageKeeper.saveImage(req.file.buffer);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json();
      }

      res.status(StatusCode.Created).json({
         imgUrl
      });
   }
}

export default UploadAPI;