import { Pool } from "pg";
import { encrypt, decrypt } from "../encryption";

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
         var res = await this.pool.query("SELECT alias FROM users WHERE alias = $1;", [ alias ]);
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
         var res = await this.pool.query("SELECT email FROM users WHERE email = $1;", [ email ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return res.rowCount == 0;
   }

   async createUser(user: User): Promise<void>
   {
      let encryptedPassword = encrypt(user.password);
      let date = `${user.dateJoin.getFullYear()}-${user.dateJoin.getMonth() + 1}-${user.dateJoin.getDate()}`;

      try
      {
         await this.pool.query("INSERT INTO users (password, name, surname, alias, email, rank, date_join) VALUES ($1, $2, $3, $4, $5, $6, $7);", [ encryptedPassword, user.name, user.surname, user.alias, user.email, user.rank, date ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
}

export interface User
{
   password: string;
   name: string;
   surname: string;
   alias: string;
   email: string;
   rank: number;
   dateJoin: Date;
}

export default UserModel;