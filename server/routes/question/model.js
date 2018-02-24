/** 
 * import npm modules
*/
const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

/**
 * Schema definition of Question model
 */
const QuestionSchema = new mongoose.Schema({
	question: String,
	options: [String],
	answer: Number,
	prizeMoney: {
		amount: Number,
		currency: {
			type: String,
			default: '$'
		}
	},
	exhausted: {
		type: Boolean,
		default: false
	}
})

QuestionSchema.plugin(paginate);

module.exports = mongoose.model('question', QuestionSchema);
