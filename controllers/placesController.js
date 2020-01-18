const multer = require('multer');
const sharp = require('sharp');
const Place = require('../models/placesModel');
const factory = require('./handlerFactory');
const AppError = require('../utilis/AppError');
const catchAsync = require('../utilis/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Not an image! Please upload only images.',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPlaceImages = upload.array('images', 3);

exports.resizePlaceImages = catchAsync(
  async (req, res, next) => {
    if (!req.files) return next();

    //2) Images

    req.body.images = [];

    await Promise.all(
      req.files.map(async (file, i) => {
        const filename = `place-${
          req.params.id
        }-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(1000, 700)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/places/${filename}`);

        req.body.images.push(filename);
      })
    );

    next();
  }
);

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
          'Please provide latitutde and longitude in the format lat,lng.',
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
        $sort: { distance: 1 }
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

// routes handler function

exports.getPlaces = factory.getAllDoc(Place);
exports.getPlace = factory.getDoc(Place, {
  path: 'comments'
});
exports.createPlace = factory.createDoc(Place);
exports.updatePlace = factory.updateDoc(Place);
exports.deletePlace = factory.deleteDoc(Place);

