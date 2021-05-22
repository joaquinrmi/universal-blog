import Author from "./author";
import { UserDocument } from "../model/user";
import Model from "../model";
import ErrorCode from "./error_code";

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

   async banishUser(model: Model, aliasOrEmail: string, reason?: string): Promise<void>
   {
      try
      {
         const targetUser = await model.user.getUserByAliasOrEmail(aliasOrEmail);
         if(!targetUser)
         {
            return Promise.reject(ErrorCode.UserNotFound);
         }

         if(targetUser.document.rank >= this.document.rank)
         {
            return Promise.reject(ErrorCode.InsufficientPermissions);
         }

         await model.beginTransaction();
         await targetUser.document.banish();
         await model.banishment.registerBanished(this.document, targetUser.document.email, reason);
         await model.endTransaction();
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
}

export default Moderator;