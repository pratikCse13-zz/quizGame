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

module.exports = function(socketManager){
    //create redis stream
    var redisPipeline = new redisStream()
    //fetch the next game
    try {
        var game = await Game.getNextGame()
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
    socket.io.of('/').adapter.clients((err, clients)=>{
        if(err){
            Helpers.notifyErrors(err, `Error in getting live users in game loader`)
            return Promise.reject(err)
        } else {
            clients.forEach((client)=>{

            })
        }
    })
    //delete all older useranalytics
}