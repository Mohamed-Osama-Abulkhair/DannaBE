import express from "express";
import * as incubationReserveController from "./incubationReserve.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createIncubationReserveSchema,
  getIncubationReserveSchema,
  getNearIncubationSchema,
} from "./incubationReserve.validation.js";
import {
  allowedTo,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";

const incubationReserveRouter = express.Router();

incubationReserveRouter
  .post("/nearIncubations",
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(getNearIncubationSchema),
    incubationReserveController.getNearHospitals
  )

incubationReserveRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("user"),
    isConfirmed,
    validation(createIncubationReserveSchema),
    incubationReserveController.bookIncubationCheckOutSession
  )
  .get(
    protectRoutes,
    allowedTo("user", "admin", "hospital"),
    isConfirmed,
    incubationReserveController.getAllIncubationsReservation
  );

incubationReserveRouter
  .route("/:id")
  .get(
    protectRoutes,
    allowedTo("user", "admin", "hospital"),
    isConfirmed,
    validation(getIncubationReserveSchema),
    incubationReserveController.getIncubationReservation
  );

export default incubationReserveRouter;
