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
         await model.beginTransaction();
         var postId = await model.post.createPost(this.document, postData);
         for(let i = 0; i < postData.tags.length; ++i)
         {
            const tagDoc = await model.tag.create(postData.tags[i]);
            await tagDoc.addPost();
         }
         await model.endTransaction();
      }
      catch(err)
      {
         await model.rollbackTransaction();
         return Promise.reject(err);
      }
      
      return postId;
   }

   async deleteOwnPost(model: Model, postId: string): Promise<void>
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
};

export default Author;