import BasicModel from "./basic_model";
import { Pool } from "pg";
import Skeleton from "./skeleton";
import { UserDocument, User } from "./user";
import BanishmentListQuery from "./banishment_list_query";

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

   async search(query: BanishmentListQuery): Promise<{ banishment: Banishment, user: User }[]>
   {
      const banishmentProps = this.props;
      const userProps = [
         "name", "surname", "alias"
      ];

      const where = query.judgeId != undefined;
      const whereClause = where ? `WHERE banishments.judge = ${query.judgeId}` : ``;

      const orderByClause = `ORDER BY ${query.orderType} ${query.order}`;

      const dbQuery = `SELECT ${banishmentProps.map(prop => `banishments.${prop}`).join(",")}, ${userProps.map(prop => `users.${prop}`).join(",")} FROM banishments LEFT JOIN users ON banishments.email = users.email ${whereClause} ${orderByClause} LIMIT $1 OFFSET $2;`;

      const queryValues = [ query.count, query.offset ];

      try
      {
         var res = await this.pool.query(dbQuery, queryValues);
      }
      catch(err)
      {
         return Promise.reject(err);
      }

      const result: { banishment: Banishment, user: User }[] = [];

      for(let i = 0; i < res.rowCount; ++i)
      {
         const row = res.rows[i];

         let banishment: Banishment = {
            email: row.email,
            reason: row.reason,
            date: row.date,
            judge: row.judge
         };

         let user: User = {
            name: row.name || undefined,
            surname: row.surname || undefined,
            alias: row.alias || undefined,
            password: undefined,
            email: undefined,
            rank: undefined,
            date_join: undefined
         };

         result.push({
            banishment,
            user
         });
      }

      return result;
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