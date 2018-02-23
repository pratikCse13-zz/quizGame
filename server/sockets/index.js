/**
 * import npm modules
 */
const socketio = require('socket.io')
const redisAdapter = require('socket.io-redis')
const sharedSession = require('express-socket.io-session')
const passportSocketIo = require('passport.socketio')
var cookieParser = require('cookie-parser')

/**
 * import package modules
 */
var config = require('../config')
var redis = require('../setup').redis
var SocketClient = require('./SocketClient')
var SocketManager = require('./SocketManager')

module.exports = (server, passport, sessionStore)=>{
	//setup sockets
	const io = socketio(server)
	io.adapter(redisAdapter({ host: config.redis.host, port: config.redis.port}))

	io.use(passportSocketIo.authorize({
		key: 'connect.sid',
		secret: config.session.sessionSecretKey,
		store: sessionStore,
		passport: passport,
		cookieParser: cookieParser
	}))

	var socketManager = new SocketManager(io)
	
	redis.on('connect', () => {
		socketManager.io.on('connection', (socket)=>{
			console.log('player trying to connect')
			//add player to the redis hash
			SocketClient.addPlayerToRedis(redis, socket)

			//create a new instance of socket class
			var socketClient = new SocketClient(socket)

			/**
			 * event to get real time player count
			 */
			socketClient.socket.on('getRealTimePlayerCount', ()=>{
				console.log('got event')
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

		// setInterval(()=>{
		// 	console.log('heere')
		// 	socketManager.io.of('/').adapter.clients((clients)=>{
		// 		console.log('clients')
		// 		console.log(clients)
		// 	})
		// 	socketManager.io.emit('hithere', {a: 2})
		// }, 1000)
	})
	return socketManager
}