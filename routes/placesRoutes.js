const express = require('express');

const authController = require('../controllers/authController');
const placesController = require('../controllers/placesController');
const commentsRouter = require('./commentsRoutes');

const router = express.Router();

router.use('/:placeId/comments', commentsRouter);

router
  .route('/range/:range')
  .get(placesController.getRange);

router
  .route('/')
  .post(
    authController.protect,
    placesController.createPlace
  );
router
  .route('/:id')
  .get(placesController.getPlace)
  .patch(
    authController.protect,
    placesController.updatePlace
  )
  .delete(
    authController.protect,
    placesController.deletePlace
  );

//ADMIN only routes
router.use(
  authController.protect,
  authController.restrictTo('admin')
);

router.route('/').get(placesController.getPlaces);

module.exports = router;
