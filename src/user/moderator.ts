import Author from "./author";
import { UserDocument } from "../model/user";
import Model from "../model";

class Moderator extends Author
{
   constructor(document: UserDocument)
   {
      super(document);
   }

   async deleteOnePost(model: Model, postId: string): Promise<void>
   {
      try
      {
         await model.post.deletePostById(model.like, model.comment, postId);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
}

export default Moderator;