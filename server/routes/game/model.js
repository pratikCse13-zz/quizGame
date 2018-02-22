/** 
 * import npm modules
*/
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId
var paginate = require('mongoose-paginate')

/**
 * Schema definition of Hame model
 */
var GameSchema = new mongoose.Schema({
	name: String,
	prizeMoney: Number,
	airTime: Date,
	questions: [{
		questionId: {type: mongoose.Schema.Types.ObjectId, ref: 'question'},
		question: String,
		options: [String],
		prizeMoney: Number,
		answer: String,
		_id: false
	}],
	nextQuestion: {
		type: Number,
		default: 0
	},
	aired: {
		type: Boolean, 
		default: false
	}
})

GameSchema.plugin(paginate)

module.exports = mongoose.model('game', GameSchema)
