import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";
import { articleModel } from "../../../databases/models/article.model.js";

// 1- add article
const addArticle = catchAsyncError(async (req, res, next) => {
  const founded = await articleModel.findOne({ title: req.body.title });
  if (founded)
    return next(new appError("article title is already exists", 409));

  if (!req.file) return next(new appError("article cover is required", 400));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/article`,
    }
  );

  const result = await articleModel.create({
    ...req.body,
    slug: slugify(req.body.title),
    addedBy: req.user._id,
    articleCover: { id: public_id, url: secure_url },
  });

  res.status(201).json({ message: "success", result });
});

// 2- get all articles
const getAllArticles = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(articleModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalArticles = await articleModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not articles added yet", 404));

  apiFeatures.calculateTotalAndPages(totalArticles);
  result.length &&
    res.status(200).json({
      message: "success",
      totalArticles,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one article
const getArticle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await articleModel.findById(id);

  !result && next(new appError("article not found", 404));
  result && res.json({ message: "success", result });
});

// 4- update one article
const updateArticle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let article = await articleModel.findOne({ _id: id, addedBy: req.user._id });
  if (!article)
    return next(
      new appError("article not found or you are not the author", 404)
    );

  const founded = await articleModel.findOne({ title: req.body.title });
  if (founded)
    return next(new appError("article title is already exists", 409));
  if (req.body) {
    if (req.body.title) {
      article = await articleModel.findByIdAndUpdate(
        id,
        { ...req.body, slug: slugify(req.body.title) },
        {
          new: true,
        }
      );
    } else {
      article = await articleModel.findByIdAndUpdate(
        id,
        { ...req.body },
        {
          new: true,
        }
      );
    }
  }

  if (req.file) {
    await cloudinary.api.delete_resources(article.articleCover.id);
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/article`,
      }
    );
    article.articleCover = { id: public_id, url: secure_url };
  }

  await article.save();

  res.json({ message: "success", result: article });
});

// 5- delete one article
const deleteArticle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const article = await articleModel.findOneAndDelete({
    _id: id,
    addedBy: req.user._id,
  });
  if (!article)
    return next(
      new appError("article not found or you aren't the author", 404)
    );
  await cloudinary.api.delete_resources(article.articleCover.id);

  res.status(200).json({ message: "success", result: article });
});

//  6- add like
const addLike = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const founded = await articleModel.findById(id);
  if (!founded) return next(new appError("article not found", 404));

  const result = await articleModel.findByIdAndUpdate(
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
  const founded = await articleModel.findById(id);
  if (!founded) return next(new appError("article not found", 404));

  let result = await articleModel.findByIdAndUpdate(
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
  addArticle,
  getAllArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  addLike,
  removeLike,
};
