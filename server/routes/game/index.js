/**
 * import npm modules
 */
const router = require('express').Router()

/**
 * import package modules
 */
const Game = require('./Game')

router.get('/allGames', Game.getAll.bind(Game))
router.get('/nextGame', Game.getNextGameApi.bind(Game))

module.exports = router