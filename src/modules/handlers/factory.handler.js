import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { appError } from "../../utils/appError.js";
import cloudinary from "../../utils/cloud.js";

const deleteOne = (model) => {
  return catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    let result = await model.findByIdAndDelete(id);

    !result && next(new appError("document not found", 404));
    result && res.status(200).json({ message: "success", result });
  });
};

async function addImages(targetArr, mainFolder, cloudFolderName) {
  const imagesArr = [];
  for (const file of targetArr) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/${mainFolder}/${cloudFolderName}`,
      }
    );
    imagesArr.push({ id: public_id, url: secure_url });
  }
  return imagesArr;
}

export { deleteOne, addImages };
