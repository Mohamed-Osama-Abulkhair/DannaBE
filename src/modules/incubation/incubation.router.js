import express from "express";
import * as incubationController from "./incubation.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createIncubationSchema,
  getIncubationSchema,
  updateIncubationSchema,
} from "./incubation.validation.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";
const incubationRouter = express.Router();

incubationRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("hospital"),
    isConfirmed,
    validation(createIncubationSchema),
    incubationController.addIncubation
  )
  .get(
    protectRoutes,
    allowedTo("hospital", "admin"),
    isConfirmed,
    incubationController.getAllIncubations
  );

incubationRouter
  .route("/ofHospital/:id")
  .get(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    incubationController.incubationsOfHospitalForUser
  );

incubationRouter
  .route("/:id")
  .get(validation(getIncubationSchema), incubationController.getIncubation)
  .put(
    protectRoutes,
    allowedTo("hospital"),
    isConfirmed,
    validation(updateIncubationSchema),
    incubationController.updateIncubation
  )
  .delete(
    protectRoutes,
    allowedTo("hospital"),
    isConfirmed,
    validation(getIncubationSchema),
    incubationController.deleteIncubation
  );

export default incubationRouter;
