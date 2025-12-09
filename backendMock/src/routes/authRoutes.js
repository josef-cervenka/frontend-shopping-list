const express = require('express')
const { login, logout } = require('../controllers/authController')
const { validate, stringRequired } = require('../middlewares/validate')

const router = express.Router()

router.post(
  '/login',
  validate({
    body: {
      username: stringRequired('username'),
      password: stringRequired('password'),
    },
  }),
  login,
)
router.post('/logout', logout)

module.exports = router
