const express = require('express');
const commentsController = require('../controllers/commentsController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

//router.route('/').get(commentsController.getAllComments);

router.use(authController.protect);

router
  .route('/')
  .get(commentsController.getAllComments)
  .post(
    commentsController.setPlaceUserIds,
    commentsController.createComment
  );

router
  .route('/:id')
  .get(commentsController.getComment)
  .patch(commentsController.updateComment)
  .delete(commentsController.deleteComment);

module.exports = router;
