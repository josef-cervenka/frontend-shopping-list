const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const listRoutes = require('./routes/listRoutes')
const { authMiddleware } = require('./middlewares/auth')

const app = express()
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080'

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
)

app.use(express.json())
app.use(authMiddleware)

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' })
})

app.use(authRoutes)
app.use(listRoutes)

app.use((err, req, res, next) => {
  console.error('Unhandled error', err)
  res.status(500).json({ message: 'Internal server error' })
})

module.exports = app
