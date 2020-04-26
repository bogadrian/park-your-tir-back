const multer = require('multer');
const sharp = require('sharp');

//const { format } = require('util');
//const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
//const path = require('path');
const Place = require('../models/placesModel');
const factory = require('./handlerFactory');
const AppError = require('../utilis/AppError');
const catchAsync = require('../utilis/catchAsync');

//const storage = new Storage();

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

// const gc = new Storage({
//   keyFilename: path.join(
//     __dirname,
//     '../park-my-tir-backend-2f1e09caf0c6.json'
//   ),
//   projectId: 'park-my-tir-backend'
// });

//const bucket = storage.bucket(process.env.GCS_BUCKET);
//console.log(bucket);

//gc.getBuckets().then(x => console.log(x));

//const bucket = gc.bucket('park-tir');

exports.resizePlaceImages = catchAsync(
  async (req, res, next) => {
    if (!req.files) return next();

    //2) Images

    req.body.images = [];

    await Promise.all(
      req.files.map(async (file, i) => {
        const filename = `place-${
          req.user.id
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

// exports.uploadToGc = catchAsync(async (req, res, next) => {
//   if (!req.files) {
//     res.status(400).send('No file uploaded.');
//     return;
//   }

//   const filename = req.files.map((x, i) => x);

//   // Create a new blob in the bucket and upload the file data.
//   let blob;
//   if (filename[0]) {
//     blob = bucket.file(filename[0]);
//   }

//   if (filename[1]) {
//     blob = bucket.file(filename[1]);
//   }
//   if (filename[2]) {
//     blob = bucket.file(filename[2]);
//   }

//   const blobStream = blob.createWriteStream();

//   blobStream.on('error', err => {
//     next(err);
//   });

//   blobStream.on('finish', () => {
//     // The public URL can be used to directly access the file via HTTP.
//     const publicUrl = format(
//       `https://storage.googleapis.com/${bucket.name}/${blob.name}`
//     );
//     res.status(200).json({
//       status: 'success',
//       data: publicUrl
//     });
//   });

//   blobStream.end(req.file);
// });

exports.createPlace = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    ratingsAverage,
    images
  } = req.body;

  const lnglat = req.body.position;
  const coord = lnglat.split(',');
  const coordinates = coord.map(coor => {
    return coor * 1;
  });
  const position = { coordinates };

  const request = {
    name,
    description,
    ratingsAverage,
    images,
    position,
    placeAuthor: req.user.id
  };

  if (!request) {
    return next(
      new AppError('please provide all the fileds', 404)
    );
  }

  const place = await Place.create(request);

  res.status(201).json({
    status: 'success',
    data: {
      data: place
    }
  });
});

exports.updatePlace = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  let request = {
    ...req.body,
    placeAuthor: req.user.id
  };

  if (req.body.images.length === 0) {
    request = { name, description };
  }

  if (!request) {
    return next(
      new AppError('please provide all the fileds', 404)
    );
  }

  const place = await Place.findByIdAndUpdate(
    req.params.id,
    request,
    { new: false }
  );

  res.status(201).json({
    status: 'success',
    data: {
      data: place
    }
  });
});

exports.getPlacesWithin = catchAsync(
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
//exports.createPlace = factory.createDoc(Place);

exports.deletePlace = factory.deleteDoc(Place);

exports.getCoordsForAddress = catchAsync(
  async (req, res, next) => {
    const { address } = req.params;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=
        ${address}&key=${process.env.GEO}`
    );

    const { data } = response;

    if (!data || data.status === 'ZERO_RESULTS') {
      return next(
        new AppError(
          'Could not find location for the specified address.',
          422
        )
      );
    }

    const coordinates = data.results[0].geometry.location;

    res.status(200).json({
      status: 'success',
      data: coordinates
    });
  }
);

// get adresss from coordinates
//https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=API_KEY

exports.getAddressFromCoords = catchAsync(
  async (req, res, next) => {
    const { latlng } = req.params;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=
        ${latlng}&key=${process.env.GEO}`
    );
    const { data } = response;

    if (!data || data.status === 'ZERO_RESULTS') {
      return next(
        new AppError(
          'Could not find location for the specified address.',
          422
        )
      );
    }

    const address = data.results[0].formatted_address;

    res.status(200).json({
      status: 'success',
      data: address
    });
  }
);
