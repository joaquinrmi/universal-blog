import { Pool } from "pg";

type MethodsType<DocType> = {[Property in keyof DocType]: DocType[Property]};

class Skeleton<DocType extends { pool: Pool }>
{
   pool: Pool;
   methods: MethodsType<DocType>;

   constructor(pool?: Pool, methods?: MethodsType<DocType>)
   {
      this.pool = pool;
      this.methods = methods || {} as MethodsType<DocType>;
      this.bind = this.bind.bind(this);
   }

   bind(obj: any): DocType
   {
      obj.pool = this.pool;

      for(let key in this.methods)
      {
         if(typeof this.methods[key] == "function")
         {
            obj[key] = (this.methods[key] as any).bind(obj);
         }
      }

      return obj;
   }
}

export default Skeleton;