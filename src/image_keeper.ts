import * as sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import * as streamifier from "streamifier";
import randomWord from "./random_word";
import { UserDocument } from "./model/user";

class ImageKeeper
{
   private imageFolder: string;

   constructor(user: UserDocument)
   {
      this.imageFolder = `uploads/${user.alias}`;
   }

   async saveImage(img: any): Promise<string>
   {
      let filename = `${randomWord(8)}.jpg`;
      let path = `${this.imageFolder}/${filename}`;
      
      return await this.uploadImage(await sharp(img).jpeg().toBuffer(), path);
   }

   private uploadImage(buffer: any, id: string): Promise<string>
   {
      return new Promise((resolve, reject) => {
         let stream = cloudinary.uploader.upload_stream({ public_id: id}, (err, result) => {
            if(err)
            {
               reject(err);
            }
            else
            {
               resolve(result.url);
            }
         });

         streamifier.createReadStream(buffer).pipe(stream);
      });
   }
}

export default ImageKeeper;