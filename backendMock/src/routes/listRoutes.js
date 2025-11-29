const express = require('express')
const {
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
} = require('../controllers/listController')

const router = express.Router()

router.get('/shoppingList', getLists)
router.post('/shoppingList/:shoppingListName', createList)
router.get('/shoppingList/:shoppingListName', getList)
router.put('/shoppingList/:shoppingListName', updateList)
router.delete('/shoppingList/:shoppingListName', deleteList)

router.get('/shoppingList/:shoppingListName/items', getItems)
router.post('/shoppingList/:shoppingListName/item', createItem)
router.put('/shoppingList/:shoppingListName/item/:itemName/mark', markItem)
router.put('/shoppingList/:shoppingListName/item/:itemName', renameItem)
router.get('/shoppingList/:shoppingListName/item/:itemName', getItem)
router.delete('/shoppingList/:shoppingListName/item/:itemName', deleteItem)

router.post('/shoppingList/:shoppingListName/invite', inviteMember)
router.get('/shoppingList/:shoppingListName/members', getMembers)
router.delete('/shoppingList/:shoppingListName/remove', removeMember)

module.exports = router
