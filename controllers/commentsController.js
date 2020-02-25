const Comment = require('../models/commentsModel');
const catchAsync = require('./../utilis/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utilis/AppError');
// const catchAsync = require('./../utils/catchAsync');

exports.setPlaceUserIds = (req, res, next) => {
  // Allow nested routes

  if (!req.body.place) req.body.place = req.params.placeId;
  if (!req.body.user) req.body.author = req.user.id;
  next();
};
exports.updateComment = catchAsync(
  async (req, res, next) => {
    const doc = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  }
);

exports.getAllComments = factory.getAllDoc(Comment);
exports.getComment = factory.getDoc(Comment);
exports.createComment = factory.createDoc(Comment);

exports.deleteComment = factory.deleteDoc(Comment);
