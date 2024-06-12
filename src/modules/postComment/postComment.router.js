import express from "express";
import * as postCommentController from "./postComment.controller.js";

import { validation } from "../../middleware/validation.js";
import {
  createPostCommentSchema,
  getPostCommentSchema,
  updatePostCommentSchema,
} from "./postComment.validation.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const postCommentRouter = express.Router();

postCommentRouter
  .route("/")
  .post(
    protectRoutes,  
    allowedTo("admin","user", "doctor"),
    isConfirmed,
    validation(createPostCommentSchema),
    postCommentController.addComment
  )
  .get(postCommentController.getAllComments);

postCommentRouter
  .route("/:id")
  .get(validation(getPostCommentSchema), postCommentController.getComment)
  .put(
    protectRoutes,
    allowedTo("admin","user", "doctor"),
    isConfirmed,
    validation(updatePostCommentSchema),
    postCommentController.updateComment
  )
  .delete(
    protectRoutes,
    allowedTo("admin", "user", "doctor"),
    isConfirmed,
    validation(getPostCommentSchema),
    postCommentController.deleteComment
  );

export default postCommentRouter;
