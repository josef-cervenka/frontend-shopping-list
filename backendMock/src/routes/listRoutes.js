const express = require('express')
const {
  validate,
  stringRequired,
  stringOptional,
  booleanOptional,
  booleanStringOptional,
} = require('../middlewares/validate')
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

router.get(
  '/shoppingList',
  validate({
    query: { archived: booleanStringOptional('archived') },
  }),
  getLists,
)
router.post(
  '/shoppingList/:shoppingListName',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
  }),
  createList,
)
router.get(
  '/shoppingList/:shoppingListName',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
  }),
  getList,
)
router.put(
  '/shoppingList/:shoppingListName',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
    body: { name: stringOptional('name'), archived: booleanOptional('archived') },
  }),
  updateList,
)
router.delete(
  '/shoppingList/:shoppingListName',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
  }),
  deleteList,
)

router.get(
  '/shoppingList/:shoppingListName/items',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
  }),
  getItems,
)
router.post(
  '/shoppingList/:shoppingListName/item',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
    body: { name: stringRequired('name') },
  }),
  createItem,
)
router.put(
  '/shoppingList/:shoppingListName/item/:itemName/mark',
  validate({
    params: {
      shoppingListName: stringRequired('shoppingListName'),
      itemName: stringRequired('itemName'),
    },
    body: { checked: booleanOptional('checked') },
  }),
  markItem,
)
router.put(
  '/shoppingList/:shoppingListName/item/:itemName',
  validate({
    params: {
      shoppingListName: stringRequired('shoppingListName'),
      itemName: stringRequired('itemName'),
    },
    body: { name: stringRequired('name') },
  }),
  renameItem,
)
router.get(
  '/shoppingList/:shoppingListName/item/:itemName',
  validate({
    params: {
      shoppingListName: stringRequired('shoppingListName'),
      itemName: stringRequired('itemName'),
    },
  }),
  getItem,
)
router.delete(
  '/shoppingList/:shoppingListName/item/:itemName',
  validate({
    params: {
      shoppingListName: stringRequired('shoppingListName'),
      itemName: stringRequired('itemName'),
    },
  }),
  deleteItem,
)

router.post(
  '/shoppingList/:shoppingListName/invite',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
    body: { name: stringRequired('name') },
  }),
  inviteMember,
)
router.get(
  '/shoppingList/:shoppingListName/members',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
  }),
  getMembers,
)
router.delete(
  '/shoppingList/:shoppingListName/remove',
  validate({
    params: { shoppingListName: stringRequired('shoppingListName') },
    body: { name: stringRequired('name') },
  }),
  removeMember,
)

module.exports = router
