### Installation instructions
1. Create a MySQL server and database
2. Create a Redis server with default values
3. Populate the `.template.env` file and rename it to `.env`
4. Sync the schema with the database by running the `sync` script in the root folder
5. Start the server using the `start` script in the root folder
6. Start the frontend using the `start` script in the `./client` folder and visit `localhost:PORT` (default port is 3000)