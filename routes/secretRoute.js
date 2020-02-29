const express = require('express');

const router = express.Router();

const handlerFactory = require('../controllers/handlerFactory');

router.route('/').get(handlerFactory.processFunct);

module.exports = router;
