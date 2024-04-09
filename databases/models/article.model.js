import mongoose from "mongoose";

const articleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: [true, "article title is unique"],
      trim: true,
      required: [true, "article title is required"],
      minLength: [3, "too short article title"],
      maxLength: [150, "too more article title"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      required: [true, "article description is required"],
      minLength: [10, "too short article description"],
      maxLength: [1500, "too more article description"],
    },
    subTitles: [
      {
        type: String,
        trim: true,
        required: [true, "article title is required"],
        minLength: [3, "too short article title"],
        maxLength: [150, "too more article title"],
      },
    ],
    subDescriptions: [
      {
        type: String,
        required: [true, "article description is required"],
        minLength: [10, "too short article description"],
        maxLength: [1500, "too more article description"],
      },
    ],
    articleCover: {
      id: { type: String, required: true },
      url: { type: String, required: true },
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

articleSchema.virtual("articleComments", {
  ref: "articleComment",
  localField: "_id",
  foreignField: "article",
});

articleSchema.pre(/^find/, function () {
  this.populate("addedBy", "userName profileImage.url role");
  this.populate("usersLiked", "userName profileImage.url");
  this.populate("articleComments");
});

export const articleModel = mongoose.model("article", articleSchema);
