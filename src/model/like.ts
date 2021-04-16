import BasicModel from "./basic_model";
import { Pool, PoolClient } from "pg";
import Skeleton from "./skeleton";
import PostModel, { PostDocument } from "./post";
import { UserDocument } from "./user";

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

   async deleteAllUserLikes(postModel: PostModel, user: UserDocument): Promise<void>
   {
      if(!user.id)
      {
         return Promise.reject("property 'id' of 'user' is undefined");
      }

      const selectQuery = "SELECT post_id FROM likes WHERE author_id = $1;";

      try
      {
         if(this.client) var likeRes = await this.client.query(selectQuery, [ user.id ]);
         else var likeRes = await this.pool.query(selectQuery, [ user.id ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      const deleteQuery = "DELETE FROM likes WHERE author_id = $1;";

      if(this.client)
      {
         try
         {
            for(let i = 0; i < likeRes.rowCount; ++i)
            {
               let postRes = await postModel.searchById(likeRes.rows[i]["post_id"], [ "id", "like_count"]);

               if(postRes) await postRes.removeLike(this.client);
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

         for(let i = 0; i < likeRes.rowCount; ++i)
         {
            let postRes = await postModel.searchById(likeRes.rows[i]["post_id"], [ "id", "like_count" ], client);

            if(postRes) await postRes.removeLike(client);
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

   async deleteAllPostLikes(post: PostDocument, client?: PoolClient): Promise<void>
   {
      const query = "DELETE FROM likes WHERE post_id = $1";

      try
      {
         if(client) await client.query(query, [ post.id ]);
         else if(this.client) await this.client.query(query, [ post.id ]);
         else await this.pool.query(query, [ post.id ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
}

export default LikeModel;