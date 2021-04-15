import BasicModel from "./basic_model";
import { Pool } from "pg";
import Skeleton from "./skeleton";
import { PostDocument } from "./post";

export interface Comment
{
   author_id: number;
   post_id: string;
   content: Array<string>;
   date_created: Date;
}

export interface CommentSchema extends Comment
{
   id: number;
}

export interface CommentDocument extends CommentSchema
{
   pool: Pool;
}

const commentSkeleton = new Skeleton<CommentDocument>();

class CommentModel extends BasicModel<CommentDocument>
{
   constructor(pool: Pool)
   {
      super(pool, commentSkeleton);
   }

   async registerComment(comment: Comment, post: PostDocument): Promise<void>
   {
      if(post.id != comment.post_id)
      {
         return Promise.reject("argument 'post' is invalid");
      }

      const client = await this.pool.connect();
      try
      {
         await client.query("BEGIN");
         await client.query(`INSERT INTO comments (author_id, post_id, content, date_created) VALUES ($1, $2, $3, $4);`, [ comment.author_id, comment.post_id, comment.content, comment.date_created ]);
         await post.addComment(client);
         await client.query("COMMIT");
      }
      catch(err)
      {
         await client.query("ROLLBACK");
         return Promise.reject(err);
      }
      finally
      {
         client.release();
      }
   }
}

export default CommentModel;