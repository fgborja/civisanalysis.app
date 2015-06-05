'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var MotionSchema = new Schema({
	name: String,
	type: String,
	number: String,
	year: String,
	topic: String,
	motionID: String,
	// <idProposicaoPrincipal></idProposicaoPrincipal>
	// <nomeProposicaoOrigem></nomeProposicaoOrigem
	ementa: String,
	ementaExpl: String,
	author: String,
	// <ideCadastro></ideCadastro>
	// <ufAutor></ufAutor>
	// <partidoAutor></partidoAutor>
	// UltimoDespacho
	// Apreciacao
	status: String,
	datePresented: Date,
	tags: String,
	url: String,
	rollCalls: [{
		type: Schema.Types.ObjectId,
		ref: 'RollCall'
	}]
	// <apensadas>
	// 	<proposicao>
	// 	<nomeProposicao>PL 1439/1991</nomeProposicao>
	// 	<codProposicao>16730</codProposicao>
	// 	</proposicao>
});
MotionSchema.index({ motionID: 1 });

module.exports = mongoose.model('Motion', MotionSchema);

module.exports.initFromJSON_Proposicao = function(proposicao){
	return {
			name: proposicao.nomeProposicao,
			type: proposicao.tipo.trim(),
			number: proposicao.numero.trim(),
			year: proposicao.ano.trim(),
			motionID: proposicao.idProposicao,
			topic: proposicao.tema,
			ementa: proposicao.Ementa,
			ementaExpl: proposicao.ExplicacaoEmenta,
			author: proposicao.Autor,
			status: proposicao.Situacao,
			datePresented: new Date(proposicao.DataApresentacao), //TODO não está pegando
			tags: proposicao.Indexacao,
			url: proposicao.LinkInteiroTeor,
			rollCalls: []
		};
}