import { Request, Response, NextFunction } from "express";
import ErrorResponse from "./error_response";
import StatusCode from "./status_code";

enum ErrorType
{
   SessionDoesNotExist = "session_does_not_exist",
   UserDoesNotExist = "user_does_not_exist"
}

async function checkSession(req: Request, res: Response, next: NextFunction): Promise<any>
{
   if(!req.session["alias"])
   {
      return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.SessionDoesNotExist));
   }

   try
   {
      req.user = await req.model.user.getUserByAliasOrEmail(req.session["alias"]);
      if(req.user == null)
      {
         return res.status(StatusCode.Conflict).json(new ErrorResponse(ErrorType.UserDoesNotExist));
      }

      if(req.user.document.banished)
      {
         const banishment = await req.model.banishment.searchByEmail(req.user.document.email);

         return res.status(StatusCode.Unauthorized).json({
            what: "banned",
            date: banishment.date.getTime(),
            reason: banishment.reason
         });
      }
   }
   catch(err)
   {
      return res.status(StatusCode.InternalServerError).json();
   }

   next();
}

export default checkSession;