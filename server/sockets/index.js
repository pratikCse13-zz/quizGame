/**
 * import npm modules
 */
const socketio = require('socket.io')
const redisAdapter = require('socket.io-redis')

/**
 * import package modules
 */
var config = require('../config')
var redis = require('../setup').redis
var SocketClient = require('./SocketClient')
var SocketClient = require('./SocketManager')

module.exports = (server)=>{
	//setup sockets
	const io = socketio(server)
	io.adapter(redisAdapter({ host: config.redis.host, port: config.redis.port}))

	var socketManager = new SocketManager(io)
	
	redis.on('connect', () => {
		socketManager.io.on('connection', (socket)=>{
			//add player to the redis hash
			SocketClient.addPlayerToRedis(redis, socket)

			//create a new instance of socket class
			var socketClient = new SocketClient(socket)

			/**
			 * event to get real time player count
			 */
			socketClient.socket.on('getRealTimePlayerCount', ()=>{
				socketClient.getRealTimePlayerCount(io)
			})

			/**
			 * event to get next question
			 */
			socketClient.socket.on('getNextQuestion', ()=>{
				socketClient.getNextQuestion(redis)
			})

			/**
			 * event to get live game
			 */
			socketClient.socket.on('getNextQuestion', ()=>{
				socketClient.getLiveGame(redis)
			})

			/**
			 * event to get next game
			 */
			socketClient.socket.on('getNextGame', ()=>{
				socketClient.getNextGame(redis)
			})
		})	
	})
	return socketManager
}