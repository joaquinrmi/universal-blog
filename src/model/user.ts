import { Pool } from "pg";
import { encrypt, decrypt } from "../encryption";
import Skeleton from "./skeleton";
import BasicModel from "./basic_model";

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

export interface UserSchema extends User
{
   id: number;
}

export interface UserDocument extends UserSchema
{
   checkPassword(password: string): boolean;
}

const userSkeleton = new Skeleton<UserDocument>();

class UserModel extends BasicModel<UserDocument>
{
   pool: Pool;

   constructor(pool: Pool)
   {
      super(userSkeleton);

      this.pool = pool;
   }

   async searchByAliasOrEmail(aliasOrEmail: string, props?: Array<string>): Promise<UserDocument>
   {
      if(!props)
      {
         props = [ "id", "password", "name", "surname", "alias", "email", "rank", "date_join" ];
      }

      const query = `SELECT ${props.join(",")} FROM users WHERE alias=$1 OR email=$1`;

      try
      {
         var res = await this.pool.query(query, [ aliasOrEmail ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return this.getDocument(res.rows[0]);
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

userSkeleton.methods.checkPassword = function(this: UserDocument, password: string): boolean
{
   if(!this.password) return false;
   return password == decrypt(this.password);
}

export default UserModel;