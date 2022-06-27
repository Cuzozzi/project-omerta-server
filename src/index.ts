import { resolve } from "path";
import { AppDataSource } from "./data-source";
import { login_credentials } from "./entity/login-credentials";
import { testUser } from "./entity/testUser";
const express = require("express");
const app = express();
app.use(express.json());
const port = 5433;

AppDataSource.initialize()
  .then(async () => {
    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "http://localhost:3001");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    app.get("/user", async (req, res) => {
      const testuser = await AppDataSource.manager.find(testUser);
      res.send(testuser);
    });

    app.post("/user", async (req, res) => {
      console.log(req.body);
      const testuser = new testUser();
      testuser.firstName = req.body.firstName;
      testuser.secondName = req.body.secondName;
      await AppDataSource.manager.save(testuser);
      const testUsers = await AppDataSource.manager.find(testUser);
      console.log(testUsers);
      res.send("This works!");
    });

    app.post("/login_credentials", async (req, res) => {
      console.log(req);
      const newLogin = new login_credentials();
      newLogin.email = req.body.email;
      newLogin.password = req.body.password;
      console.log(newLogin);
      await AppDataSource.manager.save(newLogin);
      const newLogins = await AppDataSource.manager.find(login_credentials);
      console.log(newLogins);
      res.send("This also works!");
    });

    app.listen(port, () => {
      console.log(`Project-Omerta-Server listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
