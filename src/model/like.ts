import BasicModel from "./basic_model";
import { Pool } from "pg";
import Skeleton from "./skeleton";
import { PostDocument } from "./post";

export interface Like
{
   author_id: number;
   post_id: string;
}

export interface LikeSchema extends Like
{
   id: number;
}

export interface LikeDocument extends Like
{
   pool: Pool;
}

const likeSkeleton = new Skeleton<LikeDocument>();

class LikeModel extends BasicModel<LikeDocument>
{
   constructor(pool: Pool)
   {
      super(pool, likeSkeleton);
   }

   async checkLike(like: Like): Promise<boolean>
   {
      try
      {
         var res = await this.pool.query("SELECT id FROM likes WHERE author_id = $1 AND post_id = $2;", [ like.author_id, like.post_id ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return res.rowCount > 0;
   }

   async registerLike(like: Like, post: PostDocument): Promise<void>
   {
      if(post.id != like.post_id)
      {
         return Promise.reject("argument 'post' is invalid");
      }

      if(await this.checkLike(like))
      {
         return;
      }

      const client = await this.pool.connect();
      try
      {
         await client.query("BEGIN");
         await client.query(`INSERT INTO likes (author_id, post_id) VALUES ($1, $2);`, [ like.author_id, like.post_id ]);
         await post.addLike(client);
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

export default LikeModel;