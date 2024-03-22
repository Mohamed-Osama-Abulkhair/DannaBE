import Joi from "joi";

const createWishlistSchema = Joi.object({
  product: Joi.string().hex().length(24).required(),
});

export { createWishlistSchema };
