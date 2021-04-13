import { Request, Response, NextFunction } from "express";
import Router from "../router/";
import RouteMap, { MethodType } from "../router/route_map";
import StatusCode from "../status_code";
import ErrorResponse from "../error_response";
import Model from "../../model/";
import { Post } from "../../model/post";
import ErrorType from "./error";

class PostAPI extends Router
{
   model: Model;

   constructor(model: Model)
   {
      super([
         new RouteMap(MethodType.Post, "/create", "createPost")
      ]);

      this.model = model;

      this.registerFunction("createPost", this.createPost);

      this.useMiddleware(this.checkSession, [ "/create" ]);
      this.useMiddleware(this.checkCreatePostForm, [ "/create"] );
   }

   private async createPost(req: Request, res: Response): Promise<any>
   {

   }

   private async checkCreatePostForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.title != "string") return exit(ErrorType.InvalidForm);
      if(Array.isArray(req.body.content))
      {
         for(let i = 0; i < req.body.content.length; ++i)
         {
            if(typeof req.body.content[i] != "string") return exit(ErrorType.InvalidForm);
         }
      }
      else return exit(ErrorType.InvalidForm);
      if(typeof req.body.cover != "string") return exit(ErrorType.InvalidForm);
      if(Array.isArray(req.body.gallery))
      {
         for(let i = 0; i < req.body.gallery.length; ++i)
         {
            if(typeof req.body.gallery[i] != "string") return exit(ErrorType.InvalidForm);
         }
      }
      else if(req.body.gallery) return exit(ErrorType.InvalidForm);
      if(Array.isArray(req.body.galleryPosition))
      {
         for(let i = 0; i < req.body.galleryPosition.length; ++i)
         {
            if(typeof req.body.galleryPosition[i] != "number") return exit(ErrorType.InvalidForm);
         }
      }
      else if(req.body.galleryPosition) return exit(ErrorType.InvalidForm);
      if(Array.isArray(req.body.tags))
      {
         for(let i = 0; i < req.body.tags.length; ++i)
         {
            if(typeof req.body.tags[i] != "string") return exit(ErrorType.InvalidForm);
         }
      }
      else if(req.body.tags) return exit(ErrorType.InvalidForm);

      req.postForm = req.body();
      if(!req.postForm.gallery) req.postForm.gallery = [];
      if(!req.postForm.galleryPosition) req.postForm.galleryPosition = [];
      if(!req.postForm.tags) req.postForm.tags = [];

      next();
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

export default PostAPI;