const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { createTokenForUser } = require('../utils/token')

async function login(req, res) {
  try {
    const { username, password } = req.body || {}
    const trimmedUsername = (username || '').trim()

    if (!trimmedUsername || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    let user = await User.findOne({ username: trimmedUsername })

    if (user) {
      // check user password
      const passwordMatches = await bcrypt.compare(password, user.password)
      if (!passwordMatches) {
        return res.status(401).json({ message: 'Wrong password' })
      }
    } else {
      // create new user
      const hashedPassword = await bcrypt.hash(password, 10)
      user = await User.create({ username: trimmedUsername, password: hashedPassword })
    }

    const token = createTokenForUser(user)
    return res.json({
      token,
      user: { username: user.username },
    })
  } catch (error) {
    console.error('Login error', error)
    return res.status(500).json({ message: 'Unexpected error during login' })
  }
}

async function logout(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' })
  }
  return res.json({ message: 'Logged out' })
}

module.exports = { login, logout }
