import express from "express";
import * as productController from "./product.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createProductSchema,
  getProductSchema,
  updateProductSchema,
} from "./product.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import { allowedTo, protectRoutes } from "../../middleware/protectFuns.js";

const productRouter = express.Router();

productRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    fileUpload().fields([
      { name: "imageCover", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    validation(createProductSchema),
    productController.addProduct
  )
  .get(productController.getAllProducts);

productRouter
  .route("/:id")
  .get(validation(getProductSchema), productController.getProduct)
  .put(
    protectRoutes,
    allowedTo("admin"),
    fileUpload().fields([
      { name: "imageCover", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    validation(updateProductSchema),
    productController.updateProduct
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    validation(getProductSchema),
    productController.deleteProduct
  );

export default productRouter;
