import express from "express";
import * as childController from "./child.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createChildSchema,
  getChildSchema,
  updateChildSchema,
} from "./child.validation.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const childRouter = express.Router();

childRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(createChildSchema),
    childController.addChild
  )
  .get(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    childController.getAllChildren
  );

childRouter
  .route("/:id")
  .get(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(getChildSchema),
    childController.getChild
  )
  .put(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(updateChildSchema),
    childController.updateChild
  )
  .delete(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(getChildSchema),
    childController.deleteChild
  );

export default childRouter;
