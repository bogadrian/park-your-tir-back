const mongoose = require('mongoose');

const commentsSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "A comment can't be empty!"]
    },
    likes: [Number],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    place: {
      type: mongoose.Schema.ObjectId,
      ref: 'Place',
      required: [true, 'A commnet must be for a place']
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A comment must have an author']
    }
  },
  //enable virtual fileds
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

commentsSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name photo'
  });
  next();
});

const Comment = mongoose.model('Comment', commentsSchema);
module.exports = Comment;
