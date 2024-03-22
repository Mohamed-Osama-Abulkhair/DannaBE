import { categoryModel } from "../../../databases/models/category.model.js";
import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";

// 1- add category
const addCategory = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next(new appError("category image is required", 400));

  const founded = await categoryModel.findOne({ name: req.body.name });
  if (founded)
    return next(new appError("category name is already exists", 409));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
    }
  );

  const result = new categoryModel({
    name: req.body.name,
    slug: slugify(req.body.name),
    image: { id: public_id, url: secure_url },
  });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all categories
const getAllCategories = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(categoryModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalCategories = await categoryModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not categories added yet", 404));

  apiFeatures.calculateTotalAndPages(totalCategories);
  result.length &&
    res.status(200).json({
      message: "success",
      totalCategories,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one category
const getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await categoryModel.findById(id);

  !result && next(new appError("category not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one category
const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findById(id);
  if (!category) return next(new appError("category not found", 404));

  if (req.body.name) {
    const founded = await categoryModel.findOne({ name: req.body.name });
    if (founded)
      return next(new appError("category name is already exists", 409));
    category.name = req.body.name;
    category.slug = slugify(req.body.name);
  }

  if (req.file) {
    await cloudinary.api.delete_resources(category.image.id);
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
      }
    );

    category.image = { id: public_id, url: secure_url };
  }

  await category.save();

  res.status(200).json({ message: "success", result: category });
});

// 5- delete one category
const deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await categoryModel.findByIdAndDelete(id);
  !result && next(new appError("category not found", 404));
  await cloudinary.api.delete_resources(result.image.id);
  result && res.status(200).json({ message: "success", result });
});

export {
  addCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
