import BasicModel from "./basic_model";
import { Pool, PoolClient } from "pg";
import Skeleton from "./skeleton";
import PostModel, { PostDocument } from "./post";
import { UserDocument } from "./user";

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

   async deleteAllUserComments(postModel: PostModel, user: UserDocument): Promise<void>
   {
      if(!user.id)
      {
         return Promise.reject("property 'id' of 'user' is undefined");
      }

      const selectQuery = "SELECT post_id FROM comments WHERE author_id = $1;";

      try
      {
         if(this.client) var commentRes = await this.client.query(selectQuery, [ user.id ]);
         else var commentRes = await this.pool.query(selectQuery, [ user.id ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      const deleteQuery = "DELETE FROM comments WHERE author_id = $1;";

      if(this.client)
      {
         try
         {
            for(let i = 0; i < commentRes.rowCount; ++i)
            {
               let postRes = await postModel.searchById(commentRes.rows[i]["post_id"], [ "id", "comment_count"]);

               if(postRes) await postRes.removeComment(this.client);
            }

            await this.client.query(deleteQuery, [ user.id ]);
         }
         catch(err)
         {
            return Promise.reject(err);
         }

         return;
      }

      const client = await this.pool.connect();
      try
      {
         await client.query("BEGIN");

         for(let i = 0; i < commentRes.rowCount; ++i)
         {
            let postRes = await postModel.searchById(commentRes.rows[i]["post_id"], [ "id", "comment_count" ], client);

            if(postRes) await postRes.removeComment(client);
         }

         await client.query(deleteQuery, [ user.id ]);

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

   async deleteAllPostComments(postId: string, client?: PoolClient): Promise<void>
   {
      const query = "DELETE FROM comments WHERE post_id = $1;";

      try
      {
         if(client) await client.query(query, [ postId ]);
         else if(this.client) await this.client.query(query, [ postId ]);
         else await this.pool.query(query, [ postId ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
}

export default CommentModel;