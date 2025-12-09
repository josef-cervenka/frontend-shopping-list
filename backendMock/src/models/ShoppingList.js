const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    checked: { type: Boolean, default: false },
  },
  { _id: false },
)

const stripMongoFields = (doc, ret) => {
  delete ret._id
  delete ret.__v
  return ret
}

const shoppingListSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    owner: { type: String, required: true },
    members: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
    items: { type: [itemSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: stripMongoFields },
    toObject: { versionKey: false, transform: stripMongoFields },
  },
)

module.exports = mongoose.model('ShoppingList', shoppingListSchema)
