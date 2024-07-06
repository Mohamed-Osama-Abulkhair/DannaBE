import jwt from "jsonwebtoken";
import { appError } from "../utils/appError.js";

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_secretKey);
    socket.user = decoded;
  } catch (error) {
    return next(new appError("invalid token", 401));
  }
  next();
};

export { verifyTokenSocket };
