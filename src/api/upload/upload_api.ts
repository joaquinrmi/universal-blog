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
      try
      {
         var user = await req.model.user.searchByAliasOrEmail(req.session["alias"]);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      const imageKeeper = new ImageKeeper(user);
      try
      {
         var imgUrl = imageKeeper.saveImage(req.file.buffer);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      res.json({
         imgUrl
      })
   }
}

export default UploadAPI;