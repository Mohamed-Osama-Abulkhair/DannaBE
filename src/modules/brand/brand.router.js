import express from "express";
import * as brandController from "./brand.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createBrandSchema,
  getBrandSchema,
  updateBrandSchema,
} from "./brand.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import { allowedTo, protectRoutes } from "../../middleware/protectFuns.js";
const brandRouter = express.Router();

brandRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    fileUpload().single("logo"),
    validation(createBrandSchema),
    brandController.addBrand
  )
  .get(brandController.getAllBrands);

brandRouter
  .route("/:id")
  .get(validation(getBrandSchema), brandController.getBrand)
  .put(
    protectRoutes,
    allowedTo("admin"),
    fileUpload().single("logo"),
    validation(updateBrandSchema),
    brandController.updateBrand
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    validation(getBrandSchema),
    brandController.deleteBrand
  );

export default brandRouter;
