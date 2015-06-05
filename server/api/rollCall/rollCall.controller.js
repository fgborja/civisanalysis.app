'use strict';

var _ = require('lodash');
var RollCall = require('./rollCall.model');

// Get list of rollCalls
exports.index = function(req, res) {
	//query rollCalls by the motionID
	// /rollcalls?motionid=xxx
	if (req.query.motionid != null) { 

		RollCall.find({
			motionID: req.query.motionid
		}, function(err, rollCalls) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, rollCalls);
		})

	} else {
		// query ?date[gte]=yyyy/mm/dd&date[lt]=yyyy/mm/dd
		/// api/rollcalls?date[gte]=2015-05-01&date[lt]=2015-06-05
		if (req.query.date != null) {
			console.log(new Date(req.query.date.gte), new Date(req.query.date.lt));
			var gte = new Date(req.query.date.gte).toISOString();
			var lt = new Date(req.query.date.lt).toISOString();
			RollCall.find({
				"date": {
					"$gte": gte,
					"$lt": lt
				}
			}, function(err, rollCalls) {
				if (err) {
					return handleError(res, err);
				}
				return res.json(200, rollCalls);
			})
		}
		else return res.send(404);	
	} 
	// RollCall.find(function (err, rollCalls) {
	//   if(err) { return handleError(res, err); }
	//   return res.json(200, rollCalls);
	// });
};

// Get a single rollCall
exports.show = function(req, res) {
	RollCall.findById(req.params.id, function(err, rollCall) {
		if (err) {
			return handleError(res, err);
		}
		if (!rollCall) {
			return res.send(404);
		}
		return res.json(rollCall);
	});
};

// Creates a new rollCall in the DB.
exports.create = function(req, res) {
	RollCall.create(req.body, function(err, rollCall) {
		if (err) {
			return handleError(res, err);
		}
		return res.json(201, rollCall);
	});
};

// Updates an existing rollCall in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	RollCall.findById(req.params.id, function(err, rollCall) {
		if (err) {
			return handleError(res, err);
		}
		if (!rollCall) {
			return res.send(404);
		}
		var updated = _.merge(rollCall, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, rollCall);
		});
	});
};

// Deletes a rollCall from the DB.
exports.destroy = function(req, res) {
	RollCall.findById(req.params.id, function(err, rollCall) {
		if (err) {
			return handleError(res, err);
		}
		if (!rollCall) {
			return res.send(404);
		}
		rollCall.remove(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.send(204);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}
