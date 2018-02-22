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

module.exports = (server)=>{
	//setup sockets
	const io = socketio(server)
	io.adapter(redisAdapter({ host: config.redis.host, port: config.redis.port}))
	
	redis.on('connect', () => {
		io.on('connection', (socket)=>{
			//add player to the redis hash
			Socket.addPlayerToRedis(redis, socket)

			//create a new instance of socket class
			var socketClient = new Socket(socket)

			/**
			 * event to get real time player count
			 */
			socket.on('getRealTimePlayerCount', ()=>{
				socketClient.getRealTimePlayerCount(io)
			})

			/**
			 * event to get next question
			 */
			socket.on('getNextQuestion', ()=>{
				socketClient.getNextQuestion(redis)
			})

			/**
			 * event to get live game
			 */
			socket.on('getNextQuestion', ()=>{
				socketClient.getLiveGame(redis)
			})

			/**
			 * event to get next game
			 */
			socket.on('getNextGame', ()=>{
				socketClient.getNextGame(redis)
			})
		})	
	})
	return io
}