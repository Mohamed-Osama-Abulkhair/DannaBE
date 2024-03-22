import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { userModel } from "../../../databases/models/user.model.js";
import { productModel } from "../../../databases/models/product.model.js";

const addToWishlist = catchAsyncError(async (req, res, next) => {
  const { product } = req.body;
  const founded = await productModel.findById(product);
  if (!founded) return next(new appError("product not found", 404));

  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: product } },
    { new: true }
  );

  res.status(200).json({ message: "success", result: result.wishlist });
});

const removeFromWishlist = catchAsyncError(async (req, res, next) => {
  const { product } = req.body;
  const founded = await productModel.findById(product);
  if (!founded) return next(new appError("product not found", 404));

  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: product } },
    { new: true }
  );

  res.status(200).json({ message: "success", result: result.wishlist });
});

const getAllUserWishlist = catchAsyncError(async (req, res, next) => {
  const result = await userModel
    .findOne({ _id: req.user._id })
    .populate("wishlist");

  res.status(200).json({ message: "success", result: result.wishlist });
});

export { addToWishlist, removeFromWishlist, getAllUserWishlist };
