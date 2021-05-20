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
   constructor(pool: Pool)
   {
      super(pool, banishmentSkeleton);
   }
}

export default BanishmentModel;