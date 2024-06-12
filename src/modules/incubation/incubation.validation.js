import Joi from "joi";

const createIncubationSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  empty: Joi.boolean(),
  price: Joi.number().min(1).required(),
});

const getIncubationSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateIncubationSchema = Joi.object({
  name: Joi.string().min(2).max(30),
  empty: Joi.boolean(),
  price: Joi.number().min(1),
  id: Joi.string().hex().length(24).required(),
});

export { createIncubationSchema, getIncubationSchema, updateIncubationSchema };
