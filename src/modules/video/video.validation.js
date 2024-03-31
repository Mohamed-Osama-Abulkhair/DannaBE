import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const title = Joi.string().min(3).max(150);
const description = Joi.string().min(10).max(1500);
const video = Joi.string().uri({ scheme: ["http", "https"] });

const createVideoSchema = Joi.object({
  title: title.required(),
  description: description.required(),
  video: video.required(),
});

const getVideoSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
});

const updateVideoSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  title,
  description,
  video,
});

export { createVideoSchema, getVideoSchema, updateVideoSchema };
