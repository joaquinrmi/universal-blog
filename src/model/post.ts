import { Pool } from "pg";
import { encrypt } from "../encryption";
import Skeleton from "./skeleton";
import BasicModel from "./basic_model";
import { UserDocument } from "./user";
import BasicQuery from "./basic_query";

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
   id: number;
   author_id: number;
}

export interface PostDocument extends PostSchema
{
   pool: Pool;
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

   async searchById(id: string, props?: Array<string>): Promise<PostDocument>
   {
      if(!props) props = this.props;

      try
      {
         var res = await this.pool.query(`SELECT ${props.join(",")} FROM posts WHERE id = $1`, [ id ]);
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
}

export default PostModel;