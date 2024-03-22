import { userModel } from "../../../databases/models/user.model.js";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/emails/verify.email.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";

// 1- sign Up
const signUp = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (user) return next(new appError("Email already exists", 409));

  if (req.user?.role == "admin") req.body.role = "admin";
  req.body.userName = `${req.body.fName} ${req.body.lName}`;
  const result = new userModel(req.body);
  await result.save();

  sendEmail({
    subject: "Confirm your account ✔",
    verifyType: "signUpVerify",
    title: "Confirm <span>Y</span>our Account",
    email,
    text: `You 've entered ${email} as the email address for your account. click the button below to join our worldwide community.`,
    btnMessage: "Confirm",
  });
  res.status(201).json({ message: "success" });
});

// verify Email
const verifySignUP = async (req, res, next) => {
  const { token } = req.params;
  if (!token) return next(new appError("token not provided", 498));

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
  const user = await userModel.findOne({ email: decoded.email });
  if (!user) return next(new appError("invalid token", 498));

  const result = await userModel
    .findOneAndUpdate(
      { email: decoded.email },
      { confirmedEmail: true },
      { new: true }
    )
    .select(
      "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -emailChangedAt -__v"
    );

  res.status(201).json({ message: "success", result });
};

// 2- sign In
const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return next(new appError("incorrect email or password", 401));
  const match = await bcrypt.compare(password, user.password);

  if (match) {
    const token = jwt.sign(
      { name: user.userName, userId: user._id, role: user.role },
      process.env.JWT_secretKey
    );

    user = await userModel.findOneAndUpdate(
      { email },
      { login: true },
      { new: true }
    );
    return res.json({ message: "success", token });
  }
  next(new appError("incorrect email or password", 401));
});

// 3- update account
const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel
    .findById(id)
    .select(
      "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -__v"
    );
  if (!user) return next(new appError("user not found", 404));

  if (req.body.email) {
    const existsData = await userModel.findOne({ email: req.body.email });
    if (existsData)
      return next(new appError("Email already belongs to another user", 409));

    user.email = req.body.email;
    user.login = false;
    user.confirmedEmail = false;
    user.emailChangedAt = Date.now();

    sendEmail({
      subject: "Confirm your changed Email ✔",
      verifyType: "signUpVerify",
      title: "Confirm <span>Y</span>our Account",
      email: req.body.email,
      text: `You 've entered ${req.body.email} as the email address for your account. click the button below to join our worldwide community.`,
      btnMessage: "Confirm",
    });
  } else {
    const userName = user.userName.split(" ");
    if (req.body.fName && !req.body.lName) {
      user.fName = req.body.fName;
      user.userName = `${req.body.fName} ${userName[1]}`;
    }
    if (!req.body.fName && req.body.lName) {
      user.lName = req.body.lName;
      user.userName = `${userName[0]} ${req.body.lName}`;
    }
    if (req.body.fName && req.body.lName) {
      user.fName = req.body.fName;
      user.lName = req.body.lName;
      user.userName = `${req.body.fName} ${req.body.lName}`;
    }
  }

  await user.save();
  res.status(200).json({ message: "success" });
});

// 4- Delete account
const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await userModel.findByIdAndDelete(id);
  if (result.profileImage)
    await cloudinary.api.delete_resources(result.profileImage.id);

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- Get user account data
const getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await userModel
    .findById(id)
    .select(
      "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -emailChangedAt -__v"
    );

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 6- Get profile data for another user
const getAnotherUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await userModel
    .findById(id)
    .select(
      "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -emailChangedAt -addresses -wishlist -__v"
    );

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 7- Update password
const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const match = await bcrypt.compare(oldPassword, req.user.password);
  if (!match) return next(new appError("incorrect password", 401));

  const result = await userModel.findByIdAndUpdate(
    req.user.id,
    { password: newPassword, passwordChangedAt: Date.now() },
    { new: true }
  );

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success" });
});

// 8- Forget password
const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return next(new appError("user not found", 404));

  // Generate a secure OTP (e.g., a 6-digit number)
  const OTP = Math.floor(100000 + Math.random() * 900000);

  const forgetPasswordOTPInstance = {
    otp: OTP,
    createdAt: Date.now(),
  };

  const result = await userModel.findOneAndUpdate(
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

  res.status(201).json({ message: "success" });
});

// verify Forget Password
const verifyForgetPassword = async (req, res, next) => {
  const { email, newPassword, otpCode } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return next(new appError("user not found", 404));

  const otpExpirationTime = 300000; // 5 minutes in milliseconds

  if (
    otpCode != user.forgetPasswordOTP.otp ||
    Date.now() - user.forgetPasswordOTP.createdAt.getTime() > otpExpirationTime
  )
    return next(new appError("wrong email or invalid , expired OTP", 401));

  const forgetPasswordOTP = {
    createdAt: user.forgetPasswordOTP.createdAt.getTime() - 300000,
  };

  const result = await userModel.findOneAndUpdate(
    { email },
    {
      password: newPassword,
      login: false,
      passwordChangedAt: Date.now(),
      forgetPasswordOTP,
    },
    { new: true }
  );

  res.status(201).json({ message: "Success" });
};

// 10- Get All users
const getAllUsers = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    userModel
      .find()
      .select(
        "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -emailChangedAt -__v -wishlist -addresses"
      ),
    req.query
  )
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalUsers = await userModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not users added yet", 404));

  apiFeatures.calculateTotalAndPages(totalUsers);
  result.length &&
    res.status(200).json({
      message: "success",
      totalUsers,
      metadata: apiFeatures.metadata,
      result,
    });
});

//11- upload user profile Image
const uploadProfileImage = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next(new appError(" profile image is required", 400));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/user`,
    }
  );

  if (req.user.profileImage)
    await cloudinary.api.delete_resources(req.user.profileImage.id);

  const result = await userModel
    .findByIdAndUpdate(
      req.user.id,
      { profileImage: { id: public_id, url: secure_url } },
      { new: true }
    )
    .select(
      "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -emailChangedAt -__v"
    );

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 12- Log Out
const logOut = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await userModel.findByIdAndUpdate(
    id,
    { login: false, loginChangedAt: Date.now() },
    { new: true }
  );
  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success" });
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
  getAllUsers,
  uploadProfileImage,
  logOut,
};
