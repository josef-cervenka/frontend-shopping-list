const mongoose = require('mongoose')

async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-list'

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`Connected to MongoDB at ${uri}`)
  } catch (error) {
    console.error('MongoDB connection error', error)
    process.exit(1)
  }
}

module.exports = connectDb
