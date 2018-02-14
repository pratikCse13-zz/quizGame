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

			//cretae a new instance of socket class
			var socket = new Socket(socket)

			/**
			 * event to get real time player count
			 */
			socket.on('getRealTimePlayerCountFromAdapter', function(){
				socket.getRealTimePlayerCount(io)
			})
		})	
	})
	return io
}