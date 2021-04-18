import { Request, Response, NextFunction } from "express";
import Router from "../router/";
import RouteMap, { MethodType } from "../router/route_map";
import StatusCode from "../status_code";
import ErrorResponse from "../error_response";
import ErrorType from "./error";
import useModel from "../use_model";
import UserErrorCode from "../../user/error_code";

class UserAPI extends Router
{
   constructor()
   {
      super([
         new RouteMap(MethodType.Post, "/promote", "promoteUser")
      ]);

      this.registerFunction("promoteUser", this.promoteUser);

      this.useMiddleware(useModel);
      this.useMiddleware(this.checkSession, [ "/promoteUser" ]);
      this.useMiddleware(this.checkPromoteForm, [ "/promote" ]);
   }

   async promoteUser(req: Request, res: Response): Promise<any>
   {
      try
      {
         var user = await req.model.user.getUserByAliasOrEmail(req.session["session"]);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      try
      {
         await user.promoteUser(req.model, req.promoteForm.aliasOrEmail, req.promoteForm.rank);
      }
      catch(err)
      {
         switch(err)
         {
         case UserErrorCode.InvalidRank:
            return res.status(StatusCode.BadRequest).json(new ErrorResponse(ErrorType.InvalidForm));
            
         case UserErrorCode.InsufficientPermissions:
            return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.InsufficientPermissions));

         case UserErrorCode.UserNotFound:
            return res.status(StatusCode.NotFound).json(new ErrorResponse(ErrorType.UserDoesNotExist));
         }

         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      res.json({});
   }

   private async checkPromoteForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.aliasOrEmail != "string") return exit(ErrorType.InvalidForm);
      if(typeof req.body.rank != "string") return exit(ErrorType.InvalidForm);

      req.promoteForm = req.body;

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

export default UserAPI;