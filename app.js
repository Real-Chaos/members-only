var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require('./models/users')
const bcrypt = require('bcryptjs')
const session = require("express-session"); // Dependency of passport.js
const flash = require('connect-flash')
require('dotenv').config()

var indexRouter = require('./routes/index');

var app = express();

// connect to DB

const mongoDb = 'mongodb+srv://members-only:member1234@members-only.dipdf.mongodb.net/members?retryWrites=true&w=majority'
mongoose.connect(mongoDb, {useUnifiedTopology: true, useNewUrlParser: true})
const db = mongoose.connection
db.on("error", console.error.bind(console, "mongo connection error"))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


passport.use(
  new LocalStrategy({
      passReqToCallback: true
      }, (req, username, password, done) => {
      User.findOne({username: username}, (err, user) => {
          if(err) {
              return done(err)
          }
          if(!user) {
              return done(null, false, req.flash('error', 'Incorrect Username'))
          }
          bcrypt.compare(password, user.password, (err, res) => {
              if(res) {
                  return done(null, user)
              } else {
                  return done(null, false, req.flash('error', 'Incorrect Password'))
              }
          })
      })
  })
)

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
      done(err, user)
  })
})

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));


// Access the user object from anywhere in our application
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});


app.use(flash());
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
