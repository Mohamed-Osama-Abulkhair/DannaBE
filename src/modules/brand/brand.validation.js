import Joi from "joi";

const createBrandSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
});

const getBrandSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateBrandSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  id: Joi.string().hex().length(24).required(),
});

export { createBrandSchema, getBrandSchema, updateBrandSchema };
