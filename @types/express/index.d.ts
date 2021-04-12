import SignupForm from "../../src/api/account/signup_form";
import LoginForm from "../../src/api/account/login_form";

declare global
{
  namespace Express
  {
    interface Request
    {
      signupForm: SignupForm;
      loginForm: LoginForm;
    }
  }
}