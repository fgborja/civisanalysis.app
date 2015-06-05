'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var RollCallSchema = new Schema({
	motionID: String,
	summary: String,
	date: Date,
	obj: String,
	// codSessao: Number,
	votes: [{
		value: String,
		congressman: String,
		district: String,
		party: String
	}]
});
RollCallSchema.index({ date: -1 }); // index by date, orders items in descending order

module.exports = mongoose.model('RollCall', RollCallSchema);

module.exports.initFromJSON_Votacao = function(motion, votacao) {

	var rollCall = {
		motionID: motion.motionID, // not the _id (?)
		summary: votacao.Resumo,
		date: null,
		obj: votacao.ObjVotacao,
		votes: []
	}

	var day_month_year = votacao.Data.match(/\d+/g);
	var hour_minutes = votacao.Hora.match(/\d+/g);
	rollCall.date =
		new Date(day_month_year[2], day_month_year[1] - 1, day_month_year[0], hour_minutes[0], hour_minutes[1], 0, 0);

	if (votacao['votos'] != null) {
		votacao.votos.Deputado.forEach(function(congressman) {
			rollCall.votes.push({
				value: congressman.Voto.trim(),
				congressman: congressman.Nome.trim(),
				district: congressman.UF.trim(),
				party: congressman.Partido.trim()
			})
		})
	}

	return rollCall;
}
