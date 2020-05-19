const express = require('express');

const authController = require('../controllers/authController');
const placesController = require('../controllers/placesController');
const commentsRouter = require('./commentsRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:placeId/comments', commentsRouter);

router
  .route('/coordByAdress/:address')
  .get(placesController.getCoordsForAddress);

router
  .route('/addressByCoords/:latlng')
  .get(placesController.getAddressFromCoords);

//public routes
router
  .route('/places-within/:distance/center/:latlng')
  // lat first and then lng when seving places. in search query normal, lng and then lat
  .get(placesController.getPlacesWithin);

router
  .route('/distances/:latlng')
  .get(placesController.getDistances);

router.route('/:id').get(placesController.getPlace);

//protected routes - only for login users
router.use(authController.protect);

router
  .route('/')
  .post(
    placesController.uploadPlaceImages,
    placesController.resizePlaceImages,
    placesController.createPlace
  )
  .get(placesController.getPlaces);

router
  .route('/:id')
  .patch(
    placesController.uploadPlaceImages,
    placesController.resizePlaceImages,
    placesController.updatePlace
  )
  .delete(placesController.deletePlace);

//ADMIN only routes
// router.use(
//   authController.protect,
//   authController.restrictTo('admin')
// );

module.exports = router;
