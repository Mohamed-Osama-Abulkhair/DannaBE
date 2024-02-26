import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { brandModel } from "../../../databases/models/brand.model.js";
import * as factory from "../handlers/factory.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";

// 1- add brand
const addBrand = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next(new appError("brand logo is required", 400));

  let founded = await brandModel.findOne({ name: req.body.name });
  if (founded) return next(new appError("brand name is already exists", 409));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/brand`,
    }
  );

  let result = new brandModel({
    name: req.body.name,
    slug: slugify(req.body.name),
    logo: { id: public_id, url: secure_url },
  });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all Brands
const getAllBrands = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(brandModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  let result = await apiFeatures.mongooseQuery;

  !result.length && next(new appError("Not brands added yet", 404));
  result.length &&
    res
      .status(200)
      .json({ message: "success", page: apiFeatures.page, result });
});

// 3- get one brand
const getBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await brandModel.findById(id);

  !result && next(new appError("brand not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one brand
const updateBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let founded = await brandModel.findOne({ name: req.body.name });
  if (founded) return next(new appError("brand name is already exists", 409));
  let result;

  if (req.file && !req.body.name) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/brand`,
      }
    );
    result = await brandModel.findByIdAndUpdate(
      id,
      { logo: { id: public_id, url: secure_url } },
      { new: true }
    );
  } else if (!req.file && req.body.name) {
    result = await brandModel.findByIdAndUpdate(
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
    result = await brandModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        slug: slugify(req.body.name),
        logo: { id: public_id, url: secure_url },
      },
      { new: true }
    );
  } else {
    next(new appError("enter name or upload image ", 400));
  }


  !result && next(new appError("brand not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one brand
const deleteBrand = factory.deleteOne(brandModel);

export { addBrand, getAllBrands, getBrand, updateBrand, deleteBrand };
