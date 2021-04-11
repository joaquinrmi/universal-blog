import * as fs from "fs";
import * as path from "path";
import * as express from "express";

class UniversalBlog
{
   app = express();

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