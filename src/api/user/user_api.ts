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
         new RouteMap(MethodType.Post, "/promote", "promoteUser"),
         new RouteMap(MethodType.Put, "/banish", "banishUser")
      ]);

      this.registerFunction("promoteUser", this.promoteUser);
      this.registerFunction("banishUser", this.banishUser);

      this.useMiddleware(useModel);
      this.useMiddleware(this.checkSession, [ "/promoteUser", "/banish" ]);
      this.useMiddleware(this.checkPromoteForm, [ "/promote" ]);
      this.useMiddleware(this.checkBanishmentForm, [ "/banish" ]);
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

   async banishUser(req: Request, res: Response): Promise<any>
   {
      try
      {
         const user = await req.model.user.getUserByAliasOrEmail(req.session["alias"]);

         await user.banishUser(req.model, req.banishmentForm.aliasOrEmail, req.banishmentForm.reason);
      }
      catch(err)
      {
         switch(err)
         {
         case UserErrorCode.InsufficientPermissions:
            return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.InsufficientPermissions));

         case UserErrorCode.UserNotFound:
            return res.status(StatusCode.Conflict).json(new ErrorResponse(`user with alias or email "${req.banishmentForm.aliasOrEmail}" does not exist`));

         default:
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      res.status(StatusCode.OK).json();
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

   private async checkBanishmentForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.aliasOrEmail != "string") return exit(ErrorType.InvalidForm);
      if(req.body.reason && typeof req.body.reason != "string") return exit(ErrorType.InvalidForm);

      req.banishmentForm = req.body;

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