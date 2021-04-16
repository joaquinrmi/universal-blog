import { Pool, PoolClient } from "pg";
import Skeleton from "./skeleton";

class BasicModel<DocType extends { pool: Pool }>
{
   pool: Pool;
   client: PoolClient;
   private skeleton: Skeleton<DocType>;

   constructor(pool: Pool, skeleton: Skeleton<DocType>)
   {
      this.pool = pool;
      this.client = null;
      this.skeleton = new Skeleton<DocType>(pool, skeleton.methods);
   }

   setClient(client: PoolClient)
   {
      this.client = client;
   }

   protected getDocument(element: any): DocType
   {
      if(!element) return null;
      return this.skeleton.bind(element);
   }
}

export default BasicModel;