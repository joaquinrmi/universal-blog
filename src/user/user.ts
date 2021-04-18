import Model from "../model";
import { UserDocument } from "../model/user";
import ErrorCode from "./error_code";

class BasicUser
{
   document: UserDocument;

   constructor(document: UserDocument)
   {
      this.document = document;
   }

   async changePassword(model: Model, currentPassword: string, newPassword: string): Promise<void>
   {}

   async promoteUser(model: Model, aliasOrEmail: string, rank: string): Promise<void>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }
}

export default BasicUser;