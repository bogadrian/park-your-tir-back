const Place = require('../models/placesModel');
const catchAsync = require('../utilis/catchAsync');
const factory = require('./handlerFactory');

exports.getRange = (req, res) => {
  const ranges = req.params.range;
  res.json({
    data: {
      ranges
    }
  });
};

// routes handler function
exports.getPlaces = factory.getAllDoc(Place);
exports.getPlace = factory.getDoc(Place, {
  path: 'comments'
});
exports.createPlace = factory.createDoc(Place);
exports.updatePlace = factory.updateDoc(Place);
exports.deletePlace = factory.deleteDoc(Place);

// grop data responses by ratingAverage. respond at /api/v1/places/average-rating. it takes one place and calculates the average rating by extrating a media from all ratings for that place. It exposes also the number of ratings recived for that place and the total number of
exports.getRatingAverages = catchAsync(async (req, res) => {
  const stats = await Place.aggregate([
    {
      $match: { ratingsAverage: { $gte: 1 } }
    },
    {
      $group: {
        _id: '$ratingsAverage',
        numPlace: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' }
      }
    },
    {
      $sort: { ratingAverage: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
