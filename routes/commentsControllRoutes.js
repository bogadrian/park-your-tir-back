const express = require('express');
const commentsController = require('../controllers/commentsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(commentsController.alerts);

router.get(
  '/',
  authController.isLoggedIn,
  commentsController.getOverview
);

router.get(
  '/place/:slug',
  authController.isLoggedIn,
  commentsController.getPlace
);
router.get(
  '/login',
  authController.isLoggedIn,
  commentsController.getLoginForm
);
router.get(
  '/me',
  authController.protect,
  commentsController.getAccount
);

// router.get(
//   '/my-places',
//   authController.protect,
//   commentsController.getMyPlaces
// );

router.post(
  '/submit-user-data',
  authController.protect,
  commentsController.updateUserData
);

module.exports = router;
