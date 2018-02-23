/**
 * import npm modules
 */
var Promise = require('bluebird')

/**
 * import package modules
 */
var UserModel = require('./model')
var Helper = require('../../helper')

class User {
	constructor(){}

	/**
	 * this function fetches all the users in the db
	 */
	async getAll(req, res){
		//process the params
		var offset = parseInt(req.query.offset)
		var limit = parseInt(req.query.limit)
		if(isNaN(offset) || isNaN(limit)){
			return res.status(400).send({
				message: 'Bad Request.',
				details: 'The provided query parameters are not proper. PLease try again with another value.'
			})
		}
		//query the db
		try {
			var [users, total] = await Promise.all([
				UserModel.paginate({}, {offset: offset, limit: limit, lean: true}),
				UserModel.count({})
			])
		} catch(err) {
			Helper.notifyError(err, 'Error occurred while fetching users from the db in getAll method of user class.')
			return res.status(510).send({
				message: 'Something went wrong while fetching users from the db.',
				err: err.message
			})
		}
		//send succesful response
		return res.status(200).send({
			message: 'Operation Successful.',
			data: users
		})
	}
}

module.exports = new User