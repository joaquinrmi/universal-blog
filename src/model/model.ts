import { Pool, PoolClient } from "pg";
import UserModel from "./user";
import PostModel from "./post";
import CommentModel from "./comment";
import LikeModel from "./like";
import BanishmentModel from "./banishment";
import TagModel from "./tag";

const pool = new Pool();

class Model
{
   private pool: Pool;
   private client: PoolClient;
   user: UserModel;
   post: PostModel;
   comment: CommentModel;
   like: LikeModel;
   banishment: BanishmentModel;
   tag: TagModel;

   constructor()
   {
      this.pool = pool;
      this.user = new UserModel(this.pool);
      this.post = new PostModel(this.pool);
      this.comment = new CommentModel(this.pool);
      this.like = new LikeModel(this.pool);
      this.banishment = new BanishmentModel(this.pool);
      this.tag = new TagModel(this.pool);
   }

   async createTables(): Promise<void>
   {
      try
      {
         await this.pool.query(`CREATE TABLE users
         (
            id serial PRIMARY KEY,
            banished boolean DEFAULT FALSE,
            password varchar(88) NOT NULL,
            name varchar(32),
            surname varchar(32),
            alias varchar(16) UNIQUE NOT NULL,
            email varchar(255) UNIQUE NOT NULL,
            rank int,
            date_join date,
            session_keys varchar(8)[] DEFAULT ARRAY[]::VARCHAR(8)[]
         );`);

         await this.pool.query(`CREATE TABLE posts
         (
            id text PRIMARY KEY,
            author_id int references users(id),
            title varchar(128) NOT NULL,
            content text[] NOT NULL,
            cover text NOT NULL,
            gallery text[] DEFAULT ARRAY[]::TEXT[],
            gallery_position int[] DEFAULT ARRAY[]::INT[],
            tags varchar(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
            comment_count int DEFAULT 0,
            like_count int DEFAULT 0,
            date_created timestamp
         );`);

         await this.pool.query(`CREATE TABLE comments
         (
            id serial PRIMARY KEY,
            author_id int references users(id),
            post_id text references posts(id),
            content text[] NOT NULL,
            date_created timestamp
         );`);

         await this.pool.query(`CREATE TABLE likes
         (
            id serial PRIMARY KEY,
            author_id int references users(id),
            post_id text references posts(id)
         );`);

         await this.pool.query(`CREATE TABLE banishments
         (
            email varchar(255) PRIMARY KEY,
            reason text,
            date timestamp NOT NULL,
            judge int references users(id)
         );`);

         await this.pool.query(`CREATE TABLE tags
         (
            id serial PRIMARY KEY,
            tag text UNIQUE NOT NULL,
            count int NOT NULL,
            updated_date timestamp NOT NULL
         );`);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }

   async beginTransaction(): Promise<void>
   {
      this.client = await this.pool.connect();
      this.user.setClient(this.client);
      this.post.setClient(this.client);
      this.comment.setClient(this.client);
      this.like.setClient(this.client);
      this.banishment.setClient(this.client);
      this.tag.setClient(this.client);
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
      this.banishment.setClient(null);
      this.tag.setClient(this.client);
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
      this.banishment.setClient(null);
      this.tag.setClient(this.client);
   }
}

export default Model;