function randomWord(length: number): string
{
   let CHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789";

   let word = "";
   for(let i = 0; i < length; ++i)
   {
      word += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
   }

   return word;
}

export default randomWord;