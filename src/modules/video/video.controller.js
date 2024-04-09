import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";
import { videoModel } from "../../../databases/models/video.model.js";

// 1- add video
const addVideo = catchAsyncError(async (req, res, next) => {
  const founded = await videoModel.findOne({ title: req.body.title });
  if (founded) return next(new appError("video title is already exists", 409));

  if (!req.file) return next(new appError("video cover is required", 400));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/video`,
    }
  );

  const result = await videoModel.create({
    ...req.body,
    slug: slugify(req.body.title),
    videoCover: { id: public_id, url: secure_url },
  });

  res.status(201).json({ message: "success", result });
});

// 2- get all videos
const getAllVideos = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(videoModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalVideos = await videoModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not videos added yet", 404));

  apiFeatures.calculateTotalAndPages(totalVideos);
  result.length &&
    res.status(200).json({
      message: "success",
      totalVideos,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one video
const getVideo = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await videoModel.findById(id);

  !result && next(new appError("video not found", 404));
  result && res.json({ message: "success", result });
});

// 4- update one video
const updateVideo = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let video = await videoModel.findById(id);
  if (!video) return next(new appError("video not found", 404));

  const founded = await videoModel.findOne({ title: req.body.title });
  if (founded) return next(new appError("video title is already exists", 409));
  if (req.body) {
    if (req.body.title) {
      video = await videoModel.findByIdAndUpdate(
        id,
        { ...req.body, slug: slugify(req.body.title) },
        {
          new: true,
        }
      );
    } else {
      video = await videoModel.findByIdAndUpdate(
        id,
        { ...req.body },
        {
          new: true,
        }
      );
    }
  }

  if (req.file) {
    await cloudinary.api.delete_resources(video.videoCover.id);
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/video`,
      }
    );
    video.videoCover = { id: public_id, url: secure_url };
  }

  await video.save();

  res.json({ message: "success", result: video });
});

// 5- delete one video
const deleteVideo = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const video = await videoModel.findByIdAndDelete(id);
  if (!video) return next(new appError("video not found", 404));
  await cloudinary.api.delete_resources(video.videoCover.id);

  res.status(200).json({ message: "success", result: video });
});

//  6- add like
const addLike = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const founded = await videoModel.findById(id);
  if (!founded) return next(new appError("video not found", 404));

  const result = await videoModel.findByIdAndUpdate(
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
  const founded = await videoModel.findById(id);
  if (!founded) return next(new appError("video not found", 404));

  let result = await videoModel.findByIdAndUpdate(
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
  addVideo,
  getAllVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  addLike,
  removeLike,
};
