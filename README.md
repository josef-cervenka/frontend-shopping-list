# Shopping List Frontend

Use the steps below to get the frontend and its MongoDB-backed API running.

## Run the app

1. Run docker compose
   - prerequsites - docker 
   - go to the root folder and tun command `docker compose up -d`

2. Open the URL http://localhost:8080 to start testing

3. Remove app containers and volumes from docker
   - go to the root folder and run command `docker compose down -v`
   

## Testing the app

### 1. Login

- Username: demo
- password: demo

  ![alt text](./assets/image-5.png)

### 2. Create shopping list

  ![alt text](./assets/image-6.png)
### 3. Add member admin
  ![alt text](./assets/image-3.png)

### 4. Go back to list and add items
 - you can rename your newly created shopping list here
  
  ![alt text](./assets/image-1.png)
### 5. Logout from demo user and login as admin
 - you can add, check or remove items from created list your created list as a demo user
 - you can filter items by "Pending only" or "Completed only"
 - you can leave the shopping list in manage members
  
  ![alt text](./assets/image-4.png)

### 6. Archive and filter by archive
 - you can filter shopping lists by archive

  ![alt text](./assets/image-7.png)

  ![alt text](./assets/image-8.png)


### 7. Deleting shopping list
 - you can delete shopping lists you own
  
  ![alt text](./assets/image-9.png)
