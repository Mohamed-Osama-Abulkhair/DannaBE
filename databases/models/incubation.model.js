import mongoose from "mongoose";

const incubationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "incubation name required"],
      minLength: [1, "too short incubation name"],
    },

    empty: { type: Boolean, default: true },

    price: {
      type: Number,
      required: [true, "incubation price is required"],
      min: 1,
    },

    hospital: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },

  { timestamps: true }
);

incubationSchema.pre(/^find/, function () {
  this.populate("hospital", "userName profileImage.url");
});

export const incubationModel = mongoose.model("incubation", incubationSchema);
