import express from "express";
import * as videoController from "./video.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createVideoSchema,
  getVideoSchema,
  updateVideoSchema,
} from "./video.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import { allowedTo, protectRoutes } from "../../middleware/protectFuns.js";

const videoRouter = express.Router();

videoRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    fileUpload().single("videoCover"),
    validation(createVideoSchema),
    videoController.addVideo
  )
  .get(videoController.getAllVideos);

videoRouter
  .route("/:id")
  .get(validation(getVideoSchema), videoController.getVideo)
  .put(
    protectRoutes,
    allowedTo("admin"),
    fileUpload().single("videoCover"),
    validation(updateVideoSchema),
    videoController.updateVideo
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    validation(getVideoSchema),
    videoController.deleteVideo
  );

videoRouter
  .route("/likes/:id")
  .patch(
    protectRoutes,
    allowedTo("user", "doctor"),
    validation(getVideoSchema),
    videoController.addLike
  )
  .delete(
    protectRoutes,
    allowedTo("user", "doctor"),
    validation(getVideoSchema),
    videoController.removeLike
  );

export default videoRouter;
