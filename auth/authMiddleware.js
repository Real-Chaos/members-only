module.exports.isAuth = (req, res, next) => {
	if (req.isAuthenticated()) {
		// res.redirect('/')
		next()
	} else {
		res.redirect('/login')
	}
}

module.exports.isAdmin = (req, res, next) => {
	if (req.isAuthenticated() && req.user.admin) {
		next()
	} else {
		console.log(req.user)
		res.send(`You can't access this nigger...you are not an admincel`)
	}
}

module.exports.redirectAuth = (req, res, next) => {
	if (!req.isAuthenticated()) {
		next()
	} else {
		res.redirect('/')
	}
}
