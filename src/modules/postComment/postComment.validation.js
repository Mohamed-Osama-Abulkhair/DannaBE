import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const createPostCommentSchema = Joi.object({
  comment: Joi.string().min(3).max(1000).required(),
  post: Joi.string().custom(isValidObjectId).required(),
});

const getPostCommentSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
});

const updatePostCommentSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  comment: Joi.string().min(3).max(1000),
});

export {
  createPostCommentSchema,
  getPostCommentSchema,
  updatePostCommentSchema,
};
