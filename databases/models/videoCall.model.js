import mongoose from "mongoose";

const videoCallSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    child: {
      type: mongoose.Types.ObjectId,
      ref: "child",
      required: true,
    },
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

videoCallSchema.pre(/^find/, function () {
  this.populate("user", "userName profileImage.url email");
  this.populate("doctor", "userName profileImage.url email");
  this.populate("child");
});

export const videoCallModel = mongoose.model("videoCall", videoCallSchema);
