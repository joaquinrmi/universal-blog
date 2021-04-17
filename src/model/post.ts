import { Pool, PoolClient } from "pg";
import { encrypt } from "../encryption";
import Skeleton from "./skeleton";
import BasicModel from "./basic_model";
import { UserDocument } from "./user";
import BasicQuery from "./basic_query";
import LikeModel from "./like";
import CommentModel from "./comment";

export interface Post
{
   title: string;
   content: string;
   cover: string;
   gallery: Array<string>;
   gallery_position: Array<number>;
   tags: Array<string>;
   comment_count: number;
   like_count: number;
   date_created: Date;
}

export interface PostSchema extends Post
{
   id: string;
   author_id: number;
}

export interface PostDocument extends PostSchema
{
   pool: Pool;

   addComment(client?: PoolClient): Promise<void>;
   addLike(client?: PoolClient): Promise<void>;
   removeLike(client?: PoolClient): Promise<void>;
   removeComment(client?: PoolClient): Promise<void>;
}

const postSkeleton = new Skeleton<PostDocument>();

export interface SearchPostQuery extends BasicQuery
{
   author: number;
   tags: Array<string>;
}

class PostModel extends BasicModel<PostDocument>
{
   private props = [ "id", "author_id", "title", "content", "cover", "gallery", "gallery_position", "tags", "comment_count", "like_count", "date_created" ];

   constructor(pool: Pool)
   {
      super(pool, postSkeleton);
   }

   async createPost(user: UserDocument, post: Post): Promise<string>
   {
      try
      {
         var postFound = await this.searchOneByTitle(post.title, user, [ "id" ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      if(postFound)
      {
         return null;
      }

      const id = encrypt(`${user.alias}-${post.title}`, process.env.TITLE_ENCRYPT_SECRET);
      try
      {
         await this.pool.query("INSERT INTO posts (id, author_id, title, content, cover, gallery, gallery_position, tags, comment_count, like_count, date_created) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);", [ id, user.id, post.title, post.content, post.cover, post.gallery, post.gallery_position, post.tags, 0, 0, post.date_created ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return id;
   }

   async search(query: SearchPostQuery, props?: Array<string>): Promise<Array<PostDocument>>
   {
      if(!props) props = this.props;

      const where = query.author || query.tags.length > 0;
      const whereClause = where ? `WHERE ${query.author ? `author_id = ${query.author}` : ""} ${query.tags.length > 0 ? query.tags.map(value => `'${value}' = ANY(tags)`).join(" AND ") : ""}` : "";

      const orderByClause = `ORDER BY ${query.orderType} ${query.order}`;

      const dbQuery = `SELECT ${props.join(",")} FROM posts ${whereClause} ${orderByClause} LIMIT $1 OFFSET $2`;

      const queryValues = [ query.count, query.offset ];

      try
      {
         var res = await this.pool.query(dbQuery, queryValues);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      const posts = new Array<PostDocument>(res.rowCount);
      for(let i = 0; i < res.rowCount; ++i)
      {
         posts[i] = this.getDocument(res.rows[i]);
      }

      return posts;
   }

   async searchById(id: string, props?: Array<string>, client?: PoolClient): Promise<PostDocument>
   {
      if(!props) props = this.props;

      let query = `SELECT ${props.join(",")} FROM posts WHERE id = $1`;

      try
      {
         if(client) var res = await client.query(query, [ id ]);
         else var res = await this.pool.query(query, [ id ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return this.getDocument(res.rows[0]);
   }

   async searchOneByTitle(title: string, user?: UserDocument, props?: Array<string>): Promise<PostDocument>
   {
      if(!props) props = this.props;

      try
      {
         var res = await this.pool.query(`SELECT ${props.join(",")} FROM posts WHERE title = $1${user ? ` AND author_id = $2` : ""};`, [ title, user ? user.id : undefined ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return this.getDocument(res.rows[0]);
   }

   async deletePostById(likeModel: LikeModel, commentModel: CommentModel, postId: string, client?: PoolClient): Promise<void>
   {
      const deleteQuery = "DELETE FROM posts WHERE id = $1;";

      try
      {
         if(client)
         {
            await likeModel.deleteAllPostLikes(postId, client);
            await commentModel.deleteAllPostComments(postId, client);
            await client.query(deleteQuery, [ postId ]);
         }
         else if(this.client)
         {
            await likeModel.deleteAllPostLikes(postId);
            await commentModel.deleteAllPostComments(postId);
            await this.client.query(deleteQuery, [ postId ]);
         }
         else
         {
            await likeModel.deleteAllPostLikes(postId);
            await commentModel.deleteAllPostComments(postId);
            await this.pool.query(deleteQuery, [ postId ]);
         }
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }

   async deleteAllUserPosts(likeModel: LikeModel, commentModel: CommentModel, user: UserDocument): Promise<void>
   {
      if(!user.id)
      {
         return Promise.reject("property 'id' of 'user' is undefined");
      }

      const selectQuery = "SELECT id FROM posts WHERE author_id = $1;";

      try
      {
         if(this.client) var postRes = await this.client.query(selectQuery, [ user.id ]);
         else var postRes = await this.pool.query(selectQuery, [ user.id ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      const deleteQuery = "DELETE FROM posts WHERE author_id = $1";

      if(this.client)
      {
         try
         {
            for(let i = 0; i < postRes.rowCount; ++i)
            {
               const post = postRes.rows[i];

               await likeModel.deleteAllPostLikes(post.id);
               await commentModel.deleteAllPostComments(post.id);
            }

            await this.client.query(deleteQuery, [ user.id ]);
         }
         catch(err)
         {
            return Promise.reject(err);
         }
      }

      const client = await this.pool.connect();
      try
      {
         await client.query("BEGIN");

         for(let i = 0; i < postRes.rowCount; ++i)
         {
            const post = postRes.rows[i]

            await likeModel.deleteAllPostLikes(post.id, client);
            await commentModel.deleteAllPostComments(post.id, client);
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
}

postSkeleton.methods.addComment = async function(this: PostDocument, client?: PoolClient): Promise<void>
{
   if(!this.id)
   {
      return Promise.reject("field 'id' is undefined");
   }

   if(this.comment_count === undefined)
   {
      return Promise.reject("field 'comment_count' is undefined");
   }

   const query = `UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`;
   const queryVals = [ this.id ];

   try
   {
      if(client) await client.query(query, queryVals);
      else await this.pool.query(query, queryVals);
   }
   catch(err)
   {
      return Promise.reject(err);
   }
   ++this.comment_count;
}

postSkeleton.methods.addLike = async function(this: PostDocument, client?: PoolClient): Promise<void>
{
   if(!this.id)
   {
      return Promise.reject("field 'id' is undefined");
   }

   if(this.like_count === undefined)
   {
      return Promise.reject("field 'like_count' is undefined");
   }

   const query = `UPDATE posts SET like_count = like_count + 1 WHERE id = $1`;
   const queryVals = [ this.id ];

   try
   {
      if(client) await client.query(query, queryVals);
      else await this.pool.query(query, queryVals);
   }
   catch(err)
   {
      return Promise.reject(err);
   }
   ++this.like_count;
}

postSkeleton.methods.removeLike = async function(this: PostDocument, client?: PoolClient): Promise<void>
{
   if(!this.id)
   {
      return Promise.reject("field 'id' is undefined");
   }

   if(this.like_count === undefined)
   {
      return Promise.reject("field 'like_count' is undefined");
   }

   const query = `UPDATE posts SET like_count = like_count - 1 WHERE id = $1`;
   const queryVals = [ this.id ];

   try
   {
      if(client) await client.query(query, queryVals);
      else await this.pool.query(query, queryVals);
   }
   catch(err)
   {
      return Promise.reject(err);
   }
   --this.like_count;
}

postSkeleton.methods.removeComment = async function(this: PostDocument, client?: PoolClient): Promise<void>
{
   if(!this.id)
   {
      return Promise.reject("field 'id' is undefined");
   }

   if(this.comment_count === undefined)
   {
      return Promise.reject("field 'comment_count' is undefined");
   }

   const query = `UPDATE posts SET comment_count = comment_count - 1 WHERE id = $1`;
   const queryVals = [ this.id ];

   try
   {
      if(client) await client.query(query, queryVals);
      else await this.pool.query(query, queryVals);
   }
   catch(err)
   {
      return Promise.reject(err);
   }
   --this.comment_count;
}

export default PostModel;