process.on("uncaughtException", (err) => console.log("error in coding", err));

import couponRouter from "./modules/coupon/coupon.router.js";
import { globalErrorMiddleware } from "./middleware/globalErrorMiddleware.js";
import addressRouter from "./modules/address/address.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import categoryRouter from "./modules/category/category.router.js";
import productRouter from "./modules/product/product.router.js";
import reviewRouter from "./modules/review/review.router.js";
import userRouter from "./modules/user/user.router.js";
import wishlistRouter from "./modules/wishlist/wishlist.router.js";
import { appError } from "./utils/appError.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import videoRouter from "./modules/video/video.router.js";
import articleRouter from "./modules/article/article.router.js";
import articleCommentRouter from "./modules/articleComment/articleComment.router.js";

export const init = (app) => {
  app.get("/", (req, res, next) => {
    res.status(200).json({ message: "Welcome to Danna App" });
  });
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/brands", brandRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/wishlist", wishlistRouter);
  app.use("/api/v1/address", addressRouter);
  app.use("/api/v1/coupons", couponRouter);
  app.use("/api/v1/carts", cartRouter);
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/videos", videoRouter);
  app.use("/api/v1/articles", articleRouter);
  app.use("/api/v1/article-comments", articleCommentRouter);

  app.all("*", (req, res, next) => {
    next(new appError("invalid url" + req.originalUrl, 404));
  });

  // global error handling middleware
  app.use(globalErrorMiddleware);
};

process.on("unhandledRejection", (err) =>
  console.log("error outside express", err)
);
