import Model from "../model";
import { UserDocument } from "../model/user";
import ErrorCode from "./error_code";
import { Post } from "../model/post";
import { Comment } from "../model/comment";
import { Like } from "../model/like";

class BasicUser
{
   document: UserDocument;

   constructor(document: UserDocument)
   {
      this.document = document;
   }

   async changePassword(model: Model, currentPassword: string, newPassword: string): Promise<void>
   {}

   async createPost(model: Model, postData: Post): Promise<string>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }

   async deletePost(model: Model, postId: string): Promise<void>
   {
      try
      {
         var post = await model.post.searchById(postId, [ "author_id" ]);
         if(!post)
         {
            return Promise.reject(ErrorCode.PostNotFound);
         }

         if(post.author_id == this.document.id)
         {
            await this.deleteOwnPost(model, postId);
         }
         else await this.deleteOnePost(model, postId);
      }
      catch(err)
      {
         return Promise.reject(err)
      }
   }

   protected async deleteOwnPost(model: Model, postId: string): Promise<void>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }

   protected async deleteOnePost(model: Model, postId: string): Promise<void>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }

   async comment(model: Model, postId: string, comment: Comment): Promise<void>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }

   async deleteComment(model: Model, commentId: number): Promise<void>
   {
      try
      {
         var comment = await model.comment.searchById(commentId, [ "author_id" ]);
         if(!comment)
         {
            return Promise.reject(ErrorCode.CommentNotFound);
         }

         if(comment.author_id == this.document.id)
         {
            await this.deleteOwnComment(model, commentId);
         }
         else await this.deleteOneComment(model, commentId);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }

   protected async deleteOwnComment(model: Model, commentId: number): Promise<void>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }

   protected async deleteOneComment(model: Model, commentId: number): Promise<void>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }

   async like(model: Model, postId: string, like: Like): Promise<void>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }

   async promoteUser(model: Model, aliasOrEmail: string, rank: string): Promise<void>
   {
      return Promise.reject(ErrorCode.InsufficientPermissions);
   }
}

export default BasicUser;