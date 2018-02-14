/**
 * import npm modules
 */
var router = require('express').Router()

/**
 * import package modules
 */
var Question = require('./Question')

router.get('/allQuestions', Question.getAll)

module.exports = router