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
	facebookProvider: {
		type: {
			id: String,
			token: String
		},
		select: false
  	}
})

UserSchema.statics.upsertFbUser = function(accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
		'facebookProvider.id': profile.id
    }, function(err, user) {
		// no user was found, lets create a new one
      	if (!user) {
            var newUser = new that({
				email: profile.emails[0].value,
				facebookProvider: {
					id: profile.id,
					token: accessToken
				}
            });

            newUser.save(function(error, savedUser) {
              	if (error) {
                    console.log(error);
              	}
              	return cb(error, savedUser);
       	 	});
      	} else {
            return cb(err, user);
      	}	
    });
};

UserSchema.plugin(paginate);

module.exports = mongoose.model('user', UserSchema);
