const TOKEN_PREFIX = 'mock-token-'

function createTokenForUser(user) {
  return `${TOKEN_PREFIX}${user.username}`
}

function parseToken(token) {
  if (token && token.startsWith(TOKEN_PREFIX)) {
    return token.slice(TOKEN_PREFIX.length)
  }
  return null
}

module.exports = { createTokenForUser, parseToken, TOKEN_PREFIX }
