import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const createArticleCommentSchema = Joi.object({
  comment: Joi.string().min(3).max(1000).required(),
  article: Joi.string().custom(isValidObjectId).required(),
});

const getArticleCommentSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
});

const updateArticleCommentSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  comment: Joi.string().min(3).max(1000),
  article: Joi.string().custom(isValidObjectId).required(),
});

export {
  createArticleCommentSchema,
  getArticleCommentSchema,
  updateArticleCommentSchema,
};
