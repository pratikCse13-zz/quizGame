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

			/**
			 * event to post a comment
			 */
			socketClient.socket.on('postComment', (comment)=>{
				socketManager.io.of('/').adapter.clients((err, clients)=>{
					if(err) {
						socketClient.socket.emit('errorPostingComment', {
							message: 'Something went wrong. Please try again.'
						})
					} else {
						client.emit('newComment', {
							name: socketClient.socket.request.user.name,
							comment: comment
						})
					}
				})
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