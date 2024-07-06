import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { incubationModel } from "../../../databases/models/incubation.model.js";
import { hospitalModel } from "../../../databases/models/hospital.model.js";
import Stripe from "stripe";
import { userModel } from "../../../databases/models/user.model.js";
const stripe = new Stripe(process.env.STRIPE_KEY);

// 1- add incubation
const addIncubation = catchAsyncError(async (req, res, next) => {
  if (!req.user.stripeAccountVerified) {
    try {
      const transfer = await stripe.transfers.create({
        amount: 1,
        currency: "usd",
        destination: req.user.stripeAccountId,
      });

      if (transfer) {
        await userModel.findByIdAndUpdate(req.user._id, {
          stripeAccountVerified: true,
        }).select(
          "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -emailChangedAt -__v"
        );;
      }
    } catch (error) {
      return next(
        new appError("you should add correct Stripe Account First", 404)
      );
    }
  }

  const founded = await incubationModel.findOne({
    name: req.body.name,
    hospital: req.user._id,
  });
  if (founded)
    return next(new appError("incubation name is already exists", 409));

  req.body.hospital = req.user._id;
  const result = await incubationModel.create(req.body);

  const availableIncubations = await incubationModel.countDocuments({
    hospital: req.user._id,
    empty: true,
  });

  await hospitalModel.findOneAndUpdate(
    { hospital: req.user._id },
    { availableIncubations }
  );

  res.status(201).json({ message: "success", result });
});

// 2- get all Incubations
const getAllIncubations = catchAsyncError(async (req, res, next) => {
  let apiFeatures;
  if (req.user.role == "hospital") {
    apiFeatures = new ApiFeatures(
      incubationModel.find({ hospital: req.user._id }),
      req.query
    )
      .paginate()
      .filter()
      .sort()
      .search()
      .fields();
  }

  if (req.user.role == "admin") {
    apiFeatures = new ApiFeatures(incubationModel.find(), req.query)
      .paginate()
      .filter()
      .sort()
      .search()
      .fields();
  }

  const result = await apiFeatures.mongooseQuery.exec();

  const totalIncubations = await incubationModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not Incubations added yet", 404));

  apiFeatures.calculateTotalAndPages(totalIncubations);
  result.length &&
    res.status(200).json({
      message: "success",
      totalIncubations,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get all Incubations for Hospital
const incubationsOfHospitalForUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const apiFeatures = new ApiFeatures(
    incubationModel.find({ hospital: id, empty: true }),
    req.query
  )
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalIncubations = await incubationModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not Incubations added yet", 404));

  apiFeatures.calculateTotalAndPages(totalIncubations);
  result.length &&
    res.status(200).json({
      message: "success",
      totalIncubations,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 4- get one incubation
const getIncubation = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await incubationModel.findById(id);

  !result && next(new appError("incubation not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- update one incubation
const updateIncubation = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const incubation = await incubationModel.findOne({
    _id: id,
    hospital: req.user._id,
  });

  if (!incubation)
    return next(
      new appError("incubation not found or you are not the author", 404)
    );

  if (req.body.name) {
    const founded = await incubationModel.findOne({ name: req.body.name });
    if (founded)
      return next(new appError("incubation name is already exists", 409));
    incubation.name = req.body.name;
  }

  if (req.body.empty) {
    incubation.empty = req.body.empty;
    const availableIncubations = await incubationModel.countDocuments({
      hospital: req.user._id,
      empty: true,
    });

    await hospitalModel.findOneAndUpdate(
      { hospital: req.user._id },
      { availableIncubations }
    );
  }

  if (req.body.price) {
    incubation.price = req.body.price;
  }

  await incubation.save();

  res.status(200).json({ message: "success", result: incubation });
});

// 6- delete one Incubation
const deleteIncubation = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await incubationModel.findOneAndDelete({
    _id: id,
    hospital: req.user._id,
  });

  if (!result)
    return next(
      new appError("Incubation not found or you are not the author", 404)
    );

  const availableIncubations = await incubationModel.countDocuments({
    hospital: req.user._id,
    empty: true,
  });

  await hospitalModel.findOneAndUpdate(
    { hospital: req.user._id },
    { availableIncubations }
  );

  res.status(200).json({ message: "success", result });
});

export {
  addIncubation,
  getAllIncubations,
  incubationsOfHospitalForUser,
  getIncubation,
  updateIncubation,
  deleteIncubation,
};
