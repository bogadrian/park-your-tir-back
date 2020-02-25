const mongoose = require('mongoose');
const Place = require('./placesModel');

const commentsSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "A comment can't be empty!"]
    },
    rating: {
      type: Number,
      min: 1,
      max: 6
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

commentsSchema.statics.calcAverageRatings = async function(
  placeId
) {
  const stats = await this.aggregate([
    {
      $match: { place: placeId }
    },
    {
      $group: {
        _id: '$place',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Place.findByIdAndUpdate(placeId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Place.findByIdAndUpdate(placeId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

commentsSchema.post('save', function() {
  // this points to current review
  this.constructor.calcAverageRatings(this.place);
});

// findByIdAndUpdate
// findByIdAndDelete
commentsSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

commentsSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.place);
});

const Comment = mongoose.model('Comment', commentsSchema);
module.exports = Comment;
