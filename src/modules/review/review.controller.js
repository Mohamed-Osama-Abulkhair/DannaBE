import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { reviewModel } from "../../../databases/models/review.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { productModel } from "../../../databases/models/product.model.js";

// 1- add Review
const addReview = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user._id;
  
  const product = await productModel.findById(req.body.product);
  if (!product) return next(new appError("Product not found", 404));

  const review = await reviewModel.findOne({
    user: req.user._id,
    product: req.body.product,
  });
  if (review) return next(new appError("you created a review before", 409));
  
  const result = new reviewModel(req.body);
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all Reviews
const getAllReviews = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(reviewModel.find(), req.query)
  .paginate()
  .filter()
  .sort()
  .search()
  .fields();

const result = await apiFeatures.mongooseQuery.exec();

const totalReviews = await reviewModel.countDocuments(
  apiFeatures.mongooseQuery._conditions
);

!result.length && next(new appError("Not reviews added yet", 404));

apiFeatures.calculateTotalAndPages(totalReviews);
result.length &&
  res.status(200).json({
    message: "success",
    totalReviews,
    metadata: apiFeatures.metadata,
    result,
  });
});

// 3- get one Review
const getReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await reviewModel.findById(id);

  !result && next(new appError("Review not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one Review
const updateReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await reviewModel.findOneAndUpdate(
    { _id: id, user: req.user.id },
    req.body,
    { new: true }
  );

  !result &&
    next(
      new appError(
        "Review not found or U aren't authorized to do this action",
        404
      )
    );
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one Review
const deleteReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result;

  if (req.user.role == "user") {
    result = await reviewModel.findOneAndDelete({ _id: id, user: req.user.id });
  }

  if (req.user.role == "admin") {
    result = await reviewModel.findByIdAndDelete(id);
  }

  !result &&
    next(
      new appError(
        "Review not found or U aren't authorized to do this action",
        404
      )
    );
  result && res.status(200).json({ message: "success", result });
});

export { addReview, getAllReviews, getReview, updateReview, deleteReview };
