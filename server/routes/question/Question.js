/**
 * import npm modules
 */
var Promise = require('bluebird')

/**
 * import package modules
 */
var QuestionModel = require('./model')
var Helper = require('../../Helper')

class Question {
	constructor(){}

	/**
	 * this function fetches all the questions in the db
	 */
	async getAll(req, res){
		//process the params
		var offset = parseInt(req.query.offset)
		var limit = parseInt(req.query.limit)
		if(isNaN(offset) || isNaN(limit)){
			return res.status(400).send({
				message: 'Bad Request.',
				details: 'The provided query parameters are not proper. PLease try again with another value.'
			})
		}
		//query the db
		try {
			var [questions, total] = await Promise.all([
				QuestionModel.paginate({}, {offset: offset, limit: limit, lean: true}),
				QuestionModel.count({})
			])
		} catch(err) {
			Helper.notifyError(err, 'Error occurred while fetching questions from the db in getAll method of Question class.')
			return res.status(510).send({
				message: 'Something went wrong while fetching questions from the db.',
				err: err.message
			})
		}
		//send succesful response
		return res.status(200).send({
			message: 'Operation Successful.',
			data: questions
		})
	}
}

module.exports = new Question