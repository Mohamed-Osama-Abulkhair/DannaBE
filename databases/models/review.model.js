import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      trim: true,
      required: [true, "review comment is required"],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "product",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    ratings: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function () {
  this.populate("user", "userName profileImage.url");
});

export const reviewModel = mongoose.model("review", reviewSchema);
