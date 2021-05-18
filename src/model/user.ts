import { Pool } from "pg";
import { encrypt, decrypt } from "../encryption";
import Skeleton from "./skeleton";
import BasicModel from "./basic_model";
import randomWord from "../random_word";
import BasicUser from "../user/user";
import Reader from "../user/reader";
import Moderator from "../user/moderator";
import Admin from "../user/admin";
import Author from "../user/author";

export interface User
{
   password: string;
   name: string;
   surname: string;
   alias: string;
   email: string;
   rank: number;
   date_join: Date;
}

export interface UserSchema extends User
{
   id: number;
   session_keys: Array<string>;
}

export interface UserDocument extends UserSchema
{
   pool: Pool;

   checkPassword(password: string): boolean;
   registerSession(): Promise<string>;
   eraseSession(key: string): Promise<void>;
   checkSession(key: string): boolean;
   changeRank(rank: number): Promise<void>;
}

const userSkeleton = new Skeleton<UserDocument>();

class UserModel extends BasicModel<UserDocument>
{
   private props = [ "id", "password", "name", "surname", "alias", "email", "rank", "date_join", "session_keys" ];

   constructor(pool: Pool)
   {
      super(pool, userSkeleton);

      this.pool = pool;
   }

   async getUserById(id: number): Promise<BasicUser>
   {
      try
      {
         var userDocument = await this.searchById(id);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      switch(userDocument.rank)
      {
      case 0:
         return new Reader(userDocument);

      case 1:
         return new Author(userDocument);

      case 2:
         return new Moderator(userDocument);

      case 3:
         return new Admin(userDocument);
      }
   }

   async getUserByAliasOrEmail(aliasOrEmail: string): Promise<BasicUser>
   {
      try
      {
         var userDocument = await this.searchByAliasOrEmail(aliasOrEmail);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      switch(userDocument.rank)
      {
      case 0:
         return new Reader(userDocument);

      case 1:
         return new Author(userDocument);

      case 2:
         return new Moderator(userDocument);

      case 3:
         return new Admin(userDocument);
      }
   }

   async searchById(id: number, props?: Array<string>): Promise<UserDocument>
   {
      if(!props) props = this.props;

      try
      {
         var res = await this.pool.query(`SELECT ${props.join(",")} FROM users WHERE id = $1`, [ id ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return this.getDocument(res.rows[0]);
   }

   async searchByAliasOrEmail(aliasOrEmail: string, props?: Array<string>): Promise<UserDocument>
   {
      if(!props) props = this.props;

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
      let date = `${user.date_join.getFullYear()}-${user.date_join.getMonth() + 1}-${user.date_join.getDate()}`;

      try
      {
         await this.pool.query("INSERT INTO users (password, name, surname, alias, email, rank, date_join) VALUES ($1, $2, $3, $4, $5, $6, $7);", [ encryptedPassword, user.name, user.surname, user.alias, user.email, user.rank, date ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }

   async deleteUser(user: UserDocument): Promise<void>
   {
      if(!user.id)
      {
         return Promise.reject("property 'id' of 'user' is undefined");
      }

      const query = "DELETE FROM users WHERE id = $1;";

      try
      {
         if(this.client) await this.client.query(query, [ user.id ]);
         else await this.pool.query(query, [ user.id ]);
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

userSkeleton.methods.registerSession = async function(this: UserDocument): Promise<string>
{
   if(!this.session_keys)
   {
      return Promise.reject(new Error("field 'session_keys' is undefined"));
   }

   if(!this.id)
   {
      return Promise.reject(new Error("field 'id' is undefined"));
   }

   const key = randomWord(8);

   if(this.session_keys.length == 10)
   {
      this.session_keys.splice(0, 1);
      this.session_keys.push(key);
   }
   else this.session_keys.push(key);

   try
   {
      await this.pool.query(`UPDATE users SET session_keys = $2 WHERE id = $1;`, [ this.id, this.session_keys ]);
   }
   catch(err)
   {
      return Promise.reject(err);
   }

   return key;
}

userSkeleton.methods.eraseSession = async function(this: UserDocument, key: string): Promise<void>
{
   if(!this.session_keys)
   {
      return Promise.reject(new Error("field 'session_keys' is undefined"));
   }

   if(!this.id)
   {
      return Promise.reject(new Error("field 'id' is undefined"));
   }

   const index = this.session_keys.indexOf(key);
   if(index == -1)
   {
      return;
   }

   this.session_keys.splice(index, 1);

   try
   {
      await this.pool.query(`UPDATE users SET session_keys = $2 WHERE id = $1;`, [ this.id, this.session_keys ]);
   }
   catch(err)
   {
      return Promise.reject(err);
   }
}

userSkeleton.methods.checkSession = function(this: UserDocument, key: string): boolean
{
   if(!this.session_keys) return false;
   return this.session_keys.indexOf(key) != -1;
}

userSkeleton.methods.changeRank = async function(this: UserDocument, rank: number): Promise<void>
{
   if(!this.id)
   {
      return Promise.reject("propery 'id' is undefined");
   }

   if(!this.rank)
   {
      return Promise.reject("property 'rank' is undefined");
   }

   try
   {
      await this.pool.query("UPDATE users SET rank = $2 WHERE id = $1;", [ this.id, rank ]);
   }
   catch(err)
   {
      return Promise.reject(err);
   }

   this.rank = rank;
}

export default UserModel;