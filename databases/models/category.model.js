import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "name must be unique"],
      trim: true,
      required: true,
      minLength: [3, "too short category name"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    image: {
      id: { type: String },
      url: { type: String },
    },
  },
  { timestamps: true }
);

export const categoryModel = mongoose.model("category", categorySchema);
