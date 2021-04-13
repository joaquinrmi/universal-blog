import { Request, Response, NextFunction } from "express";
import Router from "../router/";
import RouteMap, { MethodType } from "../router/route_map";
import StatusCode from "../status_code";
import ErrorResponse from "../error_response";
import Model from "../../model/";
import { Multer } from "multer";
import ErrorType from "./error";
import ImageKeeper from "../../image_keeper";

class UploadAPI extends Router
{
   model: Model;

   constructor(model: Model, upload: Multer)
   {
      super([
         new RouteMap(MethodType.Post, "/image", "uploadImage")
      ]);

      this.model = model;

      this.registerFunction("uploadImage", this.uploadImage);

      this.useMiddleware(this.checkSession, [ "/image" ]);
      this.useMiddleware(upload.single("image"), [ "/image" ]);
   }

   async uploadImage(req: Request, res: Response): Promise<any>
   {
      try
      {
         var user = await this.model.user.searchByAliasOrEmail(req.session["alias"]);
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

   private async checkSession(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      if(!req.session["alias"])
      {
         return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.SessionDoesNotExist));
      }

      next();
   }
}

export default UploadAPI;