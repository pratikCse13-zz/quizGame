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

class SocketManager {
	constructor(io){
        this.io = io
        this.events = {
            winners: 'winners',
			sendRealTimePlayerCount: 'realTimePlayerCount',
			errorRealTimePlayerCount: 'errorRealTimePlayerCount',
			sendNextQuestion: 'nextQuestion',
			errorNextQuestion: 'error-nextQuestion',
			sendLiveGame: 'liveGame',
			noLiveGame: 'noLiveGame',
			errorLiveGame: 'errorLiveGame',
			sendNextGame: 'nextGame',
			noNextGame: 'noNextGame',
            errorNextGame: 'errorNextGame',
			revealAnswer: 'revealAnswer',
			nextQuestion: 'nextQuestion'
		}
    }

    /**
	 * function to get the real time player count
	 * this fetches all the clients from the adapter 
	 * connected to any of the processes
	 * and sends out the event with the number of the clients 
	 */
	emitRealTimePlayerCount(io){
		this.io.of('/').adapter.clients((err, clients) => {
			if(err){
				Helpers.notifyError(err, `Error in fetching real time player count on socket ${this.socket.id}`)
				this.socket.emit(this.events.errorRealTimePlayerCount, {
					message: 'Error in fetching real time players count',
					err: err.message
				})
			} else {
				this.io.emit(this.events.sendRealTimePlayerCount, {players: clients.length})
			}
		})
	}

    /**
	 * function to emit the 
	 * next question in the live game
	 */
	async emitNextQuestion(redis){
		//get the next question from redis
		try {
			var [questions, nextQuestionIndex] = await Promise.all([
                redis.getAsync(config.redis.keys.liveQuestions),
                redis.getAsync(config.redis.keys.nextQuestionIndex)
            ])
		} catch(err) {
			Helpers.notifyError(err, `Error while fetching live game in next question event for socket: ${this.socket.id}`)
			this.io.emit(this.events.errorNextQuestion, {
				message: 'Error in fetching the next question.',
				err: err.message
			})
        }
        if(!questions){
			//if there is no live game
			this.io.emit(this.events.noLiveGame, {
				message: 'Sorry. There is no game being aired right now. Please come back later.'
			})
		} else {	
            //parse the stringifies form of questions array and nextQuestionIndex
            questions = JSON.parse(questions)
            nextQuestionIndex = parseInt(nextQuestionIndex)
			//if the next question index is more than the number of questions then game over
			if(questions.length == nextQuestionIndex){
				this.io.emit(this.events.gameOver, {
					message: 'Thats all folks!!'
				})
			} else {
				//get the next question 
				var nextQuestion = questions[nextQuestionIndex]
				//save the updates object
				try {
					var nextQuestionIndexUpdate = await Promise.all([
                        redis.incrAsync(config.redis.keys.nextQuestionIndex),
                        redis.setAsync(config.redis.keys.currentQuestion, nextQuestion.question),
                        redis.hmsetAsync(config.redis.keys.currentPrize, nextQuestion.prizeMoney),
                        redis.setAsync(config.redis.keys.currentAnswerIndex, nextQuestion.answer),
                    ])
				} catch(err) {
					Helpers.notifyError(err, 'Error while incrementing the next question index in getNextQuestion  event')
					return Promise.reject(err)
				}
				this.io.emit(this.events.nextQuestion, {
                    question: nextQuestion.question,
                    options: nextQuestion.options
                })	
				//and if the next question index is more than the number of question 
				//then game is over
			}

		}
    }
    
    /**
     * function that emits the event of 
     * revealing the answer to the current question
     */
    async revealAnswer(redis){
        //get the liveGame and its questions
        try {
            var currentAnswer = redis.getAsync(config.redis.keys.currentAnswer)
        } catch(err) {
            Helpers.notifyError(err, `Error while fetching the answer of the current question in reveal answer`)
            return Promise.reject(err)
        }
        //emit the answer to all the sockets
        this.io.emit(this.events.revealAnswer, currentAnswer)
    }

    /**
     * this function emits the winners event
     */
    async emitWinnersList(){
        try {
            var [winnersNames, winnersSocketIds] = await Promise.all([
                redis.smembersAsync(config.redis.keys.winnersNames),
                redis.smembersAsync(config.redis.keys.winnersSocketIds)
            ])
        } catch(err) {
            Helpers.notifyError(err, `Error while fetching the winners in emitWinnersList`)
            return Promise.reject(err)
        }
        this.io.emit(this.events.winners, {
            winnersNames: winnersNames
        })
    }
}

module.exports = SocketManager
