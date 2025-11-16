const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 8081

// --- MIDDLEWARES ---------------------------------------------------------

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)

app.use(express.json())

// --- MOCK "DATABASE" -----------------------------------------------------

const db = {
  users: [
    { username: 'demo', password: 'demo' },
    { username: 'admin', password: 'admin' },
    { username: 'franta', password: 'franta' },
  ],
  shoppingLists: {
    'demo-list': {
      name: 'demo-list',
      owner: 'admin',
      members: ['admin', 'franta'],
      items: [
        { name: 'Bread', checked: false },
        { name: 'Milk', checked: true },
      ],
    },
    'pantry-topup': {
      name: 'pantry-topup',
      owner: 'demo',
      members: ['demo', 'admin'],
      items: [
        { name: 'Pasta', checked: false },
        { name: 'Coffee', checked: true },
      ],
    },
  },
}

// --- AUTH HELPERS --------------------------------------------------------

function createTokenForUser(user) {
  return `mock-token-${user.username}`
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const [type, token] = authHeader.split(' ')

  if (type === 'Bearer' && token && token.startsWith('mock-token-')) {
    const username = token.slice('mock-token-'.length)
    const user = db.users.find((u) => u.username === username)
    if (user) {
      req.user = user
    }
  }
  next()
}

app.use(authMiddleware)

function requireAuthenticated(req, res) {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' })
    return null
  }
  return req.user.username
}

function ensureListAccess(list, username, res) {
  const isOwner = list.owner === username
  const isMember = list.members.includes(username)
  if (!isOwner && !isMember) {
    res.status(403).json({ message: 'You are not a member of this shopping list' })
    return false
  }
  return true
}

function getItemByName(list, itemName) {
  return list.items.find((item) => item.name === itemName)
}

// --- BASIC ENDPOINTS -----------------------------------------------------

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mock API is running' })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  let user = db.users.find((u) => u.username === username)

  if (user && user.password !== password) {
    return res.status(401).json({ message: 'Wrong password' })
  }

  if (!user) {
    user = { username, password }
    db.users.push(user)
  }

  const token = createTokenForUser(user)
  return res.json({
    token,
    user: { username: user.username },
  })
})

app.post('/logout', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' })
  }
  return res.json({ message: 'Logged out' })
})

// --- SHOPPING LIST ENDPOINTS ---------------------------------------------

app.post('/shoppingList/:shoppingListName', (req, res) => {
  const { shoppingListName } = req.params
  const username = requireAuthenticated(req, res)
  if (!username) return

  if (!shoppingListName) {
    return res.status(400).json({ message: 'Shopping list name is required' })
  }

  if (db.shoppingLists[shoppingListName]) {
    return res.status(400).json({ message: 'Shopping list already exists' })
  }

  const list = {
    name: shoppingListName,
    owner: username,
    members: [username],
    items: [],
  }

  db.shoppingLists[shoppingListName] = list
  res.status(201).json(list)
})

app.get('/shoppingList/:shoppingListName', (req, res) => {
  const { shoppingListName } = req.params
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (!ensureListAccess(list, username, res)) {
    return
  }

  res.json(list)
})

app.get('/shoppingList', (req, res) => {
  const username = requireAuthenticated(req, res)
  if (!username) return

  const lists = Object.values(db.shoppingLists).filter(
    (list) => list.owner === username || list.members.includes(username),
  )
  res.json(lists)
})

app.put('/shoppingList/:shoppingListName', (req, res) => {
  const { shoppingListName } = req.params
  const { name: nextName } = req.body || {}
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (!ensureListAccess(list, username, res)) {
    return
  }

  if (nextName && nextName !== list.name) {
    if (db.shoppingLists[nextName]) {
      return res.status(400).json({ message: 'Shopping list already exists' })
    }
    delete db.shoppingLists[shoppingListName]
    list.name = nextName
    db.shoppingLists[nextName] = list
  }

  res.json(list)
})

app.delete('/shoppingList/:shoppingListName', (req, res) => {
  const { shoppingListName } = req.params
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (list.owner !== username) {
    return res.status(403).json({ message: 'Only the owner can delete this shopping list' })
  }

  delete db.shoppingLists[shoppingListName]
  return res.status(204).send()
})

// --- ITEM ENDPOINTS ------------------------------------------------------

app.post('/shoppingList/:shoppingListName/item', (req, res) => {
  const { shoppingListName } = req.params
  const { name } = req.body || {}
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (!ensureListAccess(list, username, res)) {
    return
  }

  const itemName = (name || '').trim()
  if (!itemName) {
    return res.status(400).json({ message: 'Item name is required' })
  }

  if (getItemByName(list, itemName)) {
    return res.status(400).json({ message: 'Item already exists' })
  }

  const item = { name: itemName, checked: false }
  list.items.push(item)
  res.status(201).json(item)
})

app.get('/shoppingList/:shoppingListName/items', (req, res) => {
  const { shoppingListName } = req.params
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (!ensureListAccess(list, username, res)) {
    return
  }

  res.json(list.items)
})

app.get('/shoppingList/:shoppingListName/item/:itemName', (req, res) => {
  const { shoppingListName, itemName } = req.params
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const item = getItemByName(list, itemName)
  if (!item) {
    return res.status(404).json({ message: 'Item not found' })
  }

  res.json(item)
})

app.put('/shoppingList/:shoppingListName/item/:itemName', (req, res) => {
  const { shoppingListName, itemName } = req.params
  const { name: newName } = req.body || {}
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (!ensureListAccess(list, username, res)) {
    return
  }

  const item = getItemByName(list, itemName)
  if (!item) {
    return res.status(404).json({ message: 'Item not found' })
  }

  const nextName = (newName || '').trim()
  if (!nextName) {
    return res.status(400).json({ message: 'New name is required' })
  }

  if (nextName !== item.name && getItemByName(list, nextName)) {
    return res.status(400).json({ message: 'Item already exists' })
  }

  item.name = nextName
  res.json(item)
})

app.put('/shoppingList/:shoppingListName/item/:itemName/mark', (req, res) => {
  const { shoppingListName, itemName } = req.params
  const { checked } = req.body || {}
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (!ensureListAccess(list, username, res)) {
    return
  }

  const item = getItemByName(list, itemName)
  if (!item) {
    return res.status(404).json({ message: 'Item not found' })
  }

  if (typeof checked === 'boolean') {
    item.checked = checked
  } else {
    item.checked = !item.checked
  }

  res.json(item)
})

app.delete('/shoppingList/:shoppingListName/item/:itemName', (req, res) => {
  const { shoppingListName, itemName } = req.params
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (!ensureListAccess(list, username, res)) {
    return
  }

  const index = list.items.findIndex((item) => item.name === itemName)
  if (index === -1) {
    return res.status(404).json({ message: 'Item not found' })
  }

  list.items.splice(index, 1)
  return res.status(204).send()
})

// --- MEMBER ENDPOINTS ----------------------------------------------------

app.post('/shoppingList/:shoppingListName/invite', (req, res) => {
  const { shoppingListName } = req.params
  const { name } = req.body || {}
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (list.owner !== username) {
    return res.status(403).json({ message: 'Only the owner can manage members' })
  }

  const memberUsername = (name || '').trim()
  if (!memberUsername) {
    return res.status(400).json({ message: 'Member username is required' })
  }

  if (!db.users.find((u) => u.username === memberUsername)) {
    return res.status(404).json({ message: 'User not found' })
  }

  if (!list.members.includes(memberUsername)) {
    list.members.push(memberUsername)
  }

  res.status(201).json({ members: list.members })
})

app.get('/shoppingList/:shoppingListName/members', (req, res) => {
  const { shoppingListName } = req.params
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }
  res.json(list.members)
})

app.delete('/shoppingList/:shoppingListName/remove', (req, res) => {
  const { shoppingListName } = req.params
  const { name } = req.body || {}
  const list = db.shoppingLists[shoppingListName]
  if (!list) {
    return res.status(404).json({ message: 'Shopping list not found' })
  }

  const username = requireAuthenticated(req, res)
  if (!username) return

  if (list.owner !== username) {
    return res.status(403).json({ message: 'Only the owner can manage members' })
  }

  const memberUsername = (name || '').trim()
  if (!memberUsername) {
    return res.status(400).json({ message: 'Member username is required' })
  }

  list.members = list.members.filter((member) => member !== memberUsername)
  res.json({ members: list.members })
})

// --- START SERVER --------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`)
})
