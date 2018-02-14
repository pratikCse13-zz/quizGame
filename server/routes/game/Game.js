/**
 * import npm modules
 */
var Promise = require('bluebird')

/**
 * import package modules
 */
var GameModel = require('./model')
var Helper = require('../../Helper')

class Game {
	constructor(){}

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
			console.log('game in api 1s')
			console.log(game)
		} catch(err) {
			Helper.notifyError(err, 'Error while fetching next game from next game method in getNextGame Api.')
			return res.status(510).send({
				message: 'Something went wrong while fetching games from the db.',
				err: err.message
			})
		}
		console.log('game in api')
		console.log(game)
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
		console.log('get next game caled')
		try {
			var game = await GameModel.paginate({}, {
				sort: {
					airTime: 1
				}, 
				limit: 1, 
				lean: true,
				select: 'airTime prizeMoney'
			})
			console.log('game in helper')
			console.log(game)
		} catch(err) {
			Helper.notifyError(err, 'Error occurred while fetching game from the db in getNextGame method of Game class.')
			return Promise.reject(err)
		}
		console.log('pos helper')
		//send succesful response
		return Promise.resolve(game.docs[0])
	}
}

module.exports = Game