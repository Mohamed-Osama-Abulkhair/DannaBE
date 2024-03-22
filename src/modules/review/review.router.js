import express from "express";
import * as reviewController from "./review.controller.js";

import { validation } from "../../middleware/validation.js";
import {
  createReviewSchema,
  getReviewSchema,
  updateReviewSchema,
} from "./review.validation.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const reviewRouter = express.Router();

reviewRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(createReviewSchema),
    reviewController.addReview
  )
  .get(reviewController.getAllReviews);

reviewRouter
  .route("/:id")
  .get(validation(getReviewSchema), reviewController.getReview)
  .put(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(updateReviewSchema),
    reviewController.updateReview
  )
  .delete(
    protectRoutes,
    allowedTo("admin", "user"),
    isConfirmed,
    validation(getReviewSchema),
    reviewController.deleteReview
  );

export default reviewRouter;
