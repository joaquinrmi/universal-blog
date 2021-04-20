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

   async deleteOneComment(model: Model, commentId: number): Promise<void>
   {
      try
      {
         var comment = await model.comment.searchById(commentId, [ "post_id" ]);
         var post = await model.post.searchById(comment.post_id, [ "id", "comment_count" ]);

         await model.beginTransaction();
         await model.comment.deleteById(commentId);
         await post.removeComment();
         await model.endTransaction();
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
}

export default Moderator;