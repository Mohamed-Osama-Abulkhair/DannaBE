import mongoose from "mongoose";

const articleCommentSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      trim: true,
      required: [true, "article's comment is required"],
    },
    article: {
      type: mongoose.Types.ObjectId,
      ref: "article",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

articleCommentSchema.pre(/^find/, function () {
  this.populate("user", "userName profileImage.url role");
});

export const articleCommentModel = mongoose.model(
  "articleComment",
  articleCommentSchema
);
