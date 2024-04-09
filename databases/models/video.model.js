import mongoose from "mongoose";

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: [true, "video title is unique"],
      trim: true,
      required: [true, "video title is required"],
      minLength: [3, "too short video title"],
      maxLength: [150, "too more video title"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      required: [true, "video description is required"],
      minLength: [10, "too short video description"],
      maxLength: [1500, "too more video description"],
    },
    videoCover: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    video: {
      type: String,
      trim: true,
      required: [true, "video link is required"],
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
  },
  { timestamps: true }
);

videoSchema.pre(/^find/, function () {
  this.populate("usersLiked", "userName profileImage.url");
});

export const videoModel = mongoose.model("video", videoSchema);
