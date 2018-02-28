/**
 * import npm modules
 */
const socketio = require('socket.io')
const redisAdapter = require('socket.io-redis')
const sharedSession = require('express-socket.io-session')
const passportSocketIo = require('passport.socketio')
const cookieParser = require('cookie-parser')

/**
 * import package modules
 */
const config = require('../config')
const SocketClient = require('./SocketClient')
const SocketManager = require('./SocketManager')
const loader = require('../GameLoader')


module.exports = (server, passport, sessionStore, redis)=>{
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

			/************************************ */
			//adin socket events
			socketClient.socket.on('loadGame', (redis)=>{
				loader(socketManager, redis)
			})

			socketClient.socket.on('broadcastNextQuestion', (redis)=>{
				socketClient.adminEmitNextQuestion(socketManager.io, redis)
			})

			socketClient.socket.on('broadcastAnswer', (redis)=>{
				socketClient.revealAnswer(socketManager.io, redis)
			})

			/************************************* */
			//player socket events
			/**
			 * event to get real time player count
			 */
			socketClient.socket.on('getRealTimePlayerCount', ()=>{
				console.log('got event')
				socketClient.getRealTimePlayerCount(socketManager.io)
			})

			/**
			 * event to get live question
			 */
			socketClient.socket.on('getNextQuestion', (redis)=>{
				socketClient.getLiveQuestion(redis)
			})

			/**
			 * event to get next game
			 */
			socketClient.socket.on('getNextGame', ()=>{
				socketClient.getNextGame(redis)
			})

			/**
			 * event to post a comment
			 */
			socketClient.socket.on('postComment', (comment)=>{
				socketClient.postComment(socketManager.io)
			})

			socketClient.socket.on('disconnect', ()=>{
				console.log(`A client disconnected`)
			})
		})	

		setInterval(()=>{
			console.log(`Ping process running.`)
			socketManager.io.of('/').adapter.clients((err, clients)=>{
				clients.forEach(()=>{
					console.log('pinging a client')
					client.emit('pinge', {message: 'HI from server'})
				})
			})
			io.emit('pinge', {message: 'non adapter hi'})
		}, 5000)
	})
	return socketManager
}