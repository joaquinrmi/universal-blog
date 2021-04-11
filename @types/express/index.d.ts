import SignupForm from "../../src/api/account/signup_form";

declare global
{
  namespace Express
  {
    interface Request
    {
      signupForm: SignupForm;
    }
  }
}