import multer, { diskStorage } from "multer";
import { appError } from "../utils/appError.js";

export const fileUpload = () => {
  const fileFilter = (req, file, cb) => {
    if (!["image/png", "image/jpeg"].includes(file.mimetype))
      return cb(new appError("Only PNG and JPEG images are allowed", 400), false);

    return cb(null, true);
  };
  return multer({ storage: diskStorage({}), fileFilter });
};

