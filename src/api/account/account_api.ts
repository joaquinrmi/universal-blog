import { Request, Response, NextFunction } from "express";
import Router from "../router/";
import RouteMap, { MethodType } from "../router/route_map";
import StatusCode from "../status_code";
import ErrorResponse from "../error_response";
import ErrorType from "./error";
import { User } from "../../model/user";
import useModel from "../use_model";

class AccountAPI extends Router
{
   constructor()
   {
      super([
         new RouteMap(MethodType.Post, "/create", "createAccount"),
         new RouteMap(MethodType.Delete, "/delete", "deleteAccount"),
         new RouteMap(MethodType.Post, "/login", "login"),
         new RouteMap(MethodType.Post, "/logout", "logout"),
         new RouteMap(MethodType.Post, "/restore-session", "restoreSession"),
      ]);

      this.registerFunction("createAccount", this.createAccount);
      this.registerFunction("deleteAccount", this.deleteAccount);
      this.registerFunction("login", this.login);
      this.registerFunction("logout", this.logout);
      this.registerFunction("restoreSession", this.restoreSession);

      this.useMiddleware(useModel);
      this.useMiddleware(this.checkSignupForm, [ "/create" ]);
      this.useMiddleware(this.restoreSessionMid, [ "/login", "/restore-session"]);
      this.useMiddleware(this.checkLoginForm, [ "/login" ]);
      this.useMiddleware(this.checkSession, [ "/delete", "/logout" ]);
      this.useMiddleware(this.checkDeleteForm, [ "/delete" ]);
   }

   private async createAccount(req: Request, res: Response): Promise<any>
   {
      try
      {
         if(!await req.model.user.checkAliasAvailability(req.signupForm.alias))
         {
            return res.status(StatusCode.Conflict).json(new ErrorResponse(ErrorType.AliasIsAlreadyUsed));
         }

         if(!await req.model.user.checkEmailAvailability(req.signupForm.email))
         {
            return res.status(StatusCode.Conflict).json(new ErrorResponse(ErrorType.EmailIsAlreadyUsed));
         }

         if(!await req.model.banishment.checkEmailAvailability(req.signupForm.email))
         {
            return res.status(StatusCode.Conflict).json(new ErrorResponse(ErrorType.EmailIsBanned));
         }
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      const user: User = {
         ...req.signupForm,
         rank: Number(process.env.DEFAULT_RANK),
         date_join: new Date()
      };

      try
      {
         await req.model.user.createUser(user);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      res.json({
         alias: user.alias
      });
   }

   private async deleteAccount(req: Request, res: Response): Promise<any>
   {
      try
      {
         var user = await req.model.user.searchByAliasOrEmail(req.session["alias"], [ "id" ]);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      try
      {
         await req.model.beginTransaction();
         await req.model.post.deleteAllUserPosts(req.model.like, req.model.comment, user);
         await req.model.like.deleteAllUserLikes(req.model.post, user);
         await req.model.comment.deleteAllUserComments(req.model.post, user);
         await req.model.user.deleteUser(user);
         await req.model.endTransaction();
      }
      catch(err)
      {
         await req.model.rollbackTransaction();

         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      req.session["alias"] = null;
      req.session.save();

      res.cookie("user", null);

      res.json({});
   }

   private async login(req: Request, res: Response): Promise<any>
   {
      try
      {
         var user = await req.model.user.searchByAliasOrEmail(req.loginForm.aliasOrEmail, [ "id", "banished", "email", "alias", "password", "session_keys" ]);

         if(!user || !user.checkPassword(req.loginForm.password))
         {
            return res.status(StatusCode.Conflict).json(new ErrorResponse(ErrorType.IncorrectUserOrPassword));
         }

         if(user.banished)
         {
            const banishment = await req.model.banishment.searchByEmail(user.email);

            return res.status(StatusCode.Unauthorized).json({
               what: "banned",
               date: banishment.date,
               reason: banishment.reason
            });
         }
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      try
      {
         var sessionKey = await user.registerSession();
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      req.session["alias"] = user.alias;
      req.session.save();

      res.cookie("user", {
         alias: user.alias,
         key: sessionKey
      }, {
         maxAge: 365 * 24 * 60 * 60 * 1000
      });

      res.json({
         alias: user.alias
      });
   }

   private async logout(req: Request, res: Response): Promise<any>
   {
      if(!req.cookies["user"] || !req.cookies["user"].key)
      {
         return res.json();
      }

      try
      {
         const user = await req.model.user.getUserByAliasOrEmail(req.session["alias"]);

         await user.document.eraseSession(req.cookies["user"].key);
      }
      catch(err)
      {
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      req.session["alias"] = null;
      req.session.save();

      res.cookie("user", null);

      res.json();
   }

   private async restoreSession(req: Request, res: Response): Promise<any>
   {
      res.status(StatusCode.NotFound).json(new ErrorResponse(ErrorType.SessionDoesNotExist));
   }

   private async checkSignupForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => {
         return res.status(StatusCode.BadRequest).json(new ErrorResponse(err));
      };

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.password != "string") return exit(ErrorType.InvalidForm);
      if(typeof req.body.name != "string") return exit(ErrorType.InvalidForm);
      if(typeof req.body.surname != "string") return exit(ErrorType.InvalidForm);
      if(typeof req.body.alias != "string") return exit(ErrorType.InvalidForm);
      if(typeof req.body.email != "string") return exit(ErrorType.InvalidForm);

      if(req.body.password.length < 8 || req.body.password.length > 32) return exit(ErrorType.InvalidPassword);
      if(req.body.name.length > 32) return exit(ErrorType.TooLongName);
      if(req.body.surname.length > 32) return exit(ErrorType.TooLongSurname);
      if(!(new RegExp("^([a-z]|[A-Z]|[0-9]|_){3,16}$")).test(req.body.alias)) return exit(ErrorType.InvalidAlias);

      req.signupForm = req.body;

      next();
   }

   private async checkLoginForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => {
         return res.status(StatusCode.BadRequest).json(new ErrorResponse(err));
      };

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.aliasOrEmail != "string") exit(ErrorType.InvalidForm);
      if(typeof req.body.password != "string") exit(ErrorType.InvalidForm);

      req.loginForm = req.body;

      next();
   }

   private async restoreSessionMid(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      if(!req.cookies["user"] || !req.cookies["user"].alias || !req.cookies["user"].key)
      {
         return next();
      }

      try
      {
         var user = await req.model.user.searchByAliasOrEmail(req.cookies["user"].alias.toString(), [ "alias", "session_keys" ]);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json(new ErrorResponse(ErrorType.InternalError));
      }

      if(!user)
      {
         return next();
      }

      if(!user.checkSession(req.cookies["user"].key.toString()))
      {
         return next();
      }

      req.session["alias"] = user.alias;
      req.session.save();

      res.cookie("user", {
         alias: user.alias,
         key: req.cookies["user"].key
      }, {
         maxAge: 365 * 24 * 60 * 60 * 1000
      });

      res.json({
         alias: user.alias
      });
   }

   private async checkDeleteForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => {
         return res.status(StatusCode.BadRequest).json(new ErrorResponse(err));
      };

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.password != "string") return exit(ErrorType.InvalidForm);

      req.deleteForm = req.body;

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

export default AccountAPI;