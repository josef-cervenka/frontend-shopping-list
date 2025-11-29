const ShoppingList = require('../models/ShoppingList')
const User = require('../models/User')
const { requireAuthenticated } = require('../middlewares/auth')

function parseArchivedQuery(value) {
  if (typeof value !== 'string') {
    return null
  }
  const lowered = value.toLowerCase()
  if (lowered === 'true') return true
  if (lowered === 'false') return false
  return null
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

function ensureListEditable(list, res) {
  if (list.archived) {
    res.status(400).json({ message: 'Shopping list is archived and cannot be modified' })
    return false
  }
  return true
}

function getItemByName(list, itemName) {
  return list.items.find((item) => item.name === itemName)
}

async function createList(req, res) {
  try {
    const { shoppingListName } = req.params
    const username = requireAuthenticated(req, res)
    if (!username) return

    const trimmedName = (shoppingListName || '').trim()
    if (!trimmedName) {
      return res.status(400).json({ message: 'Shopping list name is required' })
    }

    const existing = await ShoppingList.findOne({ name: trimmedName }).lean()
    if (existing) {
      return res.status(400).json({ message: 'Shopping list already exists' })
    }

    const list = await ShoppingList.create({
      name: trimmedName,
      owner: username,
      members: [username],
      archived: false,
      items: [],
    })

    return res.status(201).json(list)
  } catch (error) {
    console.error('Create list error', error)
    return res.status(500).json({ message: 'Unexpected error while creating list' })
  }
}

async function getList(req, res) {
  try {
    const { shoppingListName } = req.params
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (!ensureListAccess(list, username, res)) {
      return
    }

    return res.json(list)
  } catch (error) {
    console.error('Get list error', error)
    return res.status(500).json({ message: 'Unexpected error while fetching list' })
  }
}

async function getLists(req, res) {
  try {
    const username = requireAuthenticated(req, res)
    if (!username) return

    const archivedFilter = parseArchivedQuery((req.query || {}).archived)

    const query = {
      $or: [{ owner: username }, { members: username }],
    }

    if (archivedFilter !== null) {
      query.archived = archivedFilter
    }

    const lists = await ShoppingList.find(query)
    return res.json(lists)
  } catch (error) {
    console.error('Get lists error', error)
    return res.status(500).json({ message: 'Unexpected error while fetching lists' })
  }
}

async function updateList(req, res) {
  try {
    const { shoppingListName } = req.params
    const { name: nextName, archived } = req.body || {}
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (!ensureListAccess(list, username, res)) {
      return
    }

    if (typeof archived === 'boolean') {
      list.archived = archived
    }

    const trimmedNextName = (nextName || '').trim()
    if (trimmedNextName && trimmedNextName !== list.name) {
      const existing = await ShoppingList.findOne({ name: trimmedNextName }).lean()
      if (existing) {
        return res.status(400).json({ message: 'Shopping list already exists' })
      }
      list.name = trimmedNextName
    }

    await list.save()
    return res.json(list)
  } catch (error) {
    console.error('Update list error', error)
    return res.status(500).json({ message: 'Unexpected error while updating list' })
  }
}

async function deleteList(req, res) {
  try {
    const { shoppingListName } = req.params
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (list.owner !== username) {
      return res.status(403).json({ message: 'Only the owner can delete this shopping list' })
    }

    await list.deleteOne()
    return res.status(204).send()
  } catch (error) {
    console.error('Delete list error', error)
    return res.status(500).json({ message: 'Unexpected error while deleting list' })
  }
}

async function createItem(req, res) {
  try {
    const { shoppingListName } = req.params
    const { name } = req.body || {}
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (!ensureListAccess(list, username, res)) {
      return
    }

    if (!ensureListEditable(list, res)) {
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
    await list.save()
    return res.status(201).json(item)
  } catch (error) {
    console.error('Create item error', error)
    return res.status(500).json({ message: 'Unexpected error while creating item' })
  }
}

async function getItems(req, res) {
  try {
    const { shoppingListName } = req.params
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (!ensureListAccess(list, username, res)) {
      return
    }

    return res.json(list.items)
  } catch (error) {
    console.error('Get items error', error)
    return res.status(500).json({ message: 'Unexpected error while fetching items' })
  }
}

async function getItem(req, res) {
  try {
    const { shoppingListName, itemName } = req.params
    const list = await ShoppingList.findOne({ name: shoppingListName })
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

    return res.json(item)
  } catch (error) {
    console.error('Get item error', error)
    return res.status(500).json({ message: 'Unexpected error while fetching item' })
  }
}

async function renameItem(req, res) {
  try {
    const { shoppingListName, itemName } = req.params
    const { name: newName } = req.body || {}
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (!ensureListAccess(list, username, res)) {
      return
    }

    if (!ensureListEditable(list, res)) {
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
    await list.save()
    return res.json(item)
  } catch (error) {
    console.error('Rename item error', error)
    return res.status(500).json({ message: 'Unexpected error while renaming item' })
  }
}

async function markItem(req, res) {
  try {
    const { shoppingListName, itemName } = req.params
    const { checked } = req.body || {}
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (!ensureListAccess(list, username, res)) {
      return
    }

    if (!ensureListEditable(list, res)) {
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

    await list.save()
    return res.json(item)
  } catch (error) {
    console.error('Mark item error', error)
    return res.status(500).json({ message: 'Unexpected error while marking item' })
  }
}

async function deleteItem(req, res) {
  try {
    const { shoppingListName, itemName } = req.params
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (!ensureListAccess(list, username, res)) {
      return
    }

    if (!ensureListEditable(list, res)) {
      return
    }

    const index = list.items.findIndex((item) => item.name === itemName)
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found' })
    }

    list.items.splice(index, 1)
    await list.save()
    return res.status(204).send()
  } catch (error) {
    console.error('Delete item error', error)
    return res.status(500).json({ message: 'Unexpected error while deleting item' })
  }
}

async function inviteMember(req, res) {
  try {
    const { shoppingListName } = req.params
    const { name } = req.body || {}
    const list = await ShoppingList.findOne({ name: shoppingListName })
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

    const user = await User.findOne({ username: memberUsername }).lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!list.members.includes(memberUsername)) {
      list.members.push(memberUsername)
    }

    await list.save()
    return res.status(201).json({ members: list.members })
  } catch (error) {
    console.error('Invite member error', error)
    return res.status(500).json({ message: 'Unexpected error while inviting member' })
  }
}

async function getMembers(req, res) {
  try {
    const { shoppingListName } = req.params
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    if (!ensureListAccess(list, username, res)) {
      return
    }

    return res.json(list.members)
  } catch (error) {
    console.error('Get members error', error)
    return res.status(500).json({ message: 'Unexpected error while fetching members' })
  }
}

async function removeMember(req, res) {
  try {
    const { shoppingListName } = req.params
    const { name } = req.body || {}
    const list = await ShoppingList.findOne({ name: shoppingListName })
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' })
    }

    const username = requireAuthenticated(req, res)
    if (!username) return

    const memberUsername = (name || '').trim()
    if (!memberUsername) {
      return res.status(400).json({ message: 'Member username is required' })
    }

    const isOwner = list.owner === username
    const isSelf = memberUsername === username
    if (!isOwner && !isSelf) {
      return res.status(403).json({ message: 'Only the owner can remove other members' })
    }

    if (isOwner && isSelf) {
      return res.status(400).json({ message: 'Owner cannot remove themselves from the shopping list' })
    }

    if (!list.members.includes(memberUsername)) {
      return res.status(404).json({ message: 'Member not found in the shopping list' })
    }

    list.members = list.members.filter((member) => member !== memberUsername)
    if (memberUsername === list.owner) {
      list.owner = list.members[0] || null
    }

    await list.save()
    return res.json({ members: list.members, owner: list.owner })
  } catch (error) {
    console.error('Remove member error', error)
    return res.status(500).json({ message: 'Unexpected error while removing member' })
  }
}

module.exports = {
  createList,
  getList,
  getLists,
  updateList,
  deleteList,
  createItem,
  getItems,
  getItem,
  renameItem,
  markItem,
  deleteItem,
  inviteMember,
  getMembers,
  removeMember,
}
