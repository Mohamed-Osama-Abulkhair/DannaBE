process.on("uncaughtException", (err) => console.log("error in coding", err));

import { globalErrorMiddleware } from "./middleware/globalErrorMiddleware.js";
import userRouter from "./modules/user/user.router.js";
import { appError } from "./utils/appError.js";

export const init = (app) => {
  app.use("/api/v1/users", userRouter);

  app.all("*", (req, res, next) => {
    next(new appError("invalid url" + req.originalUrl, 404));
  });

  // global error handling middleware
  app.use(globalErrorMiddleware);
};

process.on("unhandledRejection", (err) =>
  console.log("error outside express", err)
);
