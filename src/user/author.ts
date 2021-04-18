import Reader from "./reader";
import { UserDocument } from "../model/user";

class Author extends Reader
{
   constructor(document: UserDocument)
   {
      super(document);
   }
};

export default Author;