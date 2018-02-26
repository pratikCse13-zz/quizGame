/**
 * import npm modules
 */
const Promise = require('bluebird')

/**
 * import package modules
 */
const GameModel = require('./model')
const QuestionModel = require('../question/model')
const Helper = require('../../helper')

class Game {
	constructor(){}

	/**
	 * this function creates a new game 
	 */
	static async createGame(req, res){
		var valid = true
		var gameErrorMessage = ''
		var questionsErrorMessage = ''
		if(!req.body || !req.body.questions || !req.body.game){
			return res.status(310).send({
				message: 'Not enough data to create game.'
			})
		}
		var game = req.body.game
		var gameValidationResults = Helper.validateGameObj(game)
		//validate the game object
		if(!gameValidationResults.valid){
			valid = gameValidationResults.valid
			gameErrorMessage = gameValidationResults.message
		}
		var questions = req.body.questions
		//validate the questions 
		var questionsValidationResults = Helper.validateQuestionsArray(questions)
		if(!questionsValidationResults.valid){
			valid = questionsValidationResults.valid
			questionsErrorMessage += questionsValidationResults.message
		}
		if(valid){
			game.questions = questions
			game.prizeMoney = questionsValidationResults.totalAmount
		} else {
			return res.status(310).send({
				message: 'Validation Error. There are some issues with the data entered',
				err: {
					game: gameErrorMessage,
					questions: questionsErrorMessage
				}
			})
		}
		try {
			var [createGameResults, createQuestionsResults] = await Promise.all([
				GameModel.create(game),
				QuestionModel.create(questions)
			])
		} catch(err) {
			Helper.notifyError(err, `Something went wrong while creating the game into the databse. Please try again`)
			return res.status(510).send({
				err: err.message,
				message: 'Something went wrong. Please try again.'
			})
		}
		return res.status(200).send({
			message: 'Successful Operation.'
		})
	}

	/**
	 * this function fetches all the games in the db
	 */
	static async getAll(req, res){
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
			var [games, total] = await Promise.all([
				GameModel.paginate({}, {offset: offset, limit: limit, lean: true}),
				GameModel.count({})
			])
		} catch(err) {
			Helper.notifyError(err, 'Error occurred while fetching games from the db in getAll method of Game class.')
			return res.status(510).send({
				message: 'Something went wrong while fetching games from the db.',
				err: err.message
			})
		}
		//send succesful response
		return res.status(200).send({
			message: 'Operation Successful.',
			data: games
		})
	}

	/**
	 * this function is exposed as REST API 
	 * to fetch the next game chronologically 
	 */
	static async getNextGameApi(req, res){
		try {
			var game = await this.getNextGame()
		} catch(err) {
			Helper.notifyError(err, 'Error while fetching next game from next game method in getNextGame Api.')
			return res.status(510).send({
				message: 'Something went wrong while fetching games from the db.',
				err: err.message
			})
		}
		return res.status(200).send({
			message: 'Operation Successful.',
			data: game
		})
	}

	/**
	 * this function fetches the next game
	 * chronologically
	 */
	static async getNextGame(){
		try {
			var game = await GameModel.paginate({}, {
				sort: {
					airTime: 1
				}, 
				limit: 1, 
				lean: true,
				select: 'airTime prizeMoney'
			})
		} catch(err) {
			Helper.notifyError(err, 'Error occurred while fetching game from the db in getNextGame method of Game class.')
			return Promise.reject(err)
		}
		//send succesful response
		return Promise.resolve(game.docs[0])
	}
}

module.exports = Game