import { Request, Response, NextFunction } from "express";
import Router from "../router/";
import RouteMap, { MethodType } from "../router/route_map";
import StatusCode from "../status_code";
import ErrorResponse from "../error_response";
import { Post, SearchPostQuery, PostErrorCode } from "../../model/post";
import ErrorType from "./error";
import { UserDocument } from "../../model/user";
import { Comment } from "../../model/comment";
import { Like } from "../../model/like";
import useModel from "../use_model";
import UserErrorCode from "../../user/error_code";
import checkSession from "../check_session";

class PostAPI extends Router
{
   constructor()
   {
      super([
         new RouteMap(MethodType.Post, "/create", "createPost"),
         new RouteMap(MethodType.Post, "/delete", "deletePost"),
         new RouteMap(MethodType.Post, "/comment", "createComment"),
         new RouteMap(MethodType.Post, "/delete-comment", "deleteComment"),
         new RouteMap(MethodType.Post, "/like", "like"),
         new RouteMap(MethodType.Get, "/get-single", "getPost"),
         new RouteMap(MethodType.Get, "/get-list", "searchPosts"),
         new RouteMap(MethodType.Get, "/get-comment", "getComment")
      ]);

      this.registerFunction("createPost", this.createPost);
      this.registerFunction("deletePost", this.deletePost);
      this.registerFunction("createComment", this.createComment);
      this.registerFunction("deleteComment", this.deleteComment);
      this.registerFunction("like", this.like);
      this.registerFunction("getPost", this.getPost);
      this.registerFunction("searchPosts", this.searchPosts);
      this.registerFunction("getComment", this.getComment);

      this.useMiddleware(useModel);
      this.useMiddleware(checkSession, [ "/create", "/delete", "/comment", "/delete-comment", "/like" ]);
      this.useMiddleware(this.checkCreatePostForm, [ "/create" ]);
      this.useMiddleware(this.checkDeletePostForm, [ "/delete" ]);
      this.useMiddleware(this.checkCommentForm, [ "/comment" ]);
      this.useMiddleware(this.checkDeleteCommentForm, [ "/delete-comment" ]);
      this.useMiddleware(this.checkLikeForm, [ "/like" ]);
   }

   private async createPost(req: Request, res: Response): Promise<any>
   {
      const postData: Post = {
         title: req.postForm.title,
         content: req.postForm.content,
         cover: req.postForm.cover,
         gallery: req.postForm.gallery,
         gallery_position: req.postForm.galleryPosition,
         tags: req.postForm.tags,
         comment_count: 0,
         like_count: 0,
         date_created: new Date()
      };

      try
      {
         var postId = await req.user.createPost(req.model, postData);
      }
      catch(err)
      {
         switch(err)
         {
         case UserErrorCode.InsufficientPermissions:
            return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.InsufficientPermissions));

         case PostErrorCode.TitleAlreadyUsed:
            return res.status(StatusCode.Conflict).json(new ErrorResponse(ErrorType.TheTitleIsAlreadyUsed));

         default:
            console.error(err);
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      res.status(StatusCode.Created).json({
         postId
      });
   }

   private async deletePost(req: Request, res: Response): Promise<any>
   {
      try
      {
         await req.user.deletePost(req.model, req.deletePostForm.postId);
      }
      catch(err)
      {
         switch(err)
         {
         case UserErrorCode.PostNotFound:
            return res.status(StatusCode.NotFound).json(new ErrorResponse(ErrorType.PostDoesNotExist));

         case UserErrorCode.InsufficientPermissions:
            return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.InsufficientPermissions));

         default:
            console.error(err);
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      res.status(StatusCode.OK).json();
   }

   private async createComment(req: Request, res: Response): Promise<any>
   {
      try
      {
         const comment: Comment = {
            author_id: req.user.document.id,
            post_id: req.commentForm.postId,
            content: req.commentForm.content,
            date_created: new Date()
         };

         var commentId = await req.user.comment(req.model, req.commentForm.postId, comment);
      }
      catch(err)
      {
         switch(err)
         {
         case UserErrorCode.PostNotFound:
            return res.status(StatusCode.NotFound).json(new ErrorResponse(ErrorType.PostDoesNotExist));

         case UserErrorCode.InsufficientPermissions:
            return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.InsufficientPermissions));

         default:
            console.error(err);
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      res.status(StatusCode.Created).json({
         commentId
      });
   }

   private async deleteComment(req: Request, res: Response): Promise<any>
   {
      try
      {
         await req.user.deleteComment(req.model, req.deleteCommentForm.id);
      }
      catch(err)
      {
         switch(err)
         {
         case UserErrorCode.CommentNotFound:
            return res.status(StatusCode.NotFound).json(new ErrorResponse(ErrorType.CommentDoesNotExist));

         case UserErrorCode.InsufficientPermissions:
            return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.InsufficientPermissions));

         default:
            console.error(err);
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      res.status(StatusCode.OK).json();
   }

   private async like(req: Request, res: Response): Promise<any>
   {
      try
      {
         const like: Like = {
            author_id: req.user.document.id,
            post_id: req.likeForm.postId
         };

         await req.user.like(req.model, req.likeForm.postId, like);
      }
      catch(err)
      {
         switch(err)
         {
         case UserErrorCode.PostNotFound:
            return res.status(StatusCode.NotFound).json(new ErrorResponse(ErrorType.PostDoesNotExist));

         case UserErrorCode.InsufficientPermissions:
            return res.status(StatusCode.Unauthorized).json(new ErrorResponse(ErrorType.InsufficientPermissions));

         default:
            console.error(err);
            return res.status(StatusCode.InternalServerError).json();
         }
      }

      return res.status(StatusCode.Created).json();
   }

   private async getPost(req: Request, res: Response): Promise<any>
   {
      if(!req.query.postId)
      {
         return res.status(StatusCode.BadRequest).json(new ErrorResponse(ErrorType.InvalidQuery));
      }

      try
      {
         var post = await req.model.post.searchById(req.query.postId.toString());
         var author = await req.model.user.searchById(post.author_id, [ "alias" ]);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json();
      }

      if(!post)
      {
         return res.status(StatusCode.NotFound).json(new ErrorResponse(ErrorType.PostDoesNotExist));
      }
      
      res.status(StatusCode.OK).json({
         title: post.title,
         content: post.content,
         cover: post.cover,
         gallery: post.gallery,
         galleryPosition: post.gallery_position,
         tags: post.tags,
         authorAlias: author.alias,
         commentCount: post.comment_count,
         likeCount: post.like_count,
         dateCreated: post.date_created
      });
   }

   private async searchPosts(req: Request, res: Response): Promise<any>
   {
      if(!req.query.offset || !req.query.count)
      {
         return res.status(StatusCode.BadRequest).json(new ErrorResponse(ErrorType.InvalidQuery));
      }

      let searchQuery: SearchPostQuery = {
         count: Number(req.query.count),
         offset: Number(req.query.offset),
         author: null,
         tags: [],
         orderType: "date_created",
         order: "desc"
      };

      if(req.query.tags)
      {
         try
         {
            searchQuery.tags = JSON.parse(req.query.tags.toString());
         }
         catch(err)
         {
            return res.status(StatusCode.BadRequest).json(new ErrorResponse(ErrorType.InvalidQuery));
         }

         if(!Array.isArray(searchQuery.tags))
         {
            return res.status(StatusCode.BadRequest).json(new ErrorResponse(ErrorType.InvalidQuery));
         }
      }

      if(req.query.order_type)
      {
         searchQuery.orderType = req.query.order_type.toString();
      }

      if(req.query.order)
      {
         searchQuery.order = req.query.order.toString();
      }

      if(req.query.author)
      {
         try
         {
            var user = await req.model.user.searchByAliasOrEmail(req.query.author.toString(), [ "id" ]);
         }
         catch(err)
         {
            console.error(err);
            return res.status(StatusCode.InternalServerError).json();
         }

         if(!user)
         {
            return res.status(StatusCode.NotFound).json(new ErrorResponse(ErrorType.UserDoesNotExist));
         }

         searchQuery.author = user.id;
      }

      try
      {
         var posts = await req.model.post.search(searchQuery);
      }
      catch(err)
      {
         console.error(err);
         return res.status(StatusCode.InternalServerError).json();
      }

      let result = new Array<any>(posts.length);
      for(let i = 0; i < posts.length; ++i)
      {
         let user: UserDocument;
         try
         {
            user = await req.model.user.searchById(posts[i].author_id, [ "alias" ]);
         }
         catch(err)
         {
            console.error(err);
            return res.status(StatusCode.InternalServerError).json();
         }

         result[i] = {
            title: posts[i].title,
            content: posts[i].content,
            cover: posts[i].cover,
            gallery: posts[i].gallery,
            galleryPosition: posts[i].gallery_position,
            tags: posts[i].tags,
            authorAlias: user.alias,
            commentCount: posts[i].comment_count,
            likeCount: posts[i].like_count,
            dateCreated: posts[i].date_created.getTime()
         };
      }

      res.status(StatusCode.OK).json(result);
   }

   private async getComment(req: Request, res: Response): Promise<any>
   {
      if(!req.query["id"])
      {
         return res.status(StatusCode.BadRequest).json(new ErrorResponse(ErrorType.InvalidQuery));
      }

      try
      {
         var comment = await req.model.comment.searchById(Number(req.query["id"]));
      }
      catch(err)
      {
         return res.status(StatusCode.InternalServerError).json();
      }

      res.status(StatusCode.OK).json({
         id: comment.id,
         authorId: comment.author_id,
         postId: comment.post_id,
         content: comment.content,
         dateCreated: comment.date_created.getTime()
      });
   }

   private async checkCreatePostForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.title != "string") return exit(ErrorType.InvalidForm);
      if(Array.isArray(req.body.content))
      {
         for(let i = 0; i < req.body.content.length; ++i)
         {
            if(typeof req.body.content[i] != "string") return exit(ErrorType.InvalidForm);
         }
      }
      else return exit(ErrorType.InvalidForm);
      if(typeof req.body.cover != "string") return exit(ErrorType.InvalidForm);
      if(Array.isArray(req.body.gallery))
      {
         for(let i = 0; i < req.body.gallery.length; ++i)
         {
            if(typeof req.body.gallery[i] != "string") return exit(ErrorType.InvalidForm);
         }
      }
      else if(req.body.gallery) return exit(ErrorType.InvalidForm);
      if(Array.isArray(req.body.galleryPosition))
      {
         for(let i = 0; i < req.body.galleryPosition.length; ++i)
         {
            if(typeof req.body.galleryPosition[i] != "number") return exit(ErrorType.InvalidForm);
         }
      }
      else if(req.body.galleryPosition) return exit(ErrorType.InvalidForm);
      if(Array.isArray(req.body.tags))
      {
         for(let i = 0; i < req.body.tags.length; ++i)
         {
            if(typeof req.body.tags[i] != "string") return exit(ErrorType.InvalidForm);
         }
      }
      else if(req.body.tags) return exit(ErrorType.InvalidForm);

      req.postForm = req.body;
      if(!req.postForm.gallery) req.postForm.gallery = [];
      if(!req.postForm.galleryPosition) req.postForm.galleryPosition = [];
      if(!req.postForm.tags) req.postForm.tags = [];

      next();
   }

   private async checkDeletePostForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.postId != "string") return exit(ErrorType.InvalidForm);

      req.deletePostForm = req.body;

      next();
   }

   private async checkCommentForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.postId != "string") return exit(ErrorType.InvalidForm);
      if(!Array.isArray(req.body.content)) return exit(ErrorType.InvalidForm);

      req.commentForm = req.body;

      next();
   }

   private async checkDeleteCommentForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.id != "number") return exit(ErrorType.InvalidForm);

      req.deleteCommentForm = req.body;

      next();
   }

   private async checkLikeForm(req: Request, res: Response, next: NextFunction): Promise<any>
   {
      const exit = (err: string) => res.status(StatusCode.BadRequest).json(new ErrorResponse(err));

      if(!req.body) return exit(ErrorType.InvalidForm);
      if(typeof req.body.postId != "string") return exit(ErrorType.InvalidForm);

      req.likeForm = req.body;

      next();
   }
}

export default PostAPI;