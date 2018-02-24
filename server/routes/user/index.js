/**
 * import npm modules
 */
const router = require('express').Router()
const passport = require('passport')
/**
 * import package modules
 */
const User = require('./User')

router.get('/allUsers', User.getAll)
router.get('/leaderBoard/lastWeek', User.leaderBoardLastWeek)
router.get('/leaderBoard/lastMonth', User.leaderBoardLastMonth)
router.get('/leaderBoard/allTime', User.leaderBoardAllTime)
router.get('/leaderBoard', User.leaderBoard)
router.get('/cashOut', User.cashOut)
router.get('/spendLife', User.spendLife)
router.get('/', User.fetchUser)

module.exports = router