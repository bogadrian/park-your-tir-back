const Place = require('../models/placesModel');
const factory = require('./handlerFactory');
const AppError = require('../utilis/AppError');
const catchAsync = require('../utilis/catchAsync');

// routes handler function
exports.getPlaces = factory.getAllDoc(Place);
exports.getPlace = factory.getDoc(Place, {
  path: 'comments'
});
exports.createPlace = factory.createDoc(Place);
exports.updatePlace = factory.updateDoc(Place);
exports.deletePlace = factory.deleteDoc(Place);

exports.getToursWithin = catchAsync(
  async (req, res, next) => {
    const { distance, latlng } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = distance / 6378.1;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }

    const places = await Place.find({
      position: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] }
      }
    });

    res.status(200).json({
      status: 'success',
      results: places.length,
      data: {
        data: places
      }
    });
  }
);

exports.getDistances = catchAsync(
  async (req, res, next) => {
    const { latlng } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = 0.001;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }

    const distances = await Place.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  }
);
