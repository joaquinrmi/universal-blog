import PostForm from "./post_form";

interface EditPostForm extends PostForm
{
   postId: string;
}

export default EditPostForm;