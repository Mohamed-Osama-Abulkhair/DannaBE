import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const userRoles = ["user", "doctor", "hospital"];
const idSchema = Joi.string().custom(isValidObjectId);
const nameSchema = Joi.string().min(3).max(50).trim().required();
const emailSchema = Joi.string().email().min(5).max(100).trim().required();
const passwordSchema = Joi.string()
  .min(8)
  .max(30)
  .required()
  .trim()
  .replace(/\s/g, "")
  .pattern(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[a-zA-Z])\S{8,30}$/,
    "password should be between 8 and 30 characters and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
  );
// const phoneSchema = Joi.string()
//   .length(11)
//   .pattern(new RegExp("^(012|010|011|015)\\d{8}$"), "egyptian numbers only");
const roleSchema = (validRoles) =>
  Joi.string()
    .required()
    .valid(...validRoles);

const createUserSchema = Joi.object({
  fName: nameSchema,
  lName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  // phone: phoneSchema,
  role: roleSchema(userRoles),
});

const createAdminSchema = Joi.object({
  fName: nameSchema,
  lName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  // phone: phoneSchema,
});

const loginSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

const getUserSchema = Joi.object({
  id: idSchema,
});

const updateUserSchema = Joi.object({
  id: idSchema,
  fName: Joi.string().min(3).max(20),
  lName: Joi.string().min(3).max(20),
  email: Joi.string().email().min(5).max(100),
  // phone: phoneSchema,
});

const changePasswordSchema = Joi.object({
  id: idSchema,
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

const forgetPasswordSchema = Joi.object({
  email: emailSchema,
});

const verForgetPasswordSchema = Joi.object({
  email: emailSchema,
  newPassword: passwordSchema,
  otpCode: Joi.string()
    .length(6)
    .required()
    .pattern(/^\d{6}$/, "6 numbers only"),
});

export {
  createUserSchema,
  createAdminSchema,
  loginSchema,
  getUserSchema,
  updateUserSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  verForgetPasswordSchema,
};
