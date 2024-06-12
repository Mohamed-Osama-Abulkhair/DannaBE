import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { childModel } from "../../../databases/models/child.model.js";

// 1- add child
const addChild = catchAsyncError(async (req, res, next) => {
  const founded = await childModel.findOne({
    childName: req.body.childName,
    user: req.user._id,
  });
  if (founded) return next(new appError("child name is already exists", 409));

  req.body.user = req.user._id;
  const result = await childModel.create(req.body);

  res.status(201).json({ message: "success", result });
});

// 2- get all Children Of User
const getAllChildren = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    childModel.find({ user: req.user._id }),
    req.query
  )
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalChildren = await childModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not Child added yet", 404));

  apiFeatures.calculateTotalAndPages(totalChildren);
  result.length &&
    res.status(200).json({
      message: "success",
      totalChildren,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one child
const getChild = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await childModel.findOne({ _id: id, user: req.user._id });

  !result &&
    next(new appError("Child isn't found or he isn't your child", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one child
const updateChild = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.childName) {
    const founded = await childModel.findOne({
      childName: req.body.childName,
      user: req.user._id,
    });
    if (founded) return next(new appError("child name is already exists", 409));
  }

  const result = await childModel.findOneAndUpdate(
    {
      _id: id,
      user: req.user._id,
    },
    req.body,
    { new: true }
  );

  !result &&
    next(new appError("Child isn't found or he isn't your child", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one child
const deleteChild = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await incubationModel.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  !result &&
    next(new appError("Child isn't found or he isn't your child", 404));
  result && res.status(200).json({ message: "success", result });
});

export { addChild, getAllChildren, getChild, updateChild, deleteChild };
