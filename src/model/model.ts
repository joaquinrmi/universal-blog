import { Pool, PoolClient } from "pg";
import UserModel from "./user";
import PostModel from "./post";
import CommentModel from "./comment";
import LikeModel from "./like";

const pool = new Pool();

class Model
{
   private pool: Pool;
   private client: PoolClient;
   user: UserModel;
   post: PostModel;
   comment: CommentModel;
   like: LikeModel;

   constructor()
   {
      this.pool = pool;
      this.user = new UserModel(this.pool);
      this.post = new PostModel(this.pool);
      this.comment = new CommentModel(this.pool);
      this.like = new LikeModel(this.pool);
   }

   async beginTransaction(): Promise<void>
   {
      this.client = await this.pool.connect();
      this.user.setClient(this.client);
      this.post.setClient(this.client);
      this.comment.setClient(this.client);
      this.like.setClient(this.client);
   }

   async endTransaction(): Promise<void>
   {
      await this.client.query("COMMIT");
      this.client.release();
      this.client = null;
      this.user.setClient(null);
      this.post.setClient(null);
      this.comment.setClient(null);
      this.like.setClient(null);
   }

   async rollbackTransaction(): Promise<void>
   {
      if(!this.client) return;
      
      await this.client.query("ROLLBACK");
      this.client.release();
      this.client = null;
      this.user.setClient(null);
      this.post.setClient(null);
      this.comment.setClient(null);
      this.like.setClient(null);
   }
}

export default Model;