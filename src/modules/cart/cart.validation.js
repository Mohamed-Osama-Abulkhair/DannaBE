import Joi from "joi";

const createCartSchema = Joi.object({
  product: Joi.string().hex().length(24).required(),
  quantity: Joi.number().min(1),
});

const getCartSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateCartSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  quantity: Joi.number().min(1).required(),
});

const applyCouponCartSchema = Joi.object({
  code: Joi.string().length(6).required(),
});

export {
  createCartSchema,
  getCartSchema,
  updateCartSchema,
  applyCouponCartSchema,
};
