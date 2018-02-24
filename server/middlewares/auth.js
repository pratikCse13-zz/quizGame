exports.isAuth = (req, res, next)=>{
    if(req.isAuthenticated()){
        console.log('req.user')
		console.log(req.user)
		console.log('req.session')
		console.log(req.session)
		console.log('req.session.passport')
        console.log(req.session.passport)
        next()
    } else {
        res.redirect('/auth/facebook')
    }
}

exports.regenerateSession = (req, res)=>{
    var temp = req.session.passport; // {user: 1}
    req.session.regenerate(function(err){
        //req.session.passport is now undefined
        req.session.passport = temp
        req.session.save((err)=>{
            res.send(200)
        });
    });
};