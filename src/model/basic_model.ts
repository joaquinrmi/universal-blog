import Skeleton from "./skeleton";

class BasicModel<DocType>
{
   private skeleton: Skeleton<DocType>;

   constructor(skeleton: Skeleton<DocType>)
   {
      this.skeleton = { ...skeleton } as Skeleton<DocType>;
   }

   protected getDocument(element: any): DocType
   {
      if(!element) return null;
      return this.skeleton.bind(element);
   }
}

export default BasicModel;