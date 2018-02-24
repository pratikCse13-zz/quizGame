/**
 * import npm packages
 */
const Promise = require('bluebird')
const Mongoose = require('mongoose')
const scheduler = require('node-schedule')
const redisStream = require('redis-stream')

/**
 * import package modules
 */
const Helpers = require('./helper')
const config = require('./config')
const UserModel = require('./routes/user/model')
const Game = require('./routes/game/Game')

module.exports = (SocketManager, questionIndex, redis)=>{
    //emit next question in time intervals
    SocketManager.emitNextQuestion(redis).call(SocketManager)
    //reveal answer in time intervals
    if(questionIndex > 0){
        setTimeout(()=>{SocketManager.revealAnswer(redis).call(SocketManager)}, config.timer.attemptTimeInMin)
    }
}