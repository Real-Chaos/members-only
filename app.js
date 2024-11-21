const path = require('node:path')
const express = require('express')
const app = express()
const session = require('express-session')
const { pool } = require('./db/pool')
const psqlStore = require('connect-pg-simple')(session)
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
require('dotenv').config()
const bcrypt = require('bcrypt')
const { isAuth, redirectAuth } = require('./auth/authMiddleware')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

const assetsPath = path.join(__dirname, 'public')
app.use(express.static(assetsPath))

// Configure Session Store
const sessionStore = new psqlStore({
	pool: pool,
	tableName: 'session',
})

// Initialize `express-session`
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false, // Set to false to avoid creating empty sessions
		store: sessionStore,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
	})
)

app.use(passport.initialize())
app.use(passport.session())

// Passport Authentication Setup
const verifyCallback = async (username, password, done) => {
	try {
		const { rows } = await pool.query(
			'SELECT * FROM users WHERE username = $1',
			[username]
		)

		const user = rows[0]
		if (!user) {
			return done(null, false, { message: 'Incorrect username' })
		}

		const match = await bcrypt.compare(password, user.password)
		if (!match) {
			return done(null, false, { message: 'Incorrect password' })
		}

		return done(null, user)
	} catch (err) {
		return done(err)
	}
}

passport.use(new LocalStrategy(verifyCallback))

passport.serializeUser((user, done) => {
	done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
	try {
		const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
		const user = rows[0]
		done(null, user)
	} catch (err) {
		done(err)
	}
})

app.use((req, res, next) => {
	res.locals.currentUser = req.user
	next()
})

app.get('/', isAuth, (req, res) => {
	console.log(req.user)
	res.render('index', { user: req.user })
})

app.get('/signup', redirectAuth, (req, res) => {
	res.render('signup')
})

app.get('/login', redirectAuth, (req, res) => {
	res.render('login')
})

app.post('/signup', (req, res, next) => {
	bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
		try {
			const query = `
        INSERT INTO users(profile_image_url, username, password, special_line, description)
        VALUES ($1, $2, $3, $4, $5)
      `
			const values = [
				req.body.profile_image_url,
				req.body.username,
				hashedPassword,
				req.body.special_line,
				req.body.description,
			]
			await pool.query(query, values)
			res.redirect('/')
			console.log(query)
		} catch (err) {
			return next(err)
		}
	})
})

app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/',
	})
)

app.get('/logout', (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err)
		}
		res.redirect('/')
	})
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening to app on PORT ${PORT}`))
