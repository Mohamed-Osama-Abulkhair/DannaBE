import express from "express";
import * as userController from "./user.controller.js";
import { allowedTo, authorization, isConfirmed, protectRoutes } from "../../middleware/protectFuns.js";
import { changePasswordSchema, createAdminSchema, createUserSchema, forgetPasswordSchema, getUserSchema, loginSchema, updateUserSchema, verForgetPasswordSchema } from "./user.validation.js";
import { validation } from "../../middleware/validation.js";

const userRouter = express.Router();

userRouter.post("/", validation(createUserSchema),userController.signUp);
userRouter.post("/admin",validation(createAdminSchema),protectRoutes,authorization,allowedTo("admin"),isConfirmed,userController.signUp);
userRouter.get("/signUpVerify/:token", userController.verifySignUP);
userRouter.post("/login", validation(loginSchema),userController.signIn);

userRouter
  .route("/:id")
  .put(validation(updateUserSchema),protectRoutes,authorization,allowedTo("admin","user","doctor","hospital"),userController.updateUser)
  .delete(validation(getUserSchema),protectRoutes,authorization,allowedTo("admin","user","doctor","hospital"),userController.deleteUser)
  .get(validation(getUserSchema),protectRoutes,authorization,allowedTo("admin","user","doctor","hospital"),userController.getUser);

userRouter.get("/getAnotherUser/:id",validation(getUserSchema),protectRoutes,allowedTo("admin","user","doctor","hospital"), userController.getAnotherUser);

userRouter.patch(
  "/changeUserPassword/:id",validation(changePasswordSchema),
  protectRoutes,authorization,allowedTo("admin","user","doctor","hospital"),
  userController.changeUserPassword
);

userRouter.post("/forgetPassword",validation(forgetPasswordSchema) ,userController.forgetPassword);
userRouter.patch("/forgetPasswordVerify",validation(verForgetPasswordSchema), userController.verifyForgetPassword);

userRouter.get("/", userController.getAllUser);
userRouter.get("/logOut/:id",validation(getUserSchema),protectRoutes,authorization,allowedTo("admin","user","doctor","hospital"),userController.logOut);

export default userRouter;
