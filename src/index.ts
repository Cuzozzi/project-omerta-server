import { resolve } from "path";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
const express = require("express");
const app = express();
const port = 5433;

AppDataSource.initialize()
  .then(async () => {
    console.log("Inserting a new user into the database...");
    const user = new User();
    user.firstName = "Timber";
    user.lastName = "Saw";
    user.age = 25;
    await AppDataSource.manager.save(user);
    console.log("Saved a new user with id: " + user.id);

    console.log("Loading users from the database...");
    const users = await AppDataSource.manager.find(User);
    console.log("Loaded users: ", users);

    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // update to match the domain you will make the request from
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    app.get("/", function (req, res, next) {
      // Handle the get for this route
    });

    app.post("/", function (req, res, next) {
      // Handle the post for this route
    });

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.post("/user", (req, res) => {
      console.log("This works!");
      res.send("This works!");
    });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
