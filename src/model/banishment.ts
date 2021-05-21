import BasicModel from "./basic_model";
import { Pool } from "pg";
import Skeleton from "./skeleton";
import { UserDocument } from "./user";

export interface Banishment
{
   email: string;
   reason: string;
   date: Date;
   judge: number;
}

export interface BanishmentDocument extends Banishment
{
   pool: Pool;
}

const banishmentSkeleton = new Skeleton<BanishmentDocument>();

class BanishmentModel extends BasicModel<BanishmentDocument>
{
   private props = [ "email", "reason", "date", "judge" ];

   constructor(pool: Pool)
   {
      super(pool, banishmentSkeleton);
   }

   async searchByEmail(email: string): Promise<BanishmentDocument>
   {
      try
      {
         var res = await this.pool.query(`SELECT ${this.props.join(",")} FROM banishments WHERE email = $1;`, [ email ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return this.getDocument(res.rows[0]);
   }

   async checkEmailAvailability(email: string): Promise<boolean>
   {
      try
      {
         var res = await this.pool.query(`SELECT email FROM banishments WHERE email = $1;`, [ email ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return res.rowCount == 0;
   }

   async registerBanished(judge: UserDocument, email: string, reason?: string): Promise<boolean>
   {
      if(!await this.checkEmailAvailability(email)) return false;

      if(reason == undefined) reason = "";
      const date = new Date();

      try
      {
         await this.pool.query(`INSERT INTO banishments (email, reason, date, judge) VALUES ($1, $2, $3, $4);`, [ email, reason, date, judge.id ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      return true;
   }

   async removeBanishment(email: string): Promise<void>
   {
      try
      {
         await this.pool.query(`DELETE FROM banishments WHERE email = $1;`, [ email ]);
      }
      catch(err)
      {
         return Promise.reject(err);
      }
   }
}

export default BanishmentModel;