/**
 * import npm modules
 */
const Promise = require('bluebird')
const Mongoose = require('mongoose')
Mongoose.set('debug', true)

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

	/**
	 * this function takes in the startDate and endDate
	 * fetches all the leaderBoards for all the players
	 * between this period of time
	 */
	async leaderBoard(req, res){
		var startDate = new Date(req.query.startDate)
		var endDate = new Date(req.query.endDate)
		try {
			var leaderBoard = await UserModel.aggregate([
				{$unwind: '$performance'},
				{$match: {'performance.timestamp': {$gte: startDate, $lte: endDate}}},
				{$group: {
						_id: '$_id',
						amount: {$sum: '$performance.prizeMoney.amount'},
						correctCount: {$sum: '$performance.correctCount'},
						incorrectCount: {$sum: '$performance.incorrectCount'}
				}},
				{$sort: {amount: -1}}
			])
		} catch(err) {
			Helper.notifyError(err, `Error in fetching leaderBoard in user controller`)
			return res.status(510).send({
				message: `Something went wrong. Please try again`,
				err: err.message
			})
		}
		return res.status(200).send({
			leaderBoard: leaderBoard,
			message: 'Operation successful.'
		})
	}

	/**
	 * this function fetches all the leaderBoards 
	 * for all the players for the last week
	 */
	async leaderBoardLastWeek(req, res){
		var endDate = new Date()
		var startDate = new Date()
		startDate.setDate(startDate.getDate()-7)
		try {
			var leaderBoard = await UserModel.aggregate([
				{$unwind: '$performance'},
				{$match: {'performance.timestamp': {$gte: startDate, $lte: endDate}}},
				{$group: {
						_id: '$_id',
						amount: {$sum: '$performance.prizeMoney.amount'},
						correctCount: {$sum: '$performance.correctCount'},
						incorrectCount: {$sum: '$performance.incorrectCount'}
				}},
				{$sort: {amount: -1}}
			])
		} catch(err) {
			Helper.notifyError(err, `Error in fetching leaderBoard in user controller`)
			return res.status(510).send({
				message: `Something went wrong. Please try again`,
				err: err.message
			})
		}
		return res.status(200).send({
			leaderBoard: leaderBoard,
			message: 'Operation successful.'
		})
	}

	/**
	 * this function fetches all the leaderBoards 
	 * for all the players for the last month
	 */
	async leaderBoardLastMonth(req, res){
		var endDate = new Date()
		var startDate = new Date()
		startDate.setDate(startDate.getDate()-30)
		try {
			var leaderBoard = await UserModel.aggregate([
				{$unwind: '$performance'},
				{$match: {'performance.timestamp': {$gte: startDate, $lte: endDate}}},
				{$group: {
						_id: '$_id',
						amount: {$sum: '$performance.prizeMoney.amount'},
						correctCount: {$sum: '$performance.correctCount'},
						incorrectCount: {$sum: '$performance.incorrectCount'}
				}},
				{$sort: {amount: -1}}
			])
		} catch(err) {
			Helper.notifyError(err, `Error in fetching leaderBoard in user controller`)
			return res.status(510).send({
				message: `Something went wrong. Please try again`,
				err: err.message
			})
		}
		return res.status(200).send({
			leaderBoard: leaderBoard,
			message: 'Operation successful.'
		})
	}

	/**
	 * this function cashes out the users prizemoney
	 */
	async cashOut(req, res){
		var userId = Mongoose.Types.Objectd(req.user._id)
		try {
			var user = await UserModel.update({_id: userId}, {$set: {'totalPrizeMoney.amount': 0}}, {multi: false})
		} catch(err) {
			Helper.notifyError(err, `Error in cashing out user`)
			return res.status(510).send({
				err: err.message,
				message: 'Something bad happened. Please try again'
			})
		}
		return res.status(200).send({
			message: 'Operation Successful'
		})
	}
}

module.exports = new User