import express from "express";
import * as userController from "./user.controller.js";
import {
  allowedTo,
  authorization,
  isConfirmed,
  protectRoutes,
} from "../../middleware/protectFuns.js";
import {
  changePasswordSchema,
  createAdminSchema,
  createUserSchema,
  forgetPasswordSchema,
  getUserSchema,
  loginSchema,
  updateUserSchema,
  verForgetPasswordSchema,
} from "./user.validation.js";
import { validation } from "../../middleware/validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";

const userRouter = express.Router();

userRouter
  .route("/")
  .post(validation(createUserSchema), userController.signUp)
  .get(userController.getAllUsers)
  .patch(
    protectRoutes,
    allowedTo("hospital", "doctor"),
    isConfirmed,
    userController.addStripeAccount
  );

userRouter.post(
  "/admin",
  protectRoutes,
  authorization,
  allowedTo("admin"),
  isConfirmed,
  validation(createAdminSchema),
  userController.signUp
);
userRouter.get("/signUpVerify/:token", userController.verifySignUP);
userRouter.post("/login", validation(loginSchema), userController.signIn);

userRouter
  .route("/:id")
  .put(
    protectRoutes,
    authorization,
    allowedTo("admin", "user", "doctor", "hospital"),
    validation(updateUserSchema),
    userController.updateUser
  )
  .delete(
    protectRoutes,
    authorization,
    allowedTo("admin", "user", "doctor", "hospital"),
    validation(getUserSchema),
    userController.deleteUser
  )
  .get(
    protectRoutes,
    authorization,
    allowedTo("admin", "user", "doctor", "hospital"),
    validation(getUserSchema),
    userController.getUser
  );

userRouter.post(
  "/uploadProfileImage",
  protectRoutes,
  allowedTo("admin", "user", "doctor", "hospital"),
  isConfirmed,
  fileUpload().single("profileImage"),
  validation(getUserSchema),
  userController.uploadProfileImage
);

userRouter.get(
  "/getAnotherUser/:id",
  protectRoutes,
  allowedTo("admin", "user", "doctor", "hospital"),
  validation(getUserSchema),
  userController.getAnotherUser
);

userRouter.patch(
  "/changeUserPassword/:id",
  protectRoutes,
  authorization,
  allowedTo("admin", "user", "doctor", "hospital"),
  validation(changePasswordSchema),
  userController.changeUserPassword
);

userRouter.post(
  "/forgetPassword",
  validation(forgetPasswordSchema),
  userController.forgetPassword
);

userRouter.patch(
  "/forgetPasswordVerify",
  validation(verForgetPasswordSchema),
  userController.verifyForgetPassword
);

userRouter.get(
  "/logOut/:id",
  protectRoutes,
  authorization,
  allowedTo("admin", "user", "doctor", "hospital"),
  validation(getUserSchema),
  userController.logOut
);

userRouter.post(
  "/addFriend",
  protectRoutes,
  allowedTo("user", "doctor"),
  isConfirmed,
  validation(forgetPasswordSchema),
  userController.inviteFriend
);
userRouter.post(
  "/acceptAddFriend",
  protectRoutes,
  allowedTo("user", "doctor"),
  isConfirmed,
  validation(getUserSchema),
  userController.acceptAddFriend
);
userRouter.post(
  "/rejectAddFriend",
  protectRoutes,
  allowedTo("user", "doctor"),
  isConfirmed,
  validation(getUserSchema),
  userController.rejectAddFriend
);

// userRouter.get("/getAllConversations/conversations", userController.getAllConversations);

export default userRouter;
