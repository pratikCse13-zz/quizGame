/**
 * import npm packages
 */
var Promise = require('bluebird')

/**
 * import package modules
 */
var Helpers = require('../helper')

class Socket {
	constructor(socket){
		this.socket = socket
	}

	static async addPlayerToRedis(redis, socket){
		try {
			var addPlayerResult = await redis.saddAsync('players', socket._id)
		} catch(err) {
			Helpers.notifyError(err, 'Error while fetching players hash from redis')
			return Promise.reject(err)
		}
		return Promise.resolve(addPlayerResult)
	}

	getRealTimePlayerCount(io){
		io.of('/').adapter.clients((err, clients) => {
			this.socket.emit('realTimePlayerCount', {players: clients.length})
		})
	}
}

module.exports = Socket
