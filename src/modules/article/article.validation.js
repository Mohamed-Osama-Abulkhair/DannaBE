import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const title = Joi.string().min(3).max(150);
const description = Joi.string().min(10).max(1500);

const createArticleSchema = Joi.object({
  title: title.required(),
  description: description.required(),
  subTitles: Joi.array().items(Joi.string().min(3).max(150).required()),
  subDescriptions: Joi.array().items(Joi.string().min(10).max(1500).required()),
});

const getArticleSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
});

const updateArticleSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  title,
  description,
  subTitles: Joi.array().items(Joi.string().min(3).max(150)),
  subDescriptions: Joi.array().items(Joi.string().min(10).max(1500)),
});

export { createArticleSchema, getArticleSchema, updateArticleSchema };
