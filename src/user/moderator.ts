import Author from "./author";
import { UserDocument } from "../model/user";
import Model from "../model";
import ErrorCode from "./error_code";
import { PostDocument, Post } from "../model/post";

class Moderator extends Author
{
   constructor(document: UserDocument)
   {
      super(document);
   }

   async editOnePost(model: Model, post: PostDocument, postData: Post): Promise<void>
   {
      try
      {
         await this.editPostStandar(post, postData);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }

   async deleteOnePost(model: Model, postId: string): Promise<void>
   {
      try
      {
         await model.beginTransaction();
         const post = await model.post.searchById(postId);
         for(let i = 0; i < post.tags.length; ++i)
         {
            const tagDoc = await model.tag.search(post.tags[i]);
            await tagDoc.removePost();
            if(tagDoc.count == 0)
            {
               await tagDoc.delete();
            }
         }
         await model.post.deletePostById(model.like, model.comment, postId);
         await model.endTransaction();
      }
      catch(err)
      {
         await model.rollbackTransaction();
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
         const targetUser = await model.user.searchByAliasOrEmail(aliasOrEmail);
         if(!targetUser)
         {
            return Promise.reject(ErrorCode.UserNotFound);
         }

         await model.user.deleteAllUserSessionKeys(targetUser);

         if(targetUser.rank >= this.document.rank)
         {
            return Promise.reject(ErrorCode.InsufficientPermissions);
         }

         await model.beginTransaction();
         await targetUser.banish();
         await model.banishment.registerBanished(this.document, targetUser.email, reason);
         await model.endTransaction();
      }
      catch(err)
      {
         await model.rollbackTransaction();
         return Promise.reject(err);
      }
   }

   async removeBanishment(model: Model, email: string): Promise<void>
   {
      try
      {
         const banishment = await model.banishment.searchByEmail(email);
         if(banishment == null)
         {
            return Promise.reject(ErrorCode.UserNotFound);
         }

         const judge = await model.user.searchById(banishment.judge);
         if(judge)
         {
            if(judge.rank > this.document.rank)
            {
               return Promise.reject(ErrorCode.InsufficientPermissions);
            }
         }

         const targetUser = await model.user.searchByAliasOrEmail(email);

         await model.beginTransaction();
         if(targetUser) await targetUser.breakBanishment();
         await model.banishment.removeBanishment(email);
         await model.endTransaction();
      }
      catch(err)
      {
         await model.rollbackTransaction();
         return Promise.reject(err);
      }
   }
}

export default Moderator;