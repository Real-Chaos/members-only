var express = require('express');
const auth = require('../controllers/authController')
const message = require('../controllers/messageController')
var router = express.Router();


/*------------------------------------------------------------------------------------------------- GET home page. --------------------------------------------------------------------------------------*/
router.get('/', auth.HomePage);
router.delete('/', auth.deleteMessage)
/*---------------------------------------------------------------------------------------------- Auth Routes ------------------------------------------------------------------------------------------- */
router.get('/sign-up', auth.SignUp)
router.post('/sign-up', auth.SignUpPost)
router.get('/log-in', auth.LogIn)
router.post('/log-in', auth.LogInUser)
router.get('/log-out', auth.LogOutUser)

/*------------------------------------------------------------------------------------------- Message Routes ------------------------------------------------------------------------------------------- */
router.get('/new-message', message.new_message_get)
router.post('/new-message', message.new_message_post)
router.get('/new-member', message.become_member_get)
router.post('/new-member', message.become_member_post)

// admin
router.get('/new-admin', message.become_admin_get)
router.post('/new-admin', message.become_admin_post)

module.exports = router;
