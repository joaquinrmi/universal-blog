import BasicUser from "./user";
import { UserDocument } from "../model/user";

class Reader extends BasicUser
{
   constructor(document: UserDocument)
   {
      super(document);
   }
}

export default Reader;