import BasicModel from "./basic_model";
import { Pool } from "pg";
import Skeleton from "./skeleton";

export interface Tag
{
   id: number;
   tag: string;
   count: number;
   updated_date: Date;
}

export interface TagDocument extends Tag
{
   pool: Pool;

   addPost(): Promise<void>;
   removePost(): Promise<void>;
   delete(): Promise<void>;
}

const tagSkeleton = new Skeleton<TagDocument>();

class TagModel extends BasicModel<TagDocument>
{
   props = [ "id", "tag", "count", "updated_date" ];

   constructor(pool: Pool)
   {
      super(pool, tagSkeleton);
   }

   async getAll(): Promise<Array<TagDocument>>
   {
      try
      {
         var res = await this.pool.query(`SELECT ${this.props.join(",")} FROM tags;`);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      let result: Array<TagDocument> = [];
      for(let i = 0; i < res.rowCount; ++i)
      {
         result.push(this.getDocument(res.rows[i]));
      }

      return result;
   }

   async search(tag: string): Promise<TagDocument>
   {
      try
      {
         var res = await this.pool.query(`SELECT ${this.props.join(",")} FROM tags WHERE tag = $1;`, [ tag ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return this.getDocument(res.rows[0]);
   }

   async create(tag: string): Promise<TagDocument>
   {
      try
      {
         var tagDoc = await this.search(tag);
         if(tagDoc != null)
         {
            return tagDoc;
         }

         await this.pool.query(`INSERT INTO tags (tag, count, updated_date) VALUES ($1, $2, $3);`, [ tag, 0, new Date() ]);

         tagDoc = await this.search(tag);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return tagDoc;
   }
}

tagSkeleton.methods.addPost = async function(this: TagDocument): Promise<void>
{
   try
   {
      await this.pool.query(`UPDATE tags SET count = count + 1 WHERE id = $1;`, [ this.id ]);
   }
   catch(err)
   {
      return Promise.reject(err);
   }

   this.count += 1;
}

tagSkeleton.methods.removePost = async function(this: TagDocument): Promise<void>
{
   if(this.count == 0) return;
   
   try
   {
      await this.pool.query(`UPDATE tags SET count = count - 1 WHERE id = $1;`, [ this.id ]);
   }
   catch(err)
   {
      return Promise.reject(err);
   }

   this.count -= 1;
}

tagSkeleton.methods.delete = async function(this: TagDocument): Promise<void>
{
   try
   {
      await this.pool.query(`DELETE FROM tags WHERE id = $1;`, [ this.id ]);
   }
   catch(err)
   {
      return Promise.reject(err);
   }
}

export default TagModel;