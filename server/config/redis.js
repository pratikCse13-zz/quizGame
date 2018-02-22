module.exports = {
	host: 'localhost',
	port: 6379,
	keys: {
		liveGame: 'liveGame',
		nextGame: 'nextGame',
		livePlayers: 'livePlayers',
		liveQuestions: 'liveGameQuestions',
		nextQuestions: 'nextGameQuestions',
		nextQuestionIndex: 'nextQuestionIndex',
		currentQuestion: 'currentQuestion',
		currentAnswer: 'currentQuestionAnswer',
		winnersNames: 'winnersNames',
		winnerSocketIds: 'winnersSocketIds'
	}
}