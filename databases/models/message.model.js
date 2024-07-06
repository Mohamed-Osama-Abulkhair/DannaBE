import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },

    content: { type: String },
    date: { type: Date },
    type: { type: String },
  },
  { timestamps: true }
);

messageSchema.pre(/^find/, function () {
  this.populate("author", "userName profileImage.url email");
});

export const messageModel = mongoose.model("message", messageSchema);
