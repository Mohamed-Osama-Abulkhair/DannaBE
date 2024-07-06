import mongoose from "mongoose";

const callInvitationSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

callInvitationSchema.pre(/^find/, function () {
  this.populate("sender", "userName profileImage.url email");
  this.populate("receiver", "userName profileImage.url email");
});

export const callInvitationModel = mongoose.model(
  "callInvitation",
  callInvitationSchema
);
