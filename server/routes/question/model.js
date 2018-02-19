/** 
 * import npm modules
*/
var mongoose = require('mongoose')
var paginate = require('mongoose-paginate')

/**
 * Schema definition of Question model
 */
var QuestionSchema = new mongoose.Schema({
	question: String,
	options: [String],
	answer: Number,
	exhausted: {
		type: Boolean,
		default: false
	}
})

QuestionSchema.plugin(paginate);

module.exports = mongoose.model('question', QuestionSchema);
