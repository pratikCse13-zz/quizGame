/**
 * import npm packages
 */
var Promise = require('bluebird')
var Mongoose = require('mongoose')

/**
 * import package modules
 */
var Helpers = require('../helper')
var config = require('../config')
var UserModel = require('../routes/user/model')

class SocketClient {
	constructor(socket){
		this.socket = socket
		this.events = {
			sendRealTimePlayerCount: 'realTimePlayerCount',
			errorRealTimePlayerCount: 'error-realTimePlayerCount',
			sendNextQuestion: 'nextQuestion',
			errorNextQuestion: 'error-nextQuestion',
			sendLiveGame: 'liveGame',
			noLiveGame: 'noLiveGame',
			errorLiveGame: 'error-liveGame',
			sendNextGame: 'nextGame',
			noNextGame: 'noNextGame',
			errorNextGame: 'error-nextGame',
			correctAnswer: 'correctAnswer',
			incorrectAnswer: 'incorrectAnswer'
		}
	}

	/**
	 * function to add a new player to the set of player socketIds
	 */
	static async addPlayerToRedis(redis, socket){
		console.log('adding player to redis')
		try {
			var [addPlayerResult, User] = await Promise.all([
				redis.saddAsync(config.redis.keys.livePlayers, socket._id),
				UserModel.findById(Mongoose.Types.ObjectId(socket.handshake.session.user._id))
			])
		} catch(err) {
			Helpers.notifyError(err, 'Error while fetching players hash from redis')
			return Promise.reject(err)
		}
		//save some details of the user to redis
		//against the socketId
		redis.hmsetAsync(socket.id, userId, User._id)
		return Promise.resolve(addPlayerResult)
	}

	/**
	 * function to get the real time player count
	 * this fetches all the clients from the adapter 
	 * connected to any of the processes
	 * and sends out the event with the number of the clients 
	 */
	getRealTimePlayerCount(io){
		io.of('/').adapter.clients((err, clients) => {
			if(err){
				Helpers.notifyError(err, `Error in fetching real time player count on socket ${this.socket.id}`)
				this.socket.emit(this.events.errorRealTimePlayerCount, {
					message: 'Error in fetching real time players count',
					err: err.message
				})
			} else {
				this.socket.emit(this.events.sendRealTimePlayerCount, {players: clients.length})
			}
		})
	}

	/**
	 * function to get 
	 * the live game being aired cuurently
	 */
	async getLiveGame(redis){
		try {
			var liveGame = await redis.hgetallAsync(config.redis.keys.liveGame)
		} catch(err) {
			Helpers.notifyError(err, `Error fetching live game for socket: ${this.socket.id}`)
			this.socket.emit(this.events.errorLiveGame, {
				message: 'Error in fetching the live game.',
				err: err.message
			})
		}
		if(liveGame){
			//if the live game is found
			this.socket.emit(this.events.liveGame, liveGame)
		} else {	
			//if the live game is not found
			this.socket.emit(this.events.noLiveGame, {
				message: 'Sorry. There is no game being aired right now. Please come back later.'				
			})
		}
	}

	/**
	 * function to get the 
	 * next game to be aired
	 */
	async getNextGame(redis){
		//get the next game from redis
		try {
			var nextGame = await redis.hgetallAsync(config.redis.keys.nextGame)
		} catch(err) {
			Helpers.notifyError(err, `Error fetching next game for socket: ${this.socket.id}`)
			this.socket.emit(this.events.errorNextGame, {
				message: 'Error in fetching the next game.',
				err: err.message
			})
		}
		if(nextGame){
			//if the next game is found
			this.socket.emit(this.events.nextGame, nextGame)
		} else {	
			//if the next game is not found
			this.socket.emit(this.events.noUpcomingGame)
		}
	}

	async submitAnswer(redis, answer){
		try {
			var [currentAnswerIndex, currentPrize, userGameAnalytics] = await Promise.all([
				//get the answer index of the current question
				redis.getAsync(config.redis.keys.currentAnswerIndex),
				//get the prize of the current question
				redis.hgetallAsync(config.redis.keys.currentPrize),
				//get the game analytics of the user
				redis.hgetallAsync(getGameAnalyticsKey())
			])
		} catch(err) {
			Helpers.notifyError(err, `Error while fetching currentAnswer in submit aanswer`)
			this.socket.emit(this.events.errorSubmittingAnswer, {
				message: 'Sorry. An error occurred and your answer could not be submitted. Please try again.'
			})
			return Promise.reject(err)
		}
		currentAnswerIndex = parseInt(currentAnswerIndex)
		currentPrize.amount = parseInt(currentPrize.amount)
		//if answer is correct increment prixe money and correct count 
		//otherwise incorrect count
		if(currentAnswerIndex == answer){
			try {
				var incrementResult = await redis.hincrbyAsync(getGameAnalyticsKey(), 'correctCount', 1, 'totalPrize', currentPrize.amount)
			} catch(err) {
				Helpers.notifyError(err, `Error while incrementing prize for correct answer submitted in submit answer`)
				this.socket.emit(this.events.errorSubmittingAnswer, {
					message: 'Sorry. An error occurred and your answer could not be submitted. Please try again.'
				})
				return Promise.reject(err)
			}
			this.socket.emit(this.events.correctAnswer, {
				message: `Congratulations. That was the correct answer. You just won ${currentPrize.amount+currentPrize.currency}.`
			})
		} else {
			try {
				var [incrementResult, removeSocketId, removePlayer] = await Promise.all([
					redis.hincrbyAsync(getGameAnalyticsKey(), incorrectCount, 1),
					redis.sremAsync(config.redis.keys.winnersSocketIds),
					redis.sremAsync(config.redis.keys.winnersNames)
				])
			} catch(err) {
				Helpers.notifyError(err, `Error while decrementing prize for incorrect answer submitted in submit answer`)
				this.socket.emit(this.events.errorSubmittingAnswer, {
					message: 'Sorry. An error occurred and your answer could not be submitted. Please try again.'
				})
				return Promise.reject(err)
			}
			this.socket.emit(this.events.incorrectAnswer, {
				message: `Sorry. That was an incorrect answer. You won 0${currentPrize.currency} for that answer.`
			})
		}
	}

	getGameAnalyticsKey(){
		return this.socket.id+'gameAnalytics'
	}
}

module.exports = SocketClient
