import express from "express";
import * as orderController from "./order.controller.js";
import { validation } from "../../middleware/validation.js";
import { createOrderSchema } from "./order.validation.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const orderRouter = express.Router();

orderRouter
  .route("/")
  .get(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    orderController.getSpecificOrder
  );

orderRouter
  .route("/all")
  .get(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    orderController.getAllOrders
  );

orderRouter
  .route("/:id")
  .post(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(createOrderSchema),
    orderController.createCashOrder
  );

orderRouter
  .route("/checkout/:id")
  .post(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    orderController.createCheckOutSession
  );

export default orderRouter;
