# Shopping List API

Setup
-----
1. Install deps: `npm install`
2. Start Mongo via Docker: `docker-compose up -d`
3. Copy env: `cp .env.example .env`
4. Start the API: `npm start`

Auth
----
- `POST /login` with JSON `{ "username": "", "password": "" }`  
  - Creates the user if missing, stores hashed `password` in MongoDB and returns `{ token, user }`.
  - Users in database user/password:
    - admin/admin
    - demo/demo
    - franta/franta
- Include `Authorization: Bearer <token>` on all other routes.
- `POST /logout` requires the auth header; returns a confirmation message.

Profiles
--------
- `guest` – unauthenticated caller; can only access `/login`.
- `user` – authenticated caller; can create lists, manage items in lists they own or where they are a member.
- `owner` – authenticated caller who owns a given list; can rename/archive/delete the list and manage members.

End-points
-------------------
**Auth**
- `POST /login`  
  - dtoIn: `{ "username": "string", "password": "string" }`  
  - dtoOut: `{ "token": "string", "user": { "username": "string" } }`
- `POST /logout`  
  - dtoIn: headers `{ "Authorization": "Bearer <token>" }`  
  - dtoOut: `{ "message": "Logged out" }`

**Shopping lists**
- `GET /shoppingList`  
  - dtoIn: query `{ "archived": "true|false (optional)" }`  
  - dtoOut: `[ { "name": "string", "owner": "string", "members": ["string"], "archived": boolean, "items": [{ "name": "string", "checked": boolean }] } ]`
- `POST /shoppingList/:shoppingListName`  
  - dtoIn: params `{ "shoppingListName": "string" }`  
  - dtoOut: the created list `{ "name": "string", "owner": "string", "members": ["string"], "archived": false, "items": [] }`
- `GET /shoppingList/:shoppingListName`  
  - dtoIn: params `{ "shoppingListName": "string" }`  
  - dtoOut: one list object `{ "name": "string", "owner": "string", "members": ["string"], "archived": false, "items": [] }`
- `PUT /shoppingList/:shoppingListName`  
  - dtoIn: params `{ "shoppingListName": "string" }`, body `{ "name?": "string", "archived?": boolean }`  
  - dtoOut: updated list object `{ "name": "string", "owner": "string", "members": ["string"], "archived": false, "items": [] }`
- `DELETE /shoppingList/:shoppingListName`  
  - dtoIn: params `{ "shoppingListName": "string" }`  
  - dtoOut: `204 No Content`

**Items**
- `GET /shoppingList/:shoppingListName/items`  
  - dtoIn: params `{ "shoppingListName": "string" }`  
  - dtoOut: `[ { "name": "string", "checked": boolean } ]`
- `POST /shoppingList/:shoppingListName/item`  
  - dtoIn: params `{ "shoppingListName": "string" }`, body `{ "name": "string" }`  
  - dtoOut: created item `{ "name": "string", "checked": false }`
- `GET /shoppingList/:shoppingListName/item/:itemName`  
  - dtoIn: params `{ "shoppingListName": "string", "itemName": "string" }`  
  - dtoOut: `{ "name": "string", "checked": boolean }`
- `PUT /shoppingList/:shoppingListName/item/:itemName`  
  - dtoIn: params `{ "shoppingListName": "string", "itemName": "string" }`, body `{ "name": "string" }`  
  - dtoOut: renamed item `{ "name": "string", "checked": boolean }`
- `PUT /shoppingList/:shoppingListName/item/:itemName/mark`  
  - dtoIn: params `{ "shoppingListName": "string", "itemName": "string" }`, body `{ "checked?": boolean }` (omitting toggles)  
  - dtoOut: updated item `{ "name": "string", "checked": boolean }`
- `DELETE /shoppingList/:shoppingListName/item/:itemName`  
  - dtoIn: params `{ "shoppingListName": "string", "itemName": "string" }`  
  - dtoOut: `204 No Content`

**Members**
- `POST /shoppingList/:shoppingListName/invite`  
  - dtoIn: params `{ "shoppingListName": "string" }`, body `{ "name": "string" }`  
  - dtoOut: `{ "members": ["string"] }`
- `GET /shoppingList/:shoppingListName/members`  
  - dtoIn: params `{ "shoppingListName": "string" }`  
  - dtoOut: `[ "string", ... ]`
- `DELETE /shoppingList/:shoppingListName/remove`  
  - dtoIn: params `{ "shoppingListName": "string" }`, body `{ "name": "string" }`  
  - dtoOut: `{ "members": ["string"], "owner": "string|null" }`
