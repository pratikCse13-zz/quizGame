/**
 * import npm modules
 */
const router = require('express').Router()

/**
 * import package modules
 */
const Question = require('./Question')

router.get('/allQuestions', Question.getAll)

module.exports = router