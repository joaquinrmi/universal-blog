import SignupForm from "../../src/api/account/signup_form";
import LoginForm from "../../src/api/account/login_form";
import PostForm from "../../src/api/post/post_form";

declare global
{
  namespace Express
  {
    interface Request
    {
      signupForm: SignupForm;
      loginForm: LoginForm;
      postForm: PostForm;
    }
  }
}