import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as session from "express-session";
import * as cookieParser from "cookie-parser";
import * as pg from "pg";

class UniversalBlog
{
   app = express();
   pool = new pg.Pool();

   constructor()
   {
      try
      {
         this.initialize();
      }
      catch(err)
      {
         console.error(err);
         return;
      }

      this.app.set("port", process.env.PORT);

      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(cookieParser());
      this.app.use(session({
         secret: process.env.SESSION_SECRET,
         resave: false,
         saveUninitialized: false
      }));
   }

   start()
   {
      this.app.listen(this.app.get("port"), () => {
         console.log(`Server on port ${this.app.get("port")}.`);
      });
   }

   private initialize()
   {
      if(!process.env.SERVER_NAME)
      {
         try
         {
            var data = fs.readFileSync(path.join(__dirname, "..", "env.json"));
         }
         catch(err)
         {
            throw new Error("Las variables de entorno no han sido correctamente configuradas.");
         }
         
         const env = JSON.parse(data.toString());
         for(let key in env)
         {
            process.env[key] = env[key];
         }
      }
   }
}

export default UniversalBlog;