import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { postModel } from "../../../databases/models/post.model.js";
import { postCommentModel } from "../../../databases/models/postComment.model.js";

// 1- add Comment
const addComment = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user._id;

  const post = await postModel.findById(req.body.post);
  if (!post) return next(new appError("post not found", 404));

  let result;
  if (post.postType != "question") {
    result = new postCommentModel(req.body);
    await result.save();
  } else {
    if (req.user.role == "doctor" || req.user.role == "admin") {
      result = new postCommentModel(req.body);
      await result.save();
    } else {
      return next(
        new appError("admin or doctor only can answer the question ", 401)
      );
    }
  }

  const comments = await postCommentModel.find({
    post: req.body.post,
  });

  post.comments = comments.length;
  await post.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all Comments
const getAllComments = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(postCommentModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalComments = await postCommentModel.countDocuments(
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

  const result = await postCommentModel.findById(id);

  !result && next(new appError("Comment not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one Comment
const updateComment = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await postCommentModel.findOneAndUpdate(
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
    result = await postCommentModel.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
  }

  if (req.user.role == "admin") {
    result = await postCommentModel.findByIdAndDelete(id);
  }

  if (!result)
    return next(
      new appError(
        "Comment not found or U aren't authorized to do this action",
        404
      )
    );

  const comments = await postCommentModel.find({
    post: result.post,
  });

  const post = await postModel.findOne({ _id: result.post });

  post.comments = comments.length;
  await post.save();

  res.status(200).json({ message: "success", result });
});

export { addComment, getAllComments, getComment, updateComment, deleteComment };
