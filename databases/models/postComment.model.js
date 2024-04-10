import mongoose from "mongoose";

const postCommentSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      trim: true,
      required: [true, "post's comment is required"],
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: "post",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

postCommentSchema.pre(/^find/, function () {
  this.populate("user", "userName profileImage.url role");
});

export const postCommentModel = mongoose.model(
  "postComment",
  postCommentSchema
);
