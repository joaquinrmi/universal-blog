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
}

const tagSkeleton = new Skeleton<TagDocument>();

class TagModel extends BasicModel<TagDocument>
{
   props: [ "id", "tag", "count", "updated_date" ];

   constructor(pool: Pool)
   {
      super(pool, tagSkeleton);
   }

   async search(tag: string): Promise<TagDocument>
   {
      try
      {
         var res = await this.pool.query(`SELECT FROM tags WHERE tag = $1;`, [ tag ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return this.getDocument(res.rows[0]);
   }
}

export default TagModel;