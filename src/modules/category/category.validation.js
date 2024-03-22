import Joi from "joi";

const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
});

const getCategorySchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(30),
  id: Joi.string().hex().length(24).required(),
});

export { createCategorySchema, getCategorySchema, updateCategorySchema };
