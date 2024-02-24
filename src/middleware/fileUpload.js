import multer, { diskStorage } from "multer";
import { appError } from "../utils/appError.js";

export const fileUpload = () => {
  const fileFilter = (req, file, cb) => {
    if (!["image/png", "image/jpeg"].includes(file.mimetype))
      return cb(new appError("image only", 400), false);

    return cb(null, true);
  };
  return multer({ storage: diskStorage({}), fileFilter });
};

