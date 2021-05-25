enum ErrorType
{
   InternalError = "internal_error",
   SessionDoesNotExist = "session_does_not_exist",
   InvalidForm = "invalid_form",
   InsufficientPermissions = "insufficient_permissions",
   UserDoesNotExist = "user_does_not_exist",
   InvalidQuery = "invalid_query"
}

export default ErrorType;