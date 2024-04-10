import express from "express";
import * as postController from "./post.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createPostSchema,
  getPostSchema,
  updatePostSchema,
} from "./post.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const postRouter = express.Router();

postRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin", "doctor", "user"),
    isConfirmed,
    fileUpload().fields([{ name: "images", maxCount: 10 }]),
    validation(createPostSchema),
    postController.addPost
  )
  .get(postController.getAllPosts);

postRouter
  .route("/:id")
  .get(validation(getPostSchema), postController.getPost)
  .put(
    protectRoutes,
    allowedTo("admin", "doctor", "user"),
    isConfirmed,
    fileUpload().fields([{ name: "images", maxCount: 10 }]),
    validation(updatePostSchema),
    postController.updatePost
  )
  .delete(
    protectRoutes,
    allowedTo("admin", "doctor", "user"),
    isConfirmed,
    validation(getPostSchema),
    postController.deletePost
  );

postRouter
  .route("/likes/:id")
  .patch(
    protectRoutes,
    allowedTo("user", "doctor"),
    isConfirmed,
    validation(getPostSchema),
    postController.addLike
  )
  .delete(
    protectRoutes,
    allowedTo("user", "doctor"),
    isConfirmed,
    validation(getPostSchema),
    postController.removeLike
  );

export default postRouter;
