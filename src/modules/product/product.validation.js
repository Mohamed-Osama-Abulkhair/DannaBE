import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const title = Joi.string().min(3).max(50);
const description = Joi.string().min(10).max(500);
const quantity = Joi.number().integer().min(1);
const sold = Joi.number().min(0);
const price = Joi.number().integer().min(1);
const discount = Joi.number().integer().min(1).max(100);
// const category = Joi.string().hex().length(24);
// const brand = Joi.string().hex().length(24);
const category = Joi.string().custom(isValidObjectId);
const brand = Joi.string().custom(isValidObjectId);
const ratingAvg = Joi.number().min(1);
const ratingCount = Joi.number().min(1);

const createProductSchema = Joi.object({
  title: title.required(),
  description: description.required(),
  quantity: quantity.required(),
  sold: sold.required(),
  price: price.required(),
  discount,
  category: category.required(),
  brand: brand.required(),
  ratingAvg: ratingAvg.required(),
  ratingCount: ratingCount.required(),
});

const getProductSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required()
});

const updateProductSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  title,
  description,
  quantity,
  price,
  discount,
  category,
  brand,
});

export { createProductSchema, getProductSchema, updateProductSchema };
