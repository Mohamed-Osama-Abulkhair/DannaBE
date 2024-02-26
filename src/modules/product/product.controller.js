import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { productModel } from "../../../databases/models/product.model.js";
import * as factory from "../handlers/factory.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";
import { categoryModel } from "../../../databases/models/category.model.js";
import { brandModel } from "../../../databases/models/brand.model.js";
import { nanoid } from "nanoid";

// 1- add product
const addProduct = catchAsyncError(async (req, res, next) => {
  let category = await categoryModel.findById(req.body.category);
  if (!category) return next(new appError("category not found", 404));
  let brand = await brandModel.findById(req.body.brand);
  if (!brand) return next(new appError("brand not found", 404));

  let founded = await productModel.findOne({ title: req.body.title });
  if (founded)
    return next(new appError("product title is already exists", 409));

  if (!req.files) return next(new appError("product images are required", 400));

  if (req.body.sold < req.body.ratingCount)
    return next(new appError("sold must be greater than rating Count", 400));

  const cloudFolder = nanoid();

  const images = [];

  for (const file of req.files.images) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/product/${cloudFolder}`,
      }
    );
    images.push({ id: public_id, url: secure_url });
  }

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.files.imageCover[0].path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/product/${cloudFolder}`,
    }
  );

  let result = await productModel.create({
    ...req.body,
    slug: slugify(req.body.title),
    cloudFolder,
    imageCover: { id: public_id, url: secure_url },
    images,
  });

  res.json({ message: "success", result });
});

// 2- get all products
const getAllProducts = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(productModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  // __ execute query __
  let result = await apiFeatures.mongooseQuery;

  !result.length && next(new appError("Not products added yet", 404));
  result.length &&
    res
      .status(200)
      .json({ message: "success", page: apiFeatures.page, result });
});

// 3- get one product
const getProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await productModel.findById(id);

  !result && next(new appError("product not found", 404));
  result && res.json({ message: "success", result });
});

// 4- update one product
const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel.findById(id);
  if (!product) return next(new appError("product not found", 404));

  const founded = await productModel.findOne({ title: req.body.title });
  if (founded)
    return next(new appError("product title is already exists", 409));
  let result;
  if (req.files.imageCover && !req.files.images && req.body) {
    await cloudinary.api.delete_resources(product.imageCover.id);
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.files.imageCover[0].path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/product/${product.cloudFolder}`,
      }
    );
    if (req.body.title) {
      result = await productModel.findByIdAndUpdate(
        id,
        {
          imageCover: { id: public_id, url: secure_url },
          ...req.body,
          slug: slugify(req.body.title),
        },
        { new: true }
      );
    } else {
      result = await productModel.findByIdAndUpdate(
        id,
        { imageCover: { id: public_id, url: secure_url }, ...req.body },
        { new: true }
      );
    }
  } else if (!req.files.imageCover && req.files.images.length && req.body) {
    const ids = product.images.map((image) => image.id);
    await cloudinary.api.delete_resources(ids);
    const images = [];

    for (const file of req.files.images) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/product/${product.cloudFolder}`,
        }
      );
      images.push({ id: public_id, url: secure_url });
    }
    if (req.body.title) {
      result = await productModel.findByIdAndUpdate(
        id,
        {
          images,
          ...req.body,
          slug: slugify(req.body.title),
        },
        {
          new: true,
        }
      );
    } else {
      result = await productModel.findByIdAndUpdate(
        id,
        {
          images,
          ...req.body,
        },
        {
          new: true,
        }
      );
    }
  } else if (!req.files.imageCover && !req.files.images && req.body) {
    if (req.body.title) {
      result = await productModel.findByIdAndUpdate(
        id,
        { ...req.body, slug: slugify(req.body.title) },
        { new: true }
      );
    } else {
      result = await productModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
    }
  } else if (req.files.imageCover && req.files.images && req.body) {
    const ids = product.images.map((image) => image.id);
    ids.push(product.imageCover.id);
    await cloudinary.api.delete_resources(ids);

    const images = [];

    for (const file of req.files.images) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/product/${product.cloudFolder}`,
        }
      );
      images.push({ id: public_id, url: secure_url });
    }

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.files.imageCover[0].path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/product/${product.cloudFolder}`,
      }
    );
    if (req.body.title) {
      result = await productModel.findByIdAndUpdate(
        id,
        {
          ...req.body,
          slug: slugify(req.body.title),
          imageCover: { id: public_id, url: secure_url },
          images,
        },
        { new: true }
      );
    } else {
      result = await productModel.findByIdAndUpdate(
        id,
        {
          ...req.body,
          imageCover: { id: public_id, url: secure_url },
          images,
        },
        {
          new: true,
        }
      );
    }
  } else {
    next(
      new appError(
        "You can update image Cover and fields only or images and fields only or fields only or all together ",
        400
      )
    );
  }

  !result && next(new appError("product not found", 404));
  result && res.json({ message: "success", result });
});

// 5- delete one product
const deleteProduct = factory.deleteOne(productModel);

export { addProduct, getAllProducts, getProduct, updateProduct, deleteProduct };
