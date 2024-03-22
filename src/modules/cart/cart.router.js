import express from "express";
import * as cartController from "./cart.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  applyCouponCartSchema,
  createCartSchema,
  getCartSchema,
  updateCartSchema,
} from "./cart.validation.js";
import { allowedTo, isConfirmed, protectRoutes } from "../../middleware/protectFuns.js";

const cartRouter = express.Router();

cartRouter
  .route("/")
  .post(
    validation(createCartSchema),
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    cartController.addProductToCart
  )
  .put(
    validation(applyCouponCartSchema),
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    cartController.applyCoupon
  )
  .get(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    cartController.getLoggedUserCart
  )
  .delete(protectRoutes, allowedTo("user"), cartController.clearCart);

cartRouter
  .route("/:id")
  .delete(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(getCartSchema),
    cartController.deleteProductFromCart
  )
  .put(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(updateCartSchema),
    cartController.updateQuantity
  );

export default cartRouter;
