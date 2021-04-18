import { User } from "./model/user";
import Model from "./model";

async function serverInit(): Promise<void>
{
   const model = new Model();

   const user: User = {
      password: process.env.ADMIN_PASSWORD,
      name: process.env.ADMIN_NAME || process.env.SERVER_NAME,
      surname: process.env.ADMIN_SURNAME || "Admin",
      alias: process.env.ADMIN_ALIAS,
      email: process.env.ADMIN_EMAIL,
      rank: 3,
      date_join: new Date()
   };

   try
   {
      await model.createTables();
      await model.user.createUser(user);
   }
   catch(err)
   {
      return Promise.reject(err);
   }
}

export default serverInit;