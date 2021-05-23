import SignupForm from "../../api/account/signup_form";
import LoginForm from "../../api/account/login_form";
import PostForm from "../../api/post/post_form";
import CommentForm from "../../api/post/comment_form";
import LikeForm from "../../api/post/like_form";
import DeleteForm from "../../api/account/delete_form";
import Model from "../../model";
import DeletePostForm from "../../api/post/delete_post_form";
import PromoteForm from "../../api/user/promote_form";
import DeleteCommentForm from "../../api/post/delete_comment_form";
import BanishmentForm from "../../api/user/banishment_form";
import RemoveBanishmentForm from "../../api/user/remove_banishment_form";
import BasicUser from "../../user/user";

declare global
{
  namespace Express
  {
    interface Request
    {
      model: Model;
      user: BasicUser;
      signupForm: SignupForm;
      loginForm: LoginForm;
      postForm: PostForm;
      commentForm: CommentForm;
      likeForm: LikeForm;
      deleteForm: DeleteForm;
      deletePostForm: DeletePostForm;
      promoteForm: PromoteForm;
      deleteCommentForm: DeleteCommentForm;
      banishmentForm: BanishmentForm;
      removeBanishmentForm: RemoveBanishmentForm;
    }
  }
}