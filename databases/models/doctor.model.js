import mongoose from "mongoose";

const doctorSchema = mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },

    certificate: {
      id: { type: String },
      url: { type: String },
    },
  },
  { timestamps: true }
);

doctorSchema.pre(/^find/, function () {
  this.populate("doctor", "userName profileImage.url email doctorPrice");
});

export const doctorModel = mongoose.model("doctor", doctorSchema);
