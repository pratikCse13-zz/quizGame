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
		answer: String,
		difficulty: Number,
		_id: false
	}]
})

GameSchema.plugin(paginate)

module.exports = mongoose.model('game', GameSchema)
