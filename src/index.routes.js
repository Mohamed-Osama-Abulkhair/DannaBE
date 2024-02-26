process.on("uncaughtException", (err) => console.log("error in coding", err));

import { globalErrorMiddleware } from "./middleware/globalErrorMiddleware.js";
import brandRouter from "./modules/brand/brand.router.js";
import categoryRouter from "./modules/category/category.router.js";
import productRouter from "./modules/product/product.router.js";
import userRouter from "./modules/user/user.router.js";
import { appError } from "./utils/appError.js";

export const init = (app) => {
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/brands", brandRouter);
  app.use("/api/v1/products", productRouter);

  app.all("*", (req, res, next) => {
    next(new appError("invalid url" + req.originalUrl, 404));
  });

  // global error handling middleware
  app.use(globalErrorMiddleware);
};

process.on("unhandledRejection", (err) =>
  console.log("error outside express", err)
);
