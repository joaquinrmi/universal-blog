import SignupForm from "../../api/account/signup_form";
import LoginForm from "../../api/account/login_form";
import PostForm from "../../api/post/post_form";
import CommentForm from "../../api/post/comment_form";
import LikeForm from "../../api/post/like_form";
import DeleteForm from "../../api/account/delete_form";
import Model from "../../model";
import DeletePostForm from "../../api/post/delete_post_form";

declare global
{
  namespace Express
  {
    interface Request
    {
      model: Model;
      signupForm: SignupForm;
      loginForm: LoginForm;
      postForm: PostForm;
      commentForm: CommentForm;
      likeForm: LikeForm;
      deleteForm: DeleteForm;
      deletePostForm: DeletePostForm;
    }
  }
}