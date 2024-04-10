import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";
import { postModel } from "../../../databases/models/post.model.js";
import { nanoid } from "nanoid";
import * as factory from "../handlers/factory.handler.js";

// 1- add post
const addPost = catchAsyncError(async (req, res, next) => {
  let result;
  if (req.files?.images) {
    const cloudFolder = nanoid();

    const images = await factory.addImages(
      req.files.images,
      "post",
      cloudFolder
    );

    result = await postModel.create({
      ...req.body,
      addedBy: req.user._id,
      cloudFolder,
      images,
    });
  } else {
    result = await postModel.create({
      ...req.body,
      addedBy: req.user._id,
    });
  }

  res.status(201).json({ message: "success", result });
});

// 2- get all posts
const getAllPosts = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(postModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalPosts = await postModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not posts added yet", 404));

  apiFeatures.calculateTotalAndPages(totalPosts);
  result.length &&
    res.status(200).json({
      message: "success",
      totalPosts,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one post
const getPost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await postModel.findById(id);

  !result && next(new appError("post not found", 404));
  result && res.json({ message: "success", result });
});

// 4- update one post
const updatePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let post = await postModel.findOne({ _id: id, addedBy: req.user._id });
  if (!post)
    return next(new appError("post not found or you are not the author", 404));

  if (req.body) {
    post = await postModel.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        new: true,
      }
    );
  }
  if (req.files.images) {
    if (post.images.length) {
      const ids = post.images.map((image) => image.id);
      await cloudinary.api.delete_resources(ids);
      post.images = await factory.addImages(
        req.files.images,
        "post",
        post.cloudFolder
      );
    } else {
      const cloudFolder = nanoid();
      const images = await factory.addImages(
        req.files.images,
        "post",
        cloudFolder
      );

      post = await postModel.findByIdAndUpdate(
        id,
        { images },
        {
          new: true,
        }
      );
    }
  }

  await post.save();

  res.json({ message: "success", result: post });
});

// 5- delete one post
const deletePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let post;
  if (req.user.role != "admin") {
    post = await postModel.findOneAndDelete({
      _id: id,
      addedBy: req.user._id,
    });
    if (!post)
      return next(new appError("post not found or you aren't the author", 404));
    if (post.images) {
      const ids = post.images.map((image) => image.id);
      await cloudinary.api.delete_resources(ids);
    }
  } else {
    post = await postModel.findByIdAndDelete(id);
    if (!post) return next(new appError("post not found", 404));
    if (post.images) {
      const ids = post.images.map((image) => image.id);
      await cloudinary.api.delete_resources(ids);
      await cloudinary.api.delete_folder(
        `${process.env.CLOUD_FOLDER_NAME}/post/${post.cloudFolder}`
      );
    }
  }

  res.status(200).json({ message: "success", result: post });
});

//  6- add like
const addLike = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const founded = await postModel.findById(id);
  if (!founded) return next(new appError("post not found", 404));

  const result = await postModel.findByIdAndUpdate(
    id,
    {
      $addToSet: { usersLiked: req.user._id },
    },
    { new: true }
  );

  result.likes = result.usersLiked.length;
  await result.save();

  res.status(200).json({
    message: "success",
    result: result.usersLiked,
    likes: result.usersLiked.length,
  });
});

//  6- remove like
const removeLike = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const founded = await postModel.findById(id);
  if (!founded) return next(new appError("post not found", 404));

  let result = await postModel.findByIdAndUpdate(
    id,
    {
      $pull: { usersLiked: req.user._id },
    },
    { new: true }
  );

  result.likes = result.usersLiked.length;
  await result.save();

  res.status(200).json({
    message: "success",
    result: result.usersLiked,
    likes: result.usersLiked.length,
  });
});

export {
  addPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  addLike,
  removeLike,
};
