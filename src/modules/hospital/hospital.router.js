import express from "express";
import * as hospitalController from "./hospital.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createHospitalLocationSchema,
  getHospitalLocationSchema,
  updateHospitalLocationSchema,
} from "./hospital.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";
const hospitalRouter = express.Router();

hospitalRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("hospital"),
    isConfirmed,
    validation(createHospitalLocationSchema),
    hospitalController.addHospitalLocation
  )
  .get(hospitalController.getAllHospitalsLocations)
  .put(
    protectRoutes,
    allowedTo("hospital"),
    isConfirmed,
    hospitalController.updateHospitalLocation
  )
  .delete(
    protectRoutes,
    allowedTo("hospital"),
    isConfirmed,
    hospitalController.deleteHospitalLocation
  );

hospitalRouter
  .route("/:id")
  .get(
    validation(getHospitalLocationSchema),
    hospitalController.getHospitalLocation
  );

export default hospitalRouter;
