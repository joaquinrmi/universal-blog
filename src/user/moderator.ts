import Author from "./author";
import { UserDocument } from "../model/user";

class Moderator extends Author
{
   constructor(document: UserDocument)
   {
      super(document);
   }
}

export default Moderator;