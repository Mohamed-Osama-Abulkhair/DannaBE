import Joi from "joi";

const createReviewSchema = Joi.object({
  comment: Joi.string().min(10).max(150).required(),
  product: Joi.string().hex().length(24).required(),
  ratings: Joi.number().integer().min(0).max(5).required(),
});

const getReviewSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateReviewSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  comment: Joi.string().min(3).max(150),
  ratings: Joi.number().integer().min(0).max(5),
});

export { createReviewSchema, getReviewSchema, updateReviewSchema };
