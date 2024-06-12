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
  const { long, lat } = req.body;
  let distance = req.body.distance || 10000;

  let query = hospitalModel.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [long, lat],
        },
        $maxDistance: distance,
      },
    },
    availableIncubations: true,
  });

  const initialResult = await query.exec();

  const apiFeatures = new ApiFeatures(
    hospitalModel.find({ _id: { $in: initialResult.map((h) => h._id) } }),
    req.query
  )
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalNearHospitals = result.length;

  if (!totalNearHospitals) {
    return next(
      new appError(`No Incubation Available within ${distance} meters`, 404)
    );
  }

  apiFeatures.calculateTotalAndPages(totalNearHospitals);

  res.status(200).json({
    message: "success",
    totalNearHospitals,
    metadata: apiFeatures.metadata,
    result,
  });
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
    req.body.user = req.user._id;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: "egp",
      payment_method_types: ["card"],
      application_fee_amount: feeAmount * 100,
      transfer_data: {
        destination: hospital.stripeAccountId,
      },
      metadata: req.body,
    });

    res
      .status(200)
      .json({ message: "success", clientSecret: paymentIntent.client_secret });
  }
);

const bookIncubationOnline = catchAsyncError(
  async (request, response, next) => {
    const sig = request.headers["stripe-signature"].toString();
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        process.env.INCUBATION_SECRET
      );
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type == "payment_intent.succeeded")
      return await handleCheckoutEvent(event.data.object, response, next);

    return next(new appError("Event type not handled", 400));
  }
);

async function handleCheckoutEvent(e, res, next) {
  const incubation = await incubationModel.findById(e.metadata.incubation);

  const result = await incubationReservationModel.create({
    hospital: incubation.hospital,
    ...e.metadata,
  });

  incubation.empty = false;
  await incubation.save();

  const availableIncubations = await incubationModel.countDocuments({
    hospital: incubation.hospital,
    empty: true,
  });

  await hospitalModel.findOneAndUpdate(
    { hospital: incubation.hospital },
    { availableIncubations }
  );

  res.status(201).json({ message: "success", result });
}

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
  bookIncubationOnline,
  getAllIncubationsReservation,
  getIncubationReservation,
};
