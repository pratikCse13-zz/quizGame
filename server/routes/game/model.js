/** 
 * import npm modules
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const paginate = require('mongoose-paginate')

/**
 * Schema definition of Hame model
 */
const GameSchema = new mongoose.Schema({
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
