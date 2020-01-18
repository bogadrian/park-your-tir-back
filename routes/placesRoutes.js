const express = require('express');

const authController = require('../controllers/authController');
const placesController = require('../controllers/placesController');
const commentsRouter = require('./commentsRoutes');

const router = express.Router({ mergeParams: true });

router.use(authController.isLoggedIn);

router.use('/:placeId/comments', commentsRouter);

//public routes
router
  .route('/tours-within/:distance/center/:latlng')
  // lat first and then lng when seving places. in search query normal, lng and then lat
  .get(placesController.getToursWithin);

router
  .route('/distances/:latlng')
  .get(placesController.getDistances);

router.route('/:id').get(placesController.getPlace);

//protected routes - only for login users
router.use(authController.protect);

router
  .route('/')
  .post(placesController.createPlace)
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
