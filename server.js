import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { dbConnection } from "./databases/dbConnection.js";
import { init } from "./src/index.routes.js";
import cors from "cors";
import { createOnlineOrder } from "./src/modules/order/order.controller.js";
import { verifyStripeAccount } from "./src/modules/user/user.controller.js";
import { bookIncubationOnline } from "./src/modules/incubationReserve/incubationReserve.controller.js";

const app = express();

// middlewares
app.use(cors());
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  createOnlineOrder
);
app.post(
  "/stripeAccountVerifiedWebhook",
  express.raw({ type: "application/json" }),
  verifyStripeAccount
);
app.post(
  "/bookIncubationOnlineWebhook",
  express.raw({ type: "application/json" }),
  bookIncubationOnline
);

app.use(express.json());

init(app);

dbConnection();
app.listen(process.env.PORT || process.env.port, () =>
  console.log(
    `server is listening on port ${process.env.PORT || process.env.port}`
  )
);
