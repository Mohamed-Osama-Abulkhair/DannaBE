import { isValidObjectId } from "../../middleware/validation.js";
import Joi from "joi";

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().min(5).max(100).trim().required(),
});

const getUserSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId),
});

export { forgetPasswordSchema, getUserSchema };
