import BasicModel from "./basic_model";
import { Pool } from "pg";
import Skeleton from "./skeleton";

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
}

export default BanishmentModel;