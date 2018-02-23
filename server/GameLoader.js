/**
 * import npm packages
 */
var Promise = require('bluebird')
var Mongoose = require('mongoose')
var scheduler = require('node-schedule')
var redisStream = require('redis-stream')

/**
 * import package modules
 */
var Helpers = require('./helper')
var config = require('./config')
var UserModel = require('./routes/user/model')
var redis = require('./setup/redis')
var Game = require('./routes/game/Game')
var GameManager = require('./GameManager')

module.exports = async (socketManager)=>{
    //create redis stream
    var redisClient = new redisStream()
    var redisPipeline = redisClient.stream()
    //fetch the next game
    try {
        var game = await Game.getNextGame()
    } catch(err) {
        Helpers.notifyErrors(err, `Error in fetching next game in game loader`)
        return Promise.reject(err)
    }
    var numberOfQuestions = game.questions.length
    //set live questions
    try {
        var setLiveQuestion = await redis.hmsetAsync(config.redis.keys.liveQuestions, JSON.stringify(game.questions))
    } catch(err) {
        Helpers.notifyErrors(err, `Error in fetching next game in game loader`)
        return Promise.reject(err)
    }
    //set liveGame 
    try {
        var [setGame, setNextQuestionIndex] = await Promise.all([
            redis.hmsetAsync(config.redis.keys.liveGame),
            redis.setAsync(config.redis.keys.setNextQuestionIndex, 0)
        ])
    } catch(err) {
        Helpers.notifyErrors(err, `Error in setting live game in game loader`)
        return Promise.reject(err)
    }
    //create a dupe of live players 
    try {
        var liveUsers = await redis.sgetAsync()
    } catch(err) {
        Helpers.notifyErrors(err, `Error in getting live players in game loader`)
        return Promise.reject(err)
    }
    try {
        var setResults = redis.saddAsync()
    } catch(err) {
        Helpers.notifyErrors(err, `Error in setting all players as winners in game loader`)
        return Promise.reject(err)
    }
    //delete all older useranalytics
    socketManager.io.of('/').adapter.clients((err, clients)=>{
        if(err){
            Helpers.notifyErrors(err, `Error in getting live users in game loader`)
            return Promise.reject(err)
        } else {
            //delete old winners socketids set
            var command = ['del', config.redis.keys.winnersSocketIds]
            //send command to stream but parse it before
            redisPipeline.redis.write(redisStream.parse(command))
            //delete old winners names set
            var command = ['del', config.redis.keys.winnersNames]
            //send command to stream but parse it before
            redisPipeline.redis.write(redisStream.parse(command))
            clients.forEach((client)=>{
                //reset all counts for the client
                var command = ['hmset', client.id, 'correctCount', 0, 'incorrectCount', 0, 'totalPrize', 0]
                //send command to stream but parse it before
                redisPipeline.redis.write(redisStream.parse(command))
                //add the client socket id to the winners list
                var command = ['sadd', config.redis.keys.winnersSocketIds, client.id]
                //send command to stream but parse it before
                redisPipeline.redis.write(redisStream.parse(command))
                //add the client name to the winners list
                var command = ['hmset', config.redis.keys.winnersNames, client.handshake.session.user.name]
                //send command to stream but parse it before
                redisPipeline.redis.write(redisStream.parse(command))
            })
        }
    })
    redisPipeline.end()
    //start the game manager
    var i = 0
    do{
        setTimeout(()=>{
            GameManager(socketManager, numberOfQuestions)
        }, i*config.timer.nextQuestionTimeInMin*3600)
        numberOfQuestions--
    } while(numberOfQuestions>-1)
}