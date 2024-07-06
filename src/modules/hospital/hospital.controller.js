import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { hospitalModel } from "../../../databases/models/hospital.model.js";

// 1- add hospital location
const addHospitalLocation = catchAsyncError(async (req, res, next) => {
  const hospital = await hospitalModel.findOne({ hospital: req.user._id });
  if (hospital)
    return next(new appError("hospital already has a location", 409));

  req.body.hospital = req.user._id;
  req.body.location.coordinates[0] = parseFloat(
    req.body.location.coordinates[0].toFixed(7)
  );
  req.body.location.coordinates[1] = parseFloat(
    req.body.location.coordinates[1].toFixed(7)
  );
  const result = await hospitalModel.create(req.body);

  res.status(201).json({ message: "success", result });
});

// 2- get all Hospitals
const getAllHospitalsLocations = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(hospitalModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalHospitals = await hospitalModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not Hospitals added yet", 404));

  apiFeatures.calculateTotalAndPages(totalHospitals);
  result.length &&
    res.status(200).json({
      message: "success",
      totalHospitals,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one hospital
const getHospitalLocation = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const hospital = await hospitalModel.findById(id)||await hospitalModel.findOne({hospital:id})
  if (!hospital) return next(new appError("hospital not found", 404));

  res.status(200).json({ message: "success", result: hospital });
});

// 4- update one Hospital
const updateHospitalLocation = catchAsyncError(async (req, res, next) => {
  const hospital = await hospitalModel.findOne({ hospital: req.user._id });
  if (!hospital)
    return next(new appError("hospital's location not found", 404));

  if (req.body.location) {
    hospital.location = req.body.location;
    hospital.location.coordinates[0] = parseFloat(
      req.body.location.coordinates[0].toFixed(7)
    );
    hospital.location.coordinates[1] = parseFloat(
      req.body.location.coordinates[1].toFixed(7)
    );
  }
  if (req.body.address) {
    hospital.address = req.body.address;
  }


  await hospital.save();

  res.status(200).json({ message: "success", result: hospital });
});

// 5- delete one hospital
const deleteHospitalLocation = catchAsyncError(async (req, res, next) => {
  const hospital = await hospitalModel.findOneAndDelete({
    hospital: req.user._id,
  });

  !hospital && next(new appError("brand not found", 404));
  hospital && res.status(200).json({ message: "success", result: hospital });
});

export {
  addHospitalLocation,
  getAllHospitalsLocations,
  getHospitalLocation,
  updateHospitalLocation,
  deleteHospitalLocation,
};
