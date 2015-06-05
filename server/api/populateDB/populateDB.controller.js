'use strict';

var Motion = require('../motion/motion.model');
var RollCall = require('../rollCall/rollCall.model');
var _ = require('lodash');
var async = require('async');

var requestify = require('requestify');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({
	explicitArray: false,
	mergeAttrs: true,
	trim: true
});

// get all {type,number,year} from collection motions and download the roll calls
exports.downloadRollCalls = function(req, res) {
	Motion.find({}, 'type number year motionID', function(err, motions) {
		
		var parallelRollCallDownloads = _.map(motions, function(motion) {
			return function (callback) {
				downloadRollCall(motion,callback)
			}
		});

		// download 5 rollCalls in paralllel 
		async.parallelLimit(parallelRollCallDownloads,5,
			function(err, results) {
				if (err) {
					console.log("ERROR",err);
					//res.json(500, err);
				}
				console.log(results);
				//else res.json(200, results);
			}
		);

		// motions.forEach(function(motion) {
		function downloadRollCall(motion,callback) {
				RollCall.findOne({
					motionID: motion.motionID
				}, '_id', function(err, id) {
					if (id == null) {
						console.log('downloading ' + motion.motionID);
						var timeoutId = setTimeout(callback, 10000, null, 'error: timeout '+motion.motionID);
						downloadMotionRollCalls(motion, function(rollCallsJson) {
							console.log(' -> downloaded '+motion.motionID);
							var rollCalls = (_.isArray(rollCallsJson.proposicao.Votacoes.Votacao)) ? rollCallsJson.proposicao.Votacoes.Votacao : [rollCallsJson.proposicao.Votacoes.Votacao];
							rollCalls.forEach(function(votacao) {
								var rollCall = RollCall.initFromJSON_Votacao(motion, votacao)
									// console.log(rollCall);
								upsertRollCallObjectDB(rollCall, function(motionID) {
									console.log('upserted rollCall' + motionID)
								});
							});
							clearTimeout(timeoutId);
							callback(null, 'downloaded ' + motion.motionID);
						});
					} else {
						console.log('found rollCall ' + motion.motionID);
						callback(null, 'found rollCall ' + motion.motionID);
					}
				})
			}
			// });
	})

	function downloadMotionRollCalls(motion, callback) {
		requestify.get('http://www.camara.gov.br/SitCamaraWS/Proposicoes.asmx/ObterVotacaoProposicao?tipo=' + motion.type + '&numero=' + motion.number + '&ano=' + motion.year).then(function(response) {
			parser.parseString(response.body, function(err, motionJson) {
				if (err) {
					console.log(err);
				}
				callback(motionJson)
			})
		})
	}

	function upsertRollCallObjectDB(rollCall, callback) {
		RollCall.update({
			date: rollCall.date
		}, rollCall, {
			upsert: true
		}, function(err) {
			callback(rollCall.motionID);
			if (err) {
				return handleError(res, err);
			}
		});
	}
};


exports.setRollCallsIDsInMotions = function(req, res) {

}

// get the data from camara.gov and populate our DB
exports.populateMotionsByYear = function(req, res) {
	var year = req.params.year;
	var overwrite = (req.params.overwrite == 'true') ? true : false;
	console.log('OVERWRITE ' + overwrite);
	console.log('POPULATE MOTIONS AND ROLL CALLS OF YEAR: ' + year);
	downloadMotionsVotedInTheYear(year, function(motionsVotedInTheYear) {
		// remove repeated
		var motionsRegistredInTheYear = {};
		motionsVotedInTheYear.proposicoes.proposicao.forEach(function(proposicao) {
			motionsRegistredInTheYear[proposicao.codProposicao] = true;
		})
		console.log('found!! : ' + objectSize(motionsRegistredInTheYear));

		var motionToDownload = _.keys(motionsRegistredInTheYear);

		motionToDownload.forEach(function(motionID) {
			Motion.findOne({
				motionID: motionID
			}, '_id', function(err, id) {
				//console.log(id);
				if (id == null) {
					console.log('downloading ' + motionID);
					downloadMotionByID(motionID, function(motionJson) {
						upsertMotionObjectDB(motionJson, function(motion) {
							console.log('upserted:  ' + motion.name + '  ' + motion.motionID)
						});
					})
				} else {
					console.log('foundID ' + motionID);
				}
			})
		});
	})

	// get a list of roll calls that happened in the year -> data from camara.gov
	// ListarProposicoesVotadasEmPlenario
	function downloadMotionsVotedInTheYear(year, callback) {
		requestify.get('http://www.camara.gov.br/SitCamaraWS/Proposicoes.asmx/ListarProposicoesVotadasEmPlenario?ano=' + year + '&tipo=').then(function(response) {
			// parse the recieved xml to JSON
			parser.parseString(response.body, function(err, motionsVotedInTheYear) {
				if (err) {
					return handleError(res, err);
				}
				callback(motionsVotedInTheYear);
			})
		})
	}

	function downloadMotionByID(idMotion, callback) {
		requestify.get('http://www.camara.gov.br/SitCamaraWS/Proposicoes.asmx/ObterProposicaoPorID?IdProp=' + idMotion).then(function(response) {
			parser.parseString(response.body, function(err, motionJson) {
				if (err) {
					return handleError(res, err);
				}
				callback(motionJson)
			})
		})
	}

	function downloadMotion(motion, callback) {
		console.log('DOWNLOAD MOTION: ', motion);
		requestify.get('http://www.camara.gov.br/SitCamaraWS/Proposicoes.asmx/ObterProposicao?tipo=' + motion.type + '&numero=' + motion.number + '&ano=' + motion.year).then(function(response) {
			parser.parseString(response.body, function(err, rollCallsJson) {
				if (err) {
					console.log(err);
				}
				callback(rollCallsJson);
			})
		})
	}

	function upsertMotionObjectDB(motionJson, callback) {
		var motion = Motion.initFromJSON_Proposicao(motionJson.proposicao);
		Motion.update({
			motionID: motion.motionID
		}, motion, {
			upsert: true
		}, function(err) {
			callback(motion);
			if (err) {
				console.log('ERROR: ' + motion.name);
				return handleError(res, err);
			}
		});
	}

	// function to check size of properties of an object
	function objectSize(obj) {
		var size = 0,
			key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};

	function motionQuery(motionIdentifiers) {
		return {
			type: motionIdentifiers.type,
			number: motionIdentifiers.number,
			year: motionIdentifiers.year
		};
	};
};
