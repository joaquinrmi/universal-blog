import { Pool } from "pg";
import UserModel from "./user";

class Model
{
   pool: Pool;
   user: UserModel;

   constructor()
   {
      this.pool = new Pool();
      this.user = new UserModel(this.pool);
   }
}

export default Model;