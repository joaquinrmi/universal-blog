import { Pool } from "pg";
import UserModel from "./user";
import PostModel from "./post";
import CommentModel from "./comment";
import LikeModel from "./like";

class Model
{
   pool: Pool;
   user: UserModel;
   post: PostModel;
   comment: CommentModel;
   like: LikeModel;

   constructor()
   {
      this.pool = new Pool();
      this.user = new UserModel(this.pool);
      this.post = new PostModel(this.pool);
      this.comment = new CommentModel(this.pool);
      this.like = new LikeModel(this.pool);
   }
}

export default Model;