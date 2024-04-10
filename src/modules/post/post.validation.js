import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const description = Joi.string().min(10).max(1500);
const postTypes = ["post", "question"];
const typeSchema = (validTypes) =>
  Joi.string()
    .required()
    .valid(...validTypes);

const createPostSchema = Joi.object({
  postType: typeSchema(postTypes),
  description: description.required(),
});

const getPostSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
});

const updatePostSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  description,
});

export { createPostSchema, getPostSchema, updatePostSchema };
