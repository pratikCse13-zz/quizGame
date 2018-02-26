/**
 * import npm packages
 */
var Mongoose = require('Mongoose')


class Helper {
	/**
	 * @param {*} err - the error object
	 * @param {*} message - the message explaining in which process the error was encountered
	 * this function notifies the error occurred 
	 */
	static notifyError(err, message){
		console.log(message)
		console.log(err)
	}

	static generateUniqueInviteCode(name){
		
	}

	static isValidDate(d){
		if(Object.prototype.toString.call(d) === "[object Date]" ) {
			// it is a date
			if(isNaN(d.getTime())){  // d.valueOf() could also work
				// date is not valid
				return false
			}
		} else {
			return false
		}
		return true
	}

	static validateGameObj(game){
		var valid = true
		var message = ''
		if(Object.prototype.toString.call(game) != '[object Object]'){
			return {
				valid: false,
				message: 'The game needs to be an object'
			}
		}
		//name
		game.name = game.name.toString()
		//airtime
		game.airTime = new Date(game.airTime)
		if(!this.isValidDate(game.airTime)){
			// date is not valid
			valid = false
			message += 'The airtime mentioned is not valid. '
		}
		//aired
		if(typeof game.aired == 'string'){
			game.aired = game.aired.toLowercase()
		}
		if(game.aired == 'true' || game.aired == 'TRUE' || game.aired == 'True' || game.aired == true){
			game.aired = true
		} else if(game.aired == 'false' || game.aired == 'FALSE' || game.aired == 'False' || game.aired == false){
			game.aired = false
		} else {
			valid = false
			message += 'The parameter aired should be a boolean. '
		}
		return {
			valid: valid,
			message: message
		}
	}

	static validateQuestionsArray(questions){
		var overallValid = true
		var overallMessage = ''
		var totalAmount = 0
		if(Object.prototype.toString.call(questions) != '[object Array]'){
			return {
				valid: false,
				message: 'The questions needs to be an array'
			}
		}
		questions.forEach((question, i)=>{
			var valid = true
			var message = `Question ${i}: `
			if(Object.prototype.toString.call(question) != '[object Object]'){
				valid = false
				message = 'The question needs to be an object'
			} else {
				//question
				if(!question.question){
					valid = false
					message += 'The question is not proper. '
				}
				//options
				if(Object.prototype.toString.call(question.options) != "[object Array]" ){
					valid = false
					message += 'The options are not in a valid format, requires to be an array of exactly three elements. '
				}
				if(Object.prototype.toString.call(question.options) == "[object Array]" && question.options.length != 3){
					valid = false
					message += 'There should be exactly three options. '
				}
				//answer
				if(isNaN(parseInt(question.answer))){
					valid = false
					message += 'The answer should be an integer and among 0, 1 and 2. '
				} else {
					question.answer = parseInt(question.answer)
					if(question.answer > 2 || question.answer < 0){
						valid = false
						message += 'The answer should be an integer and among 0, 1 and 2. '	
					}
				}
				//exhausted
				if(typeof question.exhausted == 'string'){
					question.exhausted = question.exhausted.toLowercase()
				}
				if(question.exhausted == 'true' || question.exhausted == 'TRUE' || question.exhausted == 'True' || question.exhausted == true){
					question.exhausted = true
				} else if(question.exhausted == 'false' || question.exhausted == 'FALSE' || question.exhausted == 'False' || question.exhausted == false){
					question.exhausted = false
				} else {
					valid = false
					message += 'The parameter \'exhausted\' should be a boolean. '
				}
				//prizeMoney
				if((!question.prizeMoney || !question.prizeMoney.amount || isNaN(parseInt(question.prizeMoney.amount)))){
					if(!(question.prizeMoney && question.prizeMoney.amount && question.prizeMoney.amount === 0)){
						valid = false
						message += 'The prizeMoney should be an object with amount as an integer. '
					}
				} else {
					question.prizeMoney.amount = parseInt(question.prizeMoney.amount)
					totalAmount += question.prizeMoney.amount
				}
			}
			if(!valid){
				overallValid = false
				overallMessage += message
			} else {
				//put in objectId
				question._id = Mongoose.Types.ObjectId()
			}
		})
		return {
			valid: overallValid,
			message: overallMessage,
			totalAmount: totalAmount
		}
	}
}

module.exports = Helper
