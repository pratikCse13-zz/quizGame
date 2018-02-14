/**
 * import npm modules
 */
var router = require('express').Router()

/**
 * import package modules
 */
var Game = require('./Game')

router.get('/allGames', Game.getAll.bind(Game))
router.get('/nextGame', Game.getNextGameApi.bind(Game))

module.exports = router