db = db.getSiblingDB('shopping-list')

const users = [
  { username: 'demo', password: '$2b$10$hhUsEULuJHlxRsFmifSoV.sMQn6m.WoX92G3Jp4oe.h1ZLMbjKaXm' },
  { username: 'admin', password: '$2b$10$6IxszFUKQyUZlLR0IPjcN.Ju6UktAUNvu4pwwlKSAX17PpVYEmgNy' },
  { username: 'franta', password: '$2b$10$nAp01cSu2DdGLHH7j8NFeeymTv6zrMVDAZf9tZOSAnseYBMvXndCy' },
]

const shoppingLists = [
  {
    name: 'demo-list',
    owner: 'admin',
    members: ['admin', 'franta'],
    archived: false,
    items: [
      { name: 'Bread', checked: false },
      { name: 'Milk', checked: true },
    ],
  },
  {
    name: 'Rodinný nákup',
    owner: 'demo',
    members: ['demo', 'admin'],
    archived: false,
    items: [
      { name: 'Pasta', checked: false },
      { name: 'Coffee', checked: true },
    ],
  },
]

db.users.insertMany(users)
db.shoppinglists.insertMany(shoppingLists)
