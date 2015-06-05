'use strict';

var _ = require('lodash');
var Motion = require('./motion.model');
var RollCall = require('../rollCall/rollCall.model');

// Get list of motions
exports.index = function(req, res) {
	if (req.query.motionid != null) { //query ?id=51
		console.log(req.query.motionid);
		res.json(200, {chusme:'id'});
	} else
	if (req.query.name != null) { // query ?name[number]=1&name[type]=PL&name[year]=1000
		console.log(req.query.name.type, req.query.name.number, req.query.name.year);
		res.json(200, {chusme:'name'});
	} else {
		Motion.find(function(err, motions) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, motions);
		});
	}
};

// Get a single motion
exports.show = function(req, res) {
	Motion.findById(req.params.id, function(err, motion) {
		if (err) {
			return handleError(res, err);
		}
		if (!motion) {
			return res.send(404);
		}
		return res.json(motion);
	});
};

// Creates a new motion in the DB.
exports.create = function(req, res) {
	Motion.create(req.body, function(err, motion) {
		if (err) {
			return handleError(res, err);
		}
		return res.json(201, motion);
	});
};

// Updates an existing motion in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Motion.findById(req.params.id, function(err, motion) {
		if (err) {
			return handleError(res, err);
		}
		if (!motion) {
			return res.send(404);
		}
		var updated = _.merge(motion, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, motion);
		});
	});
};

// Deletes a motion from the DB.
exports.destroy = function(req, res) {
	Motion.findById(req.params.id, function(err, motion) {
		if (err) {
			return handleError(res, err);
		}
		if (!motion) {
			return res.send(404);
		}
		motion.remove(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.send(204);
		});
	});
};

exports.search = function(req, res) {}

function handleError(res, err) {
	return res.send(500, err);
}
