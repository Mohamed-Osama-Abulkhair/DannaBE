import express from "express";
import * as doctorController from "./doctor.controller.js";
import { validation } from "../../middleware/validation.js";
import { getDoctorCertificateSchema } from "./doctor.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import { allowedTo, protectRoutes } from "../../middleware/protectFuns.js";

const doctorRouter = express.Router();

doctorRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("doctor"),
    fileUpload().single("certificate"),
    doctorController.addDoctorCertificate
  )
  .get(
    protectRoutes,
    allowedTo("admin"),
    doctorController.getAllDoctorCertificates
  );

doctorRouter
  .route("/:id")
  .get(
    protectRoutes,
    allowedTo("admin"),
    validation(getDoctorCertificateSchema),
    doctorController.getDoctorCertificate
  )
  .put(
    protectRoutes,
    allowedTo("admin"),
    validation(getDoctorCertificateSchema),
    doctorController.acceptDoctorCertificate
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    validation(getDoctorCertificateSchema),
    doctorController.rejectDoctorCertificate
  );

export default doctorRouter;
