interface PostForm
{
   title: string;
   content: string;
   cover: string;
   gallery?: Array<string>;
   galleryPosition?: Array<number>;
   tags?: Array<string>;
}

export default PostForm;