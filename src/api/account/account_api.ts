import { Request, Response, NextFunction } from "express";
import Router from "../router/";
import RouteMap, { MethodType } from "../router/route_map";
import StatusCode from "../status_code";
import ErrorResponse from "../error_response";
import ErrorType from "./error";

class AccountAPI extends Router
{
   constructor()
   {
      super([
         new RouteMap(MethodType.Post, "/create", "createAccount")
      ]);

      this.registerFunction("createAccount", this.createAccount);

      this.useMiddleware(this.checkSignupForm, ["/create"]);
   }

   private async createAccount(req: Request, res: Response): Promise<any>
   {}

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
}

export default AccountAPI;