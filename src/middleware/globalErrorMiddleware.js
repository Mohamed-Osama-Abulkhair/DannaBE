import dotenv from "dotenv";
dotenv.config();

export const globalErrorMiddleware = (err, req, res, next) => {
  if (process.env.development) return devMode(err, res);
  prodMode(err, res);
};

const devMode = (err, res) => {
  let code = err.statusCode || 500;
  res
    .status(code)
    .json({ statusCode: code, message: err.message, stack: err.stack });
};

const prodMode = (err, res) => {
  let code = err.statusCode || 500;
  res.status(code).json({ statusCode: code, message: err.message });
};
