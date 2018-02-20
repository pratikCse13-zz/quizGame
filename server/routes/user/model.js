/** 
 * import npm modules
*/
var mongoose = require('mongoose')
var paginate = require('mongoose-paginate')

/**
 * Schema definition of User model
 */
var UserSchema = new mongoose.Schema({
	name: String,
	age: Number,
	gender: String,
	facebookId: String
})

UserSchema.plugin(paginate);

module.exports = mongoose.model('user', UserSchema);
