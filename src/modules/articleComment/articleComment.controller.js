import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { articleModel } from "../../../databases/models/article.model.js";
import { articleCommentModel } from "../../../databases/models/articleComment.model.js";

// 1- add Comment
const addComment = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user._id;

  const article = await articleModel.findById(req.body.article);
  if (!article) return next(new appError("article not found", 404));

  const result = new articleCommentModel(req.body);
  await result.save();

  const comments = await articleCommentModel.find({
    article: req.body.article,
  });

  article.comments = comments.length;
  await article.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all Comments
const getAllComments = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(articleCommentModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalComments = await articleCommentModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not comments added yet", 404));

  apiFeatures.calculateTotalAndPages(totalComments);
  result.length &&
    res.status(200).json({
      message: "success",
      totalComments,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one Comment
const getComment = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await articleCommentModel.findById(id);

  !result && next(new appError("Comment not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one Comment
const updateComment = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const article = await articleModel.findById(req.body.article);
  if (!article) return next(new appError("article not found", 404));

  const result = await articleCommentModel.findOneAndUpdate(
    { _id: id, user: req.user._id },
    req.body,
    { new: true }
  );

  !result &&
    next(
      new appError(
        "Comment not found or U aren't authorized to do this action",
        404
      )
    );
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one Comment
const deleteComment = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result;

  if (req.user.role != "admin") {
    result = await articleCommentModel.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
  }

  if (req.user.role == "admin") {
    result = await articleCommentModel.findByIdAndDelete(id);
  }

  if (!result)
    return next(
      new appError(
        "Comment not found or U aren't authorized to do this action",
        404
      )
    );

  const comments = await articleCommentModel.find({
    article: result.article,
  });

  const article = await articleModel.findOne({ _id: result.article });

  article.comments = comments.length;
  await article.save();

  res.status(200).json({ message: "success", result });
});

export { addComment, getAllComments, getComment, updateComment, deleteComment };
