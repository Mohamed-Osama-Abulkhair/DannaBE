import { categoryModel } from "../../../databases/models/category.model.js";
import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import * as factory from "../handlers/factory.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";

// 1- add category
const addCategory = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next(new appError("category image is required", 404));

  let founded = await categoryModel.findOne({ name: req.body.name });
  if (founded) return next(new appError("category name is already exists", 409));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
    }
  );

  let result = new categoryModel({
    name: req.body.name,
    slug: slugify(req.body.name),
    image: { id: public_id, url: secure_url },
  });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all categories
const getAllCategories = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(categoryModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  let result = await apiFeatures.mongooseQuery;

  !result.length && next(new appError("Not categories added yet", 404));
  result.length &&
    res
      .status(200)
      .json({ message: "success", page: apiFeatures.page, result });
});

// 3- get one category
const getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await categoryModel.findById(id);

  !result && next(new appError("category not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one category
const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let founded = await categoryModel.findOne({ name: req.body.name });
  if (founded) return next(new appError("category name is already exists", 409));
  let result;

  if (req.file && !req.body.name) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
      }
    );
    result = await categoryModel.findByIdAndUpdate(
      id,
      { image: { id: public_id, url: secure_url } },
      { new: true }
    );
  } else if (!req.file && req.body.name) {
    result = await categoryModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        slug: slugify(req.body.name),
      },
      {
        new: true,
      }
    );
  } else if (req.file && req.body.name) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
      }
    );
    result = await categoryModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        slug: slugify(req.body.name),
        image: { id: public_id, url: secure_url },
      },
      { new: true }
    );
  } else {
    next(new appError("enter name or upload image ", 400));
  }

  !result && next(new appError("category not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one category
const deleteCategory = factory.deleteOne(categoryModel);

export {
  addCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
