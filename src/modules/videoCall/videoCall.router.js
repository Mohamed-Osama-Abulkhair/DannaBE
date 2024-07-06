import express from "express";
import * as videoCallController from "./videoCall.controller.js";
import { validation } from "../../middleware/validation.js";
import { forgetPasswordSchema, getUserSchema } from "./videoCall.validation.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const videoCallRouter = express.Router();

videoCallRouter.post(
  "/addFriend",
  protectRoutes,
  allowedTo("user", "doctor"),
  isConfirmed,
  validation(forgetPasswordSchema),
  videoCallController.inviteFriend
);
videoCallRouter.post(
  "/acceptAddFriend",
  protectRoutes,
  allowedTo("user", "doctor"),
  isConfirmed,
  validation(getUserSchema),
  videoCallController.acceptAddFriend
);
videoCallRouter.post(
  "/rejectAddFriend",
  protectRoutes,
  allowedTo("user", "doctor"),
  isConfirmed,
  validation(getUserSchema),
  videoCallController.rejectAddFriend
);

export default videoCallRouter;
