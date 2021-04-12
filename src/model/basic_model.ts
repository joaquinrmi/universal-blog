import { Pool } from "pg";
import Skeleton from "./skeleton";

class BasicModel<DocType extends { pool: Pool }>
{
   private skeleton: Skeleton<DocType>;

   constructor(pool: Pool, skeleton: Skeleton<DocType>)
   {
      this.skeleton = new Skeleton<DocType>(pool, skeleton.methods);
   }

   protected getDocument(element: any): DocType
   {
      if(!element) return null;
      return this.skeleton.bind(element);
   }
}

export default BasicModel;