import jwt from "jsonwebtoken";
import { userModel } from "../../databases/models/user.model.js";
import { appError } from "../utils/appError.js";
import { catchAsyncError } from "./catchAsyncError.js";

const protectRoutes = catchAsyncError(async (req, res, next) => {
  const { token } = req.headers;
  if (!token) return next(new appError("token not provided", 400));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_secretKey);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new appError("invalid token", 401));
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  const user = await userModel.findById(decoded.userId);
  if (!user)
    return next(new appError("deleted user , old or invalid token", 498));

  if (user.passwordChangedAt) {
    const passwordChangedDate = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (passwordChangedDate > decoded.iat)
      return next(new appError("old or invalid token", 498));
  }

  if (user.emailChangedAt) {
    const emailChangedDate = parseInt(user.emailChangedAt.getTime() / 1000);
    if (emailChangedDate > decoded.iat)
      return next(new appError("old or invalid token", 498));
  }

  if (user.loginChangedAt) {
    const loginChangedDate = parseInt(user.loginChangedAt.getTime() / 1000);
    if (loginChangedDate > decoded.iat)
      return next(new appError("old or invalid token", 498));
  }

  req.user = user;
  next();
});

const authorization = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // need to update with doctor and hospitals

  if (String(id) !== String(req.user._id))
    return next(new appError("U r not authorized to do it ", 401));

  next();
});

const allowedTo = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new appError("U r not authorized to access, U r " + req.user.role, 401)
      );
    next();
  });
};

const isConfirmed = catchAsyncError(async (req, res, next) => {
  if (!req.user.confirmedEmail)
    return next(new appError("you should confirm your account first", 401));
  next();
});

export { protectRoutes, authorization, allowedTo, isConfirmed };
