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
var GameManager = require('./gameManager')

module.exports = (SocketManager, questionIndex)=>{
    //emit next question in time intervals
    SocketManager.emitNextQuestion(redis).call(SocketManager)
    //reveal answer in time intervals
    if(questionIndex > 0){
        setTimeout(function(){
            SocketManager.revealAnswer(redis).call(SocketManager)
        }, config.timer.attemptTimeInMin)
    }
}