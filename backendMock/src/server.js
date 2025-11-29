require('dotenv').config()
const app = require('./app')
const connectDb = require('./config/db')

const PORT = process.env.PORT || 8081

async function bootstrap() {
  await connectDb()
  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
