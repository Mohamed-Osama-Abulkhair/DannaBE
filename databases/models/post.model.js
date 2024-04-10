import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    postType: {
      type: String,
      enum: ["post", "question"],
      default: "post",
    },
    description: {
      type: String,
      minLength: [10, "too short post description"],
      maxLength: [3000, "too more post description"],
    },
    images: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    cloudFolder: {
      type: String,
      unique: [true, "post folder is unique"],
    },
    addedBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "author is required"],
    },
    usersLiked: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

postSchema.virtual("postComments", {
  ref: "postComment",
  localField: "_id",
  foreignField: "post",
});

postSchema.pre(/^find/, function () {
  this.populate("addedBy", "userName profileImage.url role");
  this.populate("usersLiked", "userName profileImage.url");
  this.populate("postComments");
});

export const postModel = mongoose.model("post", postSchema);
