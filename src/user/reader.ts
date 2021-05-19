import BasicUser from "./user";
import { UserDocument } from "../model/user";
import Model from "../model";
import { Comment } from "../model/comment";
import ErrorCode from "./error_code";
import { Like } from "../model/like";

class Reader extends BasicUser
{
   constructor(document: UserDocument)
   {
      super(document);
   }

   async comment(model: Model, postId: string, comment: Comment): Promise<number>
   {
      try
      {
         var post = await model.post.searchById(postId, [ "id", "comment_count" ]);
         if(!post)
         {
            return Promise.reject(ErrorCode.PostNotFound);
         }

         var id = await model.comment.registerComment(comment, post);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return id;
   }

   async deleteOwnComment(model: Model, commentId: number): Promise<void>
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

   async like(model: Model, postId: string, like: Like): Promise<void>
   {
      try
      {
         var post = await model.post.searchById(postId, [ "id", "like_count" ]);
         if(!post)
         {
            return Promise.reject(ErrorCode.PostNotFound);
         }

         await model.like.registerLike(like, post);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
}

export default Reader;