enum ErrorType
{
   InternalError = "internal_error",
   SessionDoesNotExist = "session_does_not_exist",
   InvalidForm = "invalid_form",
   InvalidQuery = "invalid_query",
   TheTitleIsAlreadyUsed = "the_title_is_already_used",
   PostDoesNotExist = "post_does_not_exist",
   UserDoesNotExist = "user_does_not_exist",
   UserIsNotThePostOwner = "user_is_not_the_post_owner",
   InsufficientPermissions = "insufficient_permissions",
   CommentDoesNotExist = "comment_does_not_exist"
}

export default ErrorType;