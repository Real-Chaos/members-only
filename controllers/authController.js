const User = require('../models/users')
const Message = require('../models/message')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const { body, check, validationResult } = require('express-validator')
const date = require('date-and-time')


const HomePage= (req, res) => {
    Message.find().sort({createdAt: -1})
        .then(result => res.render('homepage', {title: "Members Only | Homepage", user: req.user, messages: result, date}))
        .catch(err => console.log(err))
}

const SignUp = (req, res) => {
    res.render('sign-up', {alerts: [], user: req.user})
}

const LogIn = (req, res) => {
    var errors = req.flash('error');
    res.render('log-in', {errors, user: req.user});
    // res.render('log-in', {errors: req.flash('error')})
}


const SignUpPost = [
    body('username', "This must be 3+ characters long").isLength({ min: 5 }),
    body('password', "password should be 8+ characters").isLength({ min: 8 }).trim(),
    check('confirmPassword', 'Password confirmation field should be the same as password').exists().custom((value, {req}) => value === req.body.password),
    (req, res) => {
        const errors = validationResult(req)
        let userExists = User.findOne({username: req.body.username})
        userExists.then(result => {
            if(result == null) {
                if(errors.isEmpty()) {
                    const user = new User({
                        username: req.body.username,
                        password: req.body.password,
                        member: false,
                        admin: false
                    })
                    bcrypt.hash(user.password, 5, (err, hashedPassword) => {
                        if(err) {
                            console.log(err)
                        }
                        user.password = hashedPassword
                        user.save(err => {
                            if(err) {console.log(err)}
                            res.redirect('/log-in')
                        })
                    })
                } else {
                    const alerts = errors.array()
                    res.render('sign-up', {alerts: alerts, user: req.user})
                }
            } else {
                res.render('sign-up', {alerts: [{msg: "Username already exists"}], user: req.user})
            }
        })

    }
]




const LogInUser = passport.authenticate("local", {
    successRedirect: "/",
    failureFlash: true,
    failureRedirect: "/log-in",
})


const LogOutUser = (req, res) => {
    req.logout()
    res.redirect('/')
}

const deleteMessage = (req, res) => {
    console.log(req.body.id)
    Message.findByIdAndDelete(req.body.id)
        .then(result => {
            res.json({redirect: "/"})
        })
}

module.exports = {
    HomePage,
    SignUp,
    LogIn,
    SignUpPost,
    LogInUser,
    LogOutUser,
    deleteMessage
}