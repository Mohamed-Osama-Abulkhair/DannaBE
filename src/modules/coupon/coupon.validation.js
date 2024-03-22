import Joi from "joi";

const createCouponSchema = Joi.object({
  code: Joi.string().length(6).lowercase().required(),
  discount: Joi.number().integer().min(0).max(100).required(),
  expires: Joi.date().greater(Date.now()).required(),
});

const getCouponSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateCouponSchema = Joi.object({
  code: Joi.string().length(6).lowercase(),
  discount: Joi.number().integer().min(0).max(100),
  expires: Joi.date().greater(Date.now()),
  id: Joi.string().hex().length(24).required(),
});

export { createCouponSchema, getCouponSchema, updateCouponSchema };
