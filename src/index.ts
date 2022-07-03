import { AppDataSource } from "./data-source";
import { login_credentials } from "./entity/login-credentials";

import tokenGen from "../tokenGen";

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

    // login
    app.post("/login_authentication", async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      const token = tokenGen();
      AppDataSource.manager
        .query(
          `SELECT id 
      FROM login_credentials
      WHERE email = '${email}' 
      AND password = crypt('${password}', password) 
      `
        )
        .then(function (response) {
          console.log(response);
          if (response.length === 0) {
            res.send("Not Authenticated");
          } else {
            const tokenExpiry = String(7 * 24 * 60 * 60);
            AppDataSource.manager
              .query(`INSERT INTO session_tokens (user_id, token, expiry) VALUES (
              ${response[0].id},
              '${token}',
              CURRENT_TIMESTAMP + interval '${String(
                1
              )} second' * ${tokenExpiry}
            )`);
            res.send({
              response: "Authenticated",
              token: token,
            });
          }
        });
    });

    // sign up
    app.post("/login_credentials", async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      await AppDataSource.manager
        .query(`INSERT INTO login_credentials (email, password) VALUES (
        '${email}',
        crypt('${password}', gen_salt('bf', 8)) 
      );`);

      res.send("works");
    });

    app.listen(port, () => {
      console.log(`Project-Omerta-Server listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
