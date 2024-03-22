import mongoose from "mongoose";

const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "coupon code is required"],
    },
    discount: {
      type: Number,
      required: [true, "coupon discount is required"],
      min: 0,
    },
    expires: {
      type: Date,
      required: [true, "coupon date is required"],
    },
  },
  { timestamps: true }
);

export const couponModel = mongoose.model("coupon", couponSchema);
