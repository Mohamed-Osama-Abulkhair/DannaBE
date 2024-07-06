import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import Stripe from "stripe";
import { userModel } from "../../../databases/models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_KEY);

// 1 - add Friend
const inviteFriend = catchAsyncError(async (req, res, next) => {
  const email = req.body.email.toLowerCase();

  if (email == req.user.email)
    return next(new appError("you can't send invite to yourself", 409));

  const targetUser = await userModel.findOne({ email });
  if (
    !targetUser ||
    targetUser.role == "admin" ||
    targetUser.role == "hospital"
  )
    return next(
      new appError("user not found or he can't receive your invitation", 404)
    );

  const invitation = await callInvitationModel.findOne({
    sender: req.user._id,
    receiver: targetUser._id,
  });
  if (invitation)
    return next(new appError("Invitation has been Already sent", 409));

  const usersAlreadyFriends = targetUser.friends.find(
    (friendId) => friendId.toString() === req.user._id.toString()
  );
  if (usersAlreadyFriends)
    return next(new appError("Friend already exists", 409));

  const newInvitation = await callInvitationModel.create({
    sender: req.user._id,
    receiver: targetUser._id,
  });

  doctorsUpdate.updateDoctorsPendingInvitations(targetUser._id);

  res.status(201).json({ message: "success" });
});

// 15 - accept add Friend
const acceptAddFriend = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  const invitation = await callInvitationModel.findById(id);
  if (!invitation) next(new appError("Invitation not found", 404));

  const senderUser = await userModel
    .findById(invitation.sender)
    .select(
      "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -__v"
    );

  const receiverUser = await userModel
    .findById(invitation.receiver)
    .select(
      "-password -forgetPasswordOTP -passwordChangedAt -loginChangedAt -__v"
    );

  senderUser.friends = [...senderUser.friends, receiverUser._id];
  receiverUser.friends = [...receiverUser.friends, senderUser._id];

  await senderUser.save();
  await receiverUser.save();
  await callInvitationModel.findByIdAndDelete(id);

  doctorsUpdate.updateDoctors(senderUser._id);
  doctorsUpdate.updateDoctors(receiverUser._id);

  doctorsUpdate.updateDoctorsPendingInvitations(receiverUser._id);
  res.status(200).json({ message: "success" });
});

// 16 - reject add Friend
const rejectAddFriend = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  const invitation = await callInvitationModel.findByIdAndDelete(id);
  if (!invitation)
    return next(new appError("friend Invitation not found", 404));

  doctorsUpdate.updateDoctorsPendingInvitations(req.user._id);

  res.status(200).json({ message: "success" });
});
export {
  inviteFriend,
  acceptAddFriend,
  rejectAddFriend,
};
