import { Pool } from "pg";
import UserModel from "./user";
import PostModel from "./post";

class Model
{
   pool: Pool;
   user: UserModel;
   post: PostModel;

   constructor()
   {
      this.pool = new Pool();
      this.user = new UserModel(this.pool);
      this.post = new PostModel(this.pool);
   }
}

export default Model;