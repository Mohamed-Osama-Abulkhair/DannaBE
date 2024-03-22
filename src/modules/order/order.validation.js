import Joi from "joi";

const createOrderSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  shippingAddress: {
    city: Joi.string().min(3).max(20).required(),
    street: Joi.string().min(3).max(20).required(),
    phone: Joi.string()
    .length(11)
    .required()
    .pattern(new RegExp("^(012|010|011|015)\\d{8}$"), "egyptian numbers only"),
  },
});



export { createOrderSchema };
