import mongoose from "mongoose";

const conversationSchema = mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],

    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "message",
      },
    ],
  },
  { timestamps: true }
);

conversationSchema.pre(/^find/, function () {
  this.populate("participants", "userName profileImage.url email");
  this.populate("messages");
});

export const conversationModel = mongoose.model(
  "conversation",
  conversationSchema
);
