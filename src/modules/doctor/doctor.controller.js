import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";
import { doctorModel } from "../../../databases/models/doctor.model.js";
import { userModel } from "../../../databases/models/user.model.js";

// 1- add Doctor Certificate
const addDoctorCertificate = catchAsyncError(async (req, res, next) => {
  const doctor = await doctorModel.findById(req.user._id);
  if (doctor)
    return next(new appError("Your certificate is being reviewed", 409));

  if (!req.file)
    return next(new appError("Certificate image is required", 400));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/doctor`,
    }
  );

  const result = new doctorModel({
    doctor: req.user._id,
    image: { id: public_id, url: secure_url },
  });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all Doctor Certificate
const getAllDoctorCertificates = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(doctorModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalDoctorCertificates = await doctorModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length &&
    next(new appError("Not Doctors Certificate added yet", 404));

  apiFeatures.calculateTotalAndPages(totalDoctorCertificates);
  result.length &&
    res.status(200).json({
      message: "success",
      totalDoctorCertificates,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one Doctor Certificate
const getDoctorCertificate = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await doctorModel.findById(id);

  !result && next(new appError("Doctor Certificate not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- reject one Doctor Certificate
const rejectDoctorCertificate = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await doctorModel.findByIdAndDelete(id);
  !result && next(new appError("Doctor Certificate not found", 404));
  await cloudinary.api.delete_resources(result.image.id);
  result && res.status(200).json({ message: "success", result });
});

// 5- accept one Doctor Certificate
const acceptDoctorCertificate = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const doctor = await doctorModel.findById(id);
  if (!doctor) return next(new appError("Doctor Certificate not found", 404));

  const result = await userModel
    .findByIdAndUpdate(id, { certificated: true })
    .select(
      "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -emailChangedAt -__v"
    );

  res.status(200).json({ message: "success", result });
});

export {
  addDoctorCertificate,
  getAllDoctorCertificates,
  getDoctorCertificate,
  rejectDoctorCertificate,
  acceptDoctorCertificate,
};
