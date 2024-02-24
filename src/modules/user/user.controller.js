import { userModel } from "../../../databases/models/user.model.js";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import * as factory from "../handlers/factory.handler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/emails/verify.email.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

// 1- sign Up
const signUp = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  let user = await userModel.findOne({ email });
  if (user) return next(new appError("Email already exists", 409));

  if (req.user) req.body.role = "admin";
  req.body.userName = `${req.body.fName} ${req.body.lName}`;
  let result = new userModel(req.body);
  await result.save();

  sendEmail({
    subject: "Confirm your account ✔",
    verifyType: "signUpVerify",
    title: "Confirm <span>Y</span>our Account",
    email,
    text: `You 've entered ${email} as the email address for your account. click the button below to join our worldwide community.`,
    btnMessage: "Confirm",
  });
  res.status(201).json({ message: "success", result });
});

// verify Email
const verifySignUP = async (req, res, next) => {
  const { token } = req.params;
  if (!token) return next(new appError("token not provided", 498));

  let decoded = jwt.verify(token, process.env.JWT_secretKey);
  let user = await userModel.findOne({ email: decoded.email });
  if (!user) return next(new appError("invalid token", 498));

  let result = await userModel.findOneAndUpdate(
    { email: decoded.email },
    { confirmedEmail: true },
    { new: true }
  );

  res.status(201).json({ message: "success", result });
};

// 2- sign In
const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  if (email) user = await userModel.findOne({ email });

  if (user) {
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      await userModel.findByIdAndUpdate(user._id, { login: true });

      let token = jwt.sign(
        { name: user.name, userId: user._id, role: user.role },
        process.env.JWT_secretKey
      );

      return res.json({ message: "success", token });
    }
  }

  next(new appError("Incorrect email or password", 401));
});

// 3- update account
const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let user = await userModel.findById(id);
  !user && next(new appError("User not found", 404));

  let existsData;
  if (req.body.email) {
    existsData = await userModel.findOne({ email: req.body.email });
  }

  if (user && existsData)
    return next(new appError("Email already belongs to another user", 409));

  let result = await userModel.findByIdAndUpdate(id, req.body, { new: true });

  if (req.body.fName || req.body.lName) {
    let userName = user.userName.split(" ");
    if (req.body.fName && !req.body.lName) {
      console.log(req.body.fName);
      result = await userModel.findByIdAndUpdate(
        id,
        { userName: `${req.body.fName} ${userName[1]}` },
        { new: true }
      );
    } else if (!req.body.fName && req.body.lName) {
      console.log(req.body.lName);
      result = await userModel.findByIdAndUpdate(
        id,
        { userName: `${userName[0]} ${req.body.lName}` },
        { new: true }
      );
    } else {
      result = await userModel.findByIdAndUpdate(
        id,
        { userName: `${req.body.fName} ${req.body.lName}` },
        { new: true }
      );
    }
  }

  if (req.body.email) {
    result = await userModel.findByIdAndUpdate(
      id,
      { login: false, confirmedEmail: false, emailChangedAt: Date.now() },
      { new: true }
    );
  }

  !result && next(new appError("User not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- Delete account
const deleteUser = factory.deleteOne(userModel);

// 5- Get user account data
const getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await userModel.findById(id, {
    _id: 0,
    userName: 0,
    password: 0,
    passwordChangedAt: 0,
    emailChangedAt: 0,
    login: 0,
    updatedAt: 0,
    createdAt: 0,
    __v: 0,
  });

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 6- Get profile data for another user
const getAnotherUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await userModel.findById(id, {
    _id: 0,
    fName: 0,
    lName: 0,
    password: 0,
    passwordChangedAt: 0,
    emailChangedAt: 0,
    confirmedEmail: 0,
    updatedAt: 0,
    createdAt: 0,
    __v: 0,
  });

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 7- Update password
const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  req.body.passwordChangedAt = Date.now();
  let result = await userModel.findByIdAndUpdate(id, req.body, { new: true });

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 8- Forget password
const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return next(new appError("user not found", 404));

  // Generate a secure OTP (e.g., a 6-digit number)
  const OTP = Math.floor(100000 + Math.random() * 900000);

  const forgetPasswordOTPInstance = {
    otp: OTP,
    createdAt: Date.now(),
  };

  let result = await userModel.findOneAndUpdate(
    { email },
    { forgetPasswordOTP: forgetPasswordOTPInstance },
    { new: true }
  );

  sendEmail({
    subject: "Reset Your Password ✔",
    verifyType: "forgetPasswordVerify",
    title: "Your OTP code",
    email,
    text: "To reset your password, use the OTP code :",
    btnMessage: `${OTP}`,
  });

  res.status(201).json({ message: "success", result });
});

// verify Forget Password
const verifyForgetPassword = async (req, res, next) => {
  const { email, newPassword, otpCode } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return next(new appError("user not found", 404));

  const otpExpirationTime = 300000; // 5 minutes in milliseconds

  if (
    otpCode != user.forgetPasswordOTP.otp ||
    Date.now() - user.forgetPasswordOTP.createdAt.getTime() > otpExpirationTime
  )
    return next(new appError("wrong email or invalid , expired OTP", 498));

  const result = await userModel.findOneAndUpdate(
    { email },
    { password: newPassword ,login:false},
    { new: true }
  );

  res.status(201).json({ message: "Success", result });
};

// 10- Get All users
const getAllUser = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(userModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  // __ execute query __
  let result = await apiFeatures.mongooseQuery;

  !result.length && next(new appError("Not users added yet", 404));
  result.length &&
    res.json({ message: "success", page: apiFeatures.page, result });
});

// 11- Log Out
const logOut = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await userModel.findByIdAndUpdate(
    id,
    { login: false, loginChangedAt: Date.now() },
    { new: true }
  );
  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

export {
  signUp,
  verifySignUP,
  signIn,
  updateUser,
  deleteUser,
  getUser,
  getAnotherUser,
  changeUserPassword,
  forgetPassword,
  verifyForgetPassword,
  getAllUser,
  logOut,
};
