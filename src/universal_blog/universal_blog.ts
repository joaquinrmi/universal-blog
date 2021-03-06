import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as session from "express-session";
import * as cookieParser from "cookie-parser";
import * as multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import serverInit from "../server_init";

import AccountAPI from "../api/account/";
import PostAPI from "../api/post/";
import UserAPI from "../api/user/";
import UploadAPI from "../api/upload/";

const storage = multer.memoryStorage();
const upload = multer({ storage });
cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.CLOUD_API_KEY,
   api_secret: process.env.CLOUD_API_SECRET
});

class UniversalBlog
{
   app = express();
   accountAPI: AccountAPI;
   postAPI: PostAPI;
   userAPI: UserAPI;
   uploadAPI: UploadAPI;

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

      this.accountAPI = new AccountAPI();
      this.postAPI = new PostAPI();
      this.userAPI = new UserAPI();
      this.uploadAPI = new UploadAPI(upload);

      this.app.set("port", process.env.PORT);

      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(cookieParser());
      this.app.use(session({
         secret: process.env.SESSION_SECRET,
         resave: false,
         saveUninitialized: false
      }));

      this.app.use("/api/account", this.accountAPI.use());
      this.app.use("/api/post", this.postAPI.use());
      this.app.use("/api/user", this.userAPI.use());
      this.app.use("/api/upload", this.uploadAPI.use());
   }

   async start()
   {
      try
      {
         await serverInit();
      }
      catch(err)
      {
         if(err.code != "42P07")
         {
            console.error(err);
            return Promise.reject(err);
         }
      }

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