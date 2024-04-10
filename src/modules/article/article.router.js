import express from "express";
import * as articleController from "./article.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createArticleSchema,
  getArticleSchema,
  updateArticleSchema,
} from "./article.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const articleRouter = express.Router();

articleRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin", "doctor"),
    isConfirmed,
    fileUpload().single("articleCover"),
    validation(createArticleSchema),
    articleController.addArticle
  )
  .get(articleController.getAllArticles);

articleRouter
  .route("/:id")
  .get(validation(getArticleSchema), articleController.getArticle)
  .put(
    protectRoutes,
    allowedTo("admin", "doctor"),
    isConfirmed,
    fileUpload().single("articleCover"),
    validation(updateArticleSchema),
    articleController.updateArticle
  )
  .delete(
    protectRoutes,
    allowedTo("admin", "doctor"),
    isConfirmed,
    validation(getArticleSchema),
    articleController.deleteArticle
  );

articleRouter
  .route("/likes/:id")
  .patch(
    protectRoutes,
    allowedTo("user", "doctor"),
    isConfirmed,
    validation(getArticleSchema),
    articleController.addLike
  )
  .delete(
    protectRoutes,
    allowedTo("user", "doctor"),
    isConfirmed,
    validation(getArticleSchema),
    articleController.removeLike
  );

export default articleRouter;
