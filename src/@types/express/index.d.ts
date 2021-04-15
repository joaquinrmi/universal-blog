import SignupForm from "../../api/account/signup_form";
import LoginForm from "../../api/account/login_form";
import PostForm from "../../api/post/post_form";
import CommentForm from "../../api/post/comment_form";
import LikeForm from "../../api/post/like_form";

declare global
{
  namespace Express
  {
    interface Request
    {
      signupForm: SignupForm;
      loginForm: LoginForm;
      postForm: PostForm;
      commentForm: CommentForm;
      likeForm: LikeForm;
    }
  }
}