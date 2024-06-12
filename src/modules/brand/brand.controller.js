import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { brandModel } from "../../../databases/models/brand.model.js";
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
  const apiFeatures = new ApiFeatures(brandModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalBrands = await brandModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not brands added yet", 404));

  apiFeatures.calculateTotalAndPages(totalBrands);
  result.length &&
    res.status(200).json({
      message: "success",
      totalBrands,
      metadata: apiFeatures.metadata,
      result,
    });
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
  const brand = await brandModel.findById(id);
  if (!brand) return next(new appError("brand not found", 404));

  if (req.body.name) {
    const founded = await brandModel.findOne({ name: req.body.name });
    if (founded) return next(new appError("brand name is already exists", 409));
    brand.name = req.body.name;
    brand.slug = slugify(req.body.name);
  }

  if (req.file) {
    await cloudinary.api.delete_resources(brand.logo.id);
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/brand`,
      }
    );

    brand.logo = { id: public_id, url: secure_url };
  }

  await brand.save();

  res.status(200).json({ message: "success", result: brand });
});

// 5- delete one brand
const deleteBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await brandModel.findByIdAndDelete(id);
  !result && next(new appError("brand not found", 404));
  await cloudinary.api.delete_resources(result.logo.id);
  result && res.status(200).json({ message: "success", result });
});

export { addBrand, getAllBrands, getBrand, updateBrand, deleteBrand };
