import Reader from "./reader";
import { UserDocument } from "../model/user";
import Model from "../model";
import { Post } from "../model/post";
import ErrorCode from "./error_code";

class Author extends Reader
{
   constructor(document: UserDocument)
   {
      super(document);
   }

   async createPost(model: Model, postData: Post): Promise<string>
   {
      try
      {
         var postId = await model.post.createPost(this.document, postData);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
      
      return postId;
   }

   async deleteOwnPost(model: Model, postId: string): Promise<void>
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
};

export default Author;