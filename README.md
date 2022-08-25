# Project Omerta Server & Database

## Installation Guide

Clone the repository to your local machine, and open it in a terminal. I use VS Code's intergrated terminal.

Download and install PostgreSQL

The default port will be 5432, if you wish to change this you'll need to update the DB_PORT in .env file.

!! Do not use special characters when creating a password in the setup, it can/will cause issues.

### .env File Guide

Rename .env.example to just .env

Update DB_PORT and DB_PASSWORD to what you entered during the installation of PostgreSQL. You should leave the rest of the database options.

If you change SERVER_PORT, you need to update the corresponding option in the frontend's .env file to the same port. Leave CLIENT_URL as it is.

You can leave the default username, email & password, or change them it's up to you. This is what you'll use to log into the website.

### Start-up Guide

Run the following commands in the order listed:

npm install

npm start

## Technology I'm using on the server

NodeJS, ExpressJS, TypeORM, PostgreSQL
