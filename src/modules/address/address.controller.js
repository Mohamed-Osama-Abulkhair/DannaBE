import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { userModel } from "../../../databases/models/user.model.js";
import { appError } from "../../utils/appError.js";

const addAddress = catchAsyncError(async (req, res, next) => {
  const userAd = await userModel.findOne({ _id: req.user._id });

  for (let i = 0; i < userAd.addresses.length; i++) {
    if (
      userAd.addresses[i].street == req.body.street &&
      userAd.addresses[i].city == req.body.city
    ) {
      return next(new appError("address is already exists", 404));
    }
  }

  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { addresses: req.body } },
    { new: true }
  );

  res.status(200).json({ message: "success", result: result.addresses });
});

const removeAddress = catchAsyncError(async (req, res, next) => {
  const userAd = await userModel.findOne({ _id: req.user._id });

  for (let i = 0; i < userAd.addresses.length; i++) {
    if (userAd.addresses[i].id.toString() == req.body.address.toString()) {
      const result = await userModel.findByIdAndUpdate(
        req.user._id,
        { $pull: { addresses: { _id: req.body.address } } },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "success", result: result.addresses });
    }
  }

  next(new appError("address not found", 404));
});

const getAllAddress = catchAsyncError(async (req, res, next) => {
  const result = await userModel.findOne({ _id: req.user._id });

  res.status(200).json({ message: "success", result: result.addresses });
});

export { addAddress, removeAddress, getAllAddress };
