import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { productModel } from "../../../databases/models/product.model.js";
import * as factory from "../handlers/factory.handler.js";
import { ApiFeatures, shuffleArray } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";
import { categoryModel } from "../../../databases/models/category.model.js";
import { brandModel } from "../../../databases/models/brand.model.js";
import { nanoid } from "nanoid";

// 1- add product
const addProduct = catchAsyncError(async (req, res, next) => {
  const category = await categoryModel.findById(req.body.category);
  if (!category) return next(new appError("category not found", 404));
  const brand = await brandModel.findById(req.body.brand);
  if (!brand) return next(new appError("brand not found", 404));

  const founded = await productModel.findOne({ title: req.body.title });
  if (founded)
    return next(new appError("product title is already exists", 409));

  if (Number(req.body.sold) < Number(req.body.ratingCount))
    return next(new appError("sold must be greater than rating Count", 400));

  if (!req.files || !req.files.images || !req.files.imageCover)
    return next(new appError("product images are required", 400));

  const cloudFolder =
    slugify(req.body.title.split(" ").splice(0, 2).join(" ")) + "-" + nanoid();

  const images = await factory.addImages(
    req.files.images,
    "product",
    cloudFolder
  );

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.files.imageCover[0].path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/product/${cloudFolder}`,
    }
  );

  const result = await productModel.create({
    ...req.body,
    slug: slugify(req.body.title),
    cloudFolder,
    imageCover: { id: public_id, url: secure_url },
    images,
  });

  res.status(201).json({ message: "success", result });
});

// 2- get all products
const getAllProducts = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(productModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec(); // Execute the query

  const totalProducts = await productModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not products added yet", 404));

  apiFeatures.calculateTotalAndPages(totalProducts);
  result.length &&
    res.status(200).json({
      message: "success",
      totalProducts,
      metadata: apiFeatures.metadata,
      result: shuffleArray(result),
    });
});

// 3- get one product
const getProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await productModel.findById(id);

  !result && next(new appError("product not found", 404));
  result && res.json({ message: "success", result });
});

// 4- update one product
const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let product = await productModel.findById(id);
  if (!product) return next(new appError("product not found", 404));

  const founded = await productModel.findOne({ title: req.body.title });
  if (founded)
    return next(new appError("product title is already exists", 409));
  if (req.body) {
    product = await productModel.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        new: true,
      }
    );
  }

  if (req.files.imageCover) {
    await cloudinary.api.delete_resources(product.imageCover.id);
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.files.imageCover[0].path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/product/${product.cloudFolder}`,
      }
    );
    product.imageCover = { id: public_id, url: secure_url };
  }

  if (req.files.images) {
    const ids = product.images.map((image) => image.id);
    await cloudinary.api.delete_resources(ids);
    product.images = await factory.addImages(
      req.files.images,
      "product",
      product.cloudFolder
    );
  }

  await product.save();

  res.json({ message: "success", result: product });
});

// 5- delete one product
const deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel.findByIdAndDelete(id);
  if (!product) return next(new appError("product not found", 404));

  const ids = product.images.map((image) => image.id);
  ids.push(product.imageCover.id);
  await cloudinary.api.delete_resources(ids);
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_FOLDER_NAME}/product/${product.cloudFolder}`
  );

  res.status(200).json({ message: "success", result: product });
});

export { addProduct, getAllProducts, getProduct, updateProduct, deleteProduct };
