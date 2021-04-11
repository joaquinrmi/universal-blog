import * as CryptoJS from "crypto-js";

export function encrypt(text: string): string
{
   return CryptoJS.AES.encrypt(text, process.env.ENCRYPT_SECRET).toString();
}

export function decrypt(text: string): string
{
   const bytes = CryptoJS.AES.decrypt(text, process.env.ENCRYPT_SECRET);
   return bytes.toString(CryptoJS.enc.Utf8 as any);
}