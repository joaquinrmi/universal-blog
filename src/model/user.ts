import { Pool } from "pg";

class UserModel
{
   pool: Pool;

   constructor(pool: Pool)
   {
      this.pool = pool;
   }

   async checkAliasAvailability(alias: string): Promise<boolean>
   {
      try
      {
         var res = await this.pool.query("SELECT alias FROM users WHERE alias = $1", [ alias ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return res.rowCount == 0;
   }

   async checkEmailAvailability(email: string): Promise<boolean>
   {
      try
      {
         var res = await this.pool.query("SELECT email FROM users WHERE email = $1", [ email ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return res.rowCount == 0;
   }
}

export default UserModel;