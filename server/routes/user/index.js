/**
 * import npm modules
 */
var router = require('express').Router()
var passport = require('passport')
/**
 * import package modules
 */
var User = require('./User')

router.get('/allUsers', User.getAll)
router.get('/leaderBoard/lastWeek', User.leaderBoardLastWeek)
router.get('/leaderBoard/lastMonth', User.leaderBoardLastMonth)
router.get('/leaderBoard', User.leaderBoard)
router.get('/cashOut', User.cashOut)

module.exports = router