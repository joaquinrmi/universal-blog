import Moderator from "./moderator";
import { UserDocument } from "../model/user";
import Model from "../model";
import UserErrorCode from "./error_code";

class Admin extends Moderator
{
   constructor(document: UserDocument)
   {
      super(document);
   }

   async promoteUser(model: Model, aliasOrEmail: string, rank: string): Promise<void>
   {
      try
      {
         var user = await model.user.searchByAliasOrEmail(aliasOrEmail, [ "id", "rank" ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      if(!user)
      {
         return Promise.reject(UserErrorCode.UserNotFound);
      }

      let newRank: number;
      switch(rank)
      {
      case "reader": newRank = 0; break;
      case "author": newRank = 1; break;
      case "moderator": newRank = 2; break;
      case "admin": newRank = 3; break;
      default: return Promise.reject(UserErrorCode.InvalidRank);
      }

      try
      {
         await user.changeRank(newRank);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
};

export default Admin;