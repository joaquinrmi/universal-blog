import { Request, Response, NextFunction } from "express";
import Router from "../router/";
import RouteMap, { MethodType } from "../router/route_map";
import StatusCode from "../status_code";
import ErrorResponse from "../error_response";
import ErrorType from "./error";
import useModel from "../use_model";
import UserErrorCode from "../../user/error_code";
import checkSession from "../check_session";
import BanishmentListQuery from "../../model/banishment_list_query";

class UserAPI extends Router
{
   constructor()
   {
      super([
         new RouteMap(MethodType.Post, "/promote", "promoteUser"),
         new RouteMap(MethodType.Put, "/banish", "banishUser"),
         new RouteMap(MethodType.Put, "/remove-banishment", "removeBanishment"),
         new RouteMap(MethodType.Get, "/banishment-list", "banishmentList")
      ]);

      this.registerFunction("promoteUser", this.promoteUser);
      this.registerFunction("banishUser", this.banishUser);
      this.registerFunction("removeBanishment", this.removeBanishment);
      this.registerFunction("banishmentList", this.banishmentList);

      this.useMiddleware(useModel);
      this.useMiddleware(checkSession, [ "/promoteUser", "/banish", "/remove-banishment", "/banishment-list" ]);
      this.useMiddleware(this.checkPromoteForm, [ "/promote" ]);
      this.useMiddleware(this.checkBanishmentForm, [ "/banish" ]);
      this.useMiddleware(this.checkRemoveBanishmentForm, [ "/remove-banishment" ]);
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
         return res.status(StatusCode.InternalServerError).json();
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

         default:
            console.error(err);
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      res.status(StatusCode.OK).json();
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
            return res.status(StatusCode.Conflict).json(new ErrorResponse(ErrorType.UserDoesNotExist));

         default:
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      res.status(StatusCode.OK).json();
   }

   private async removeBanishment(req: Request, res: Response): Promise<any>
   {
      try
      {
         const user = await req.model.user.getUserByAliasOrEmail(req.session["alias"]);

         await user.removeBanishment(req.model, req.removeBanishmentForm.email);
      }
      catch(err)
      {
         switch(err)
         {
         case UserErrorCode.InsufficientPermissions:
            return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.InsufficientPermissions));

         case UserErrorCode.UserNotFound:
            return res.status(StatusCode.Conflict).json(new ErrorResponse(ErrorType.UserDoesNotExist));

         default:
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      res.status(StatusCode.OK).json();
   }

   private async banishmentList(req: Request, res: Response): Promise<any>
   {
      if(!req.query.offset || !req.query.count)
      {
         return res.status(StatusCode.BadRequest).json(new ErrorResponse(ErrorType.InvalidQuery));
      }

      let searchQuery: BanishmentListQuery = {
         count: Number(req.query.count),
         offset: Number(req.query.offset),
         orderType: "date",
         order: "desc"
      };

      if(req.query.judgeId)
      {
         searchQuery.judgeId = Number(req.query.judgeId);
      }

      try
      {
         var banishments = await req.model.banishment.search(searchQuery);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json();
      }

      res.status(StatusCode.OK).json(banishments);
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

   private async checkRemoveBanishmentForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.email != "string") return exit(ErrorType.InvalidForm);

      req.removeBanishmentForm = req.body;

      next();
   }
}

export default UserAPI;