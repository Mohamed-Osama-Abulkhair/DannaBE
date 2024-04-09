import express from "express";
import * as articleCommentController from "./articleComment.controller.js";

import { validation } from "../../middleware/validation.js";
import {
  createArticleCommentSchema,
  getArticleCommentSchema,
  updateArticleCommentSchema,
} from "./articleComment.validation.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const articleCommentRouter = express.Router();

articleCommentRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("user", "doctor"),
    isConfirmed,
    validation(createArticleCommentSchema),
    articleCommentController.addComment
  )
  .get(articleCommentController.getAllComments);

articleCommentRouter
  .route("/:id")
  .get(validation(getArticleCommentSchema), articleCommentController.getComment)
  .put(
    protectRoutes,
    allowedTo("user", "doctor"),
    isConfirmed,
    validation(updateArticleCommentSchema),
    articleCommentController.updateComment
  )
  .delete(
    protectRoutes,
    allowedTo("admin", "user", "doctor"),
    isConfirmed,
    validation(getArticleCommentSchema),
    articleCommentController.deleteComment
  );

export default articleCommentRouter;
