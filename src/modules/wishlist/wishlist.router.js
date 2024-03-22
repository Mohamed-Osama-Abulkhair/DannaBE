import express from "express";
import * as wishlistController from "./wishlist.controller.js";
import { validation } from "../../middleware/validation.js";
import { createWishlistSchema } from "./wishlist.validation.js";
import { allowedTo, isConfirmed, protectRoutes } from "../../middleware/protectFuns.js";

const wishlistRouter = express.Router();

wishlistRouter
  .route("/")
  .patch(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(createWishlistSchema),
    wishlistController.addToWishlist
  )
  .delete(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(createWishlistSchema),
    wishlistController.removeFromWishlist
  )
  .get(protectRoutes, allowedTo("user"), wishlistController.getAllUserWishlist);

export default wishlistRouter;
