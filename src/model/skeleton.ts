type MethodsType<DocType> = {[Property in keyof DocType]: DocType[Property]};

class Skeleton<DocType>
{
   methods: MethodsType<DocType>;

   constructor()
   {
      this.methods = {} as MethodsType<DocType>;
      this.bind = this.bind.bind(this);
   }

   bind(obj: any): DocType
   {
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