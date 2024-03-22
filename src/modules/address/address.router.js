import express from "express";
import * as addressController from "./address.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createAddressSchema,
  deleteAddressSchema,
} from "./address.validation.js";
import { allowedTo, isConfirmed, protectRoutes } from "../../middleware/protectFuns.js";

const addressRouter = express.Router();

addressRouter
  .route("/")
  .patch(
    validation(createAddressSchema),
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    addressController.addAddress
  )
  .delete(
    validation(deleteAddressSchema),
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    addressController.removeAddress
  )
  .get(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    addressController.getAllAddress
  );

export default addressRouter;
