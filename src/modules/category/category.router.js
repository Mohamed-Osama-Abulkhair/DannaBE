import express from "express";
import * as categoryController from "./category.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createCategorySchema,
  getCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import { allowedTo, protectRoutes } from "../../middleware/protectFuns.js";

const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    fileUpload().single("image"),
    validation(createCategorySchema),
    categoryController.addCategory
  )
  .get(categoryController.getAllCategories);

categoryRouter
  .route("/:id")
  .get(validation(getCategorySchema), categoryController.getCategory)
  .put(
    protectRoutes,
    allowedTo("admin"),
    fileUpload().single("image"),
    validation(updateCategorySchema),
    categoryController.updateCategory
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    validation(getCategorySchema),
    categoryController.deleteCategory
  );

export default categoryRouter;
