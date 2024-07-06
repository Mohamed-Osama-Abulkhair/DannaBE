import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { childModel } from "../../../databases/models/child.model.js";
import { incubationModel } from "../../../databases/models/incubation.model.js";
import { incubationReservationModel } from "../../../databases/models/incubationReserve.model.js";
import Stripe from "stripe";
import { userModel } from "../../../databases/models/user.model.js";
import { hospitalModel } from "../../../databases/models/hospital.model.js";

const stripe = new Stripe(process.env.STRIPE_KEY);

// 1- get near hospitals of empty Incubations
const getNearHospitals = catchAsyncError(async (req, res, next) => {
  const long = parseFloat(req.body.long.toFixed(7));
  const lat = parseFloat(req.body.lat.toFixed(7));
  let distance = req.body.distance || 10000;

  const hospitals = await hospitalModel.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [long, lat],
        },
        $maxDistance: distance,
      },
    },
  });

  const nearHospitals = [];

  for (let i = 0; i < hospitals.length; i++) {
    if (hospitals[i].availableIncubations) nearHospitals.push(hospitals[i]);
  }

  !nearHospitals.length &&
    next(
      new appError(`No Incubation Available within ${distance} meters`, 404)
    );
  nearHospitals.length &&
    res.status(200).json({ message: "success", result: nearHospitals });
});

// 2- book incubation
const bookIncubationCheckOutSession = catchAsyncError(
  async (req, res, next) => {
    const ReservedIncubation = await incubationModel.findOne({
      _id: req.body.incubation,
      empty: true,
    });
    if (!ReservedIncubation)
      return next(new appError("Incubation isn't empty or not found", 404));

    const child = await childModel.findOne({
      _id: req.body.child,
      user: req.user._id,
    });
    if (!child)
      return next(new appError("child not found or he isn't your child ", 404));

    const hospital = await userModel.findById(ReservedIncubation.hospital);

    const price = ReservedIncubation.price;
    const feePercentage = 5;
    const feeAmount = (price * feePercentage) / 100;

    let session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: `Incubation Reservation for ${req.user.userName}`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: process.env.INCUBATION_SUCCESSFUL_URL,
      cancel_url: process.env.INCUBATION_CANCEL_URL,
      customer_email: req.user.email,
      client_reference_id: child._id,
      metadata: { ...req.body, type: "incubation" },
      payment_intent_data: {
        application_fee_amount: feeAmount * 100,
        transfer_data: {
          destination: hospital.stripeAccountId,
        },
      },
    });

    res.status(200).json({ message: "success", session });
  }
);

// 3- get all InCubations Reservations
const getAllIncubationsReservation = catchAsyncError(async (req, res, next) => {
  let apiFeatures;
  if (req.user.role == "user") {
    apiFeatures = new ApiFeatures(
      incubationReservationModel.find({ user: req.user._id }),
      req.query
    )
      .paginate()
      .filter()
      .sort()
      .search()
      .fields();
  }
  if (req.user.role == "hospital") {
    apiFeatures = new ApiFeatures(
      incubationReservationModel.find({ hospital: req.user._id }),
      req.query
    )
      .paginate()
      .filter()
      .sort()
      .search()
      .fields();
  }
  if (req.user.role == "admin") {
    apiFeatures = new ApiFeatures(incubationReservationModel.find(), req.query)
      .paginate()
      .filter()
      .sort()
      .search()
      .fields();
  }

  const result = await apiFeatures.mongooseQuery.exec();

  const totalIncubationReservations =
    await incubationReservationModel.countDocuments(
      apiFeatures.mongooseQuery._conditions
    );

  !result.length &&
    next(new appError("Not Incubation Reservations added yet", 404));

  apiFeatures.calculateTotalAndPages(totalIncubationReservations);
  result.length &&
    res.status(200).json({
      message: "success",
      totalIncubationReservations,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 4- get one incubation Reservation
const getIncubationReservation = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result;

  if (req.user.role == "user") {
    result = await incubationReservationModel.findOne({
      _id: id,
      user: req.user._id,
    });
  }
  if (req.user.role == "hospital") {
    result = await incubationReservationModel.findOne({
      _id: id,
      hospital: req.user._id,
    });
  }
  if (req.user.role == "admin") {
    result = await incubationReservationModel.findById(id);
  }

  !result &&
    next(new appError("Child isn't found or he isn't your child", 404));
  result && res.status(200).json({ message: "success", result });
});

export {
  getNearHospitals,
  bookIncubationCheckOutSession,
  getAllIncubationsReservation,
  getIncubationReservation,
};
