'use strict';

var express = require('express');
var controller = require('./populateDB.controller');

var router = express.Router();

router.get('/:year', controller.populateMotionsByYear);
router.get('/downloadRollCalls', controller.downloadRollCalls);
router.get('/setRollCallsIDsInMotions', controller.setRollCallsIDsInMotions);

module.exports = router;