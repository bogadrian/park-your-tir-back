const Comment = require('../models/commentsModel');
const factory = require('./handlerFactory');
// const catchAsync = require('./../utils/catchAsync');

exports.setPlaceUserIds = (req, res, next) => {
  // Allow nested routes

  if (!req.body.place) req.body.place = req.params.placeId;
  if (!req.body.user) req.body.author = req.user.id;
  next();
};

exports.getAllComments = factory.getAllDoc(Comment);
exports.getComment = factory.getDoc(Comment);
exports.createComment = factory.createDoc(Comment);
exports.updateComment = factory.updateDoc(Comment);
exports.deleteComment = factory.deleteDoc(Comment);
