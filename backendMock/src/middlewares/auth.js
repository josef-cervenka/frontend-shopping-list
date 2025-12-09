const User = require('../models/User')
const { parseToken } = require('../utils/token')

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const [type, token] = authHeader.split(' ')

    if (type === 'Bearer' && token) {
      const username = parseToken(token)
      if (username) {
        const user = await User.findOne({ username }).lean()
        if (user) {
          req.user = { username: user.username }
        }
      }
    }
  } catch (error) {
    console.error('Auth middleware error', error)
  }
  next()
}

function requireAuthenticated(req, res) {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' })
    return null
  }
  return req.user.username
}

module.exports = { authMiddleware, requireAuthenticated }
