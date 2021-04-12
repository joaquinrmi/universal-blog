enum AccountError
{
   InternalError = "internal_error",
   InvalidForm = "invalid_form",
   InvalidPassword = "invalid_password",
   TooLongName = "too_long_name",
   TooLongSurname = "too_long_surname",
   InvalidAlias = "invalid_alias",
   AliasIsAlreadyUsed = "alias_is_already_used",
   EmailIsAlreadyUsed = "email_is_already_used",
   IncorrectUserOrPassword = "incorrect_user_or_password",
   SessionDoesNotExist = "session_does_not_exist"
}

export default AccountError;