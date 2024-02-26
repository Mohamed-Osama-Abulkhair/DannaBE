import mongoose from "mongoose";

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "name is required"],
      trim: true,
      required: true,
      minLength: [3, "too short brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    logo: {
      id: { type: String },
      url: { type: String },
    },
  },
  { timestamps: true }
);

export const brandModel = mongoose.model("brand", brandSchema);
