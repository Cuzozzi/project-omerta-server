import { AppDataSource } from "./data-source";
import { login_credentials } from "./entity/login-credentials";
import tokenGen from "../tokenGen";
import { request } from "http";

const express = require("express");
const app = express();
app.use(express.json());
const port = 5433;
const cors = require("cors");

AppDataSource.initialize()
  .then(async () => {
    app.use(
      cors({
        credentials: true,
        preflightContinue: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        origin: true,
      })
    );

    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "http://localhost:3001");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      next();
    });

    // login
    app.post("/authentication", async (req, res) => {
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

    app.delete("/authentication", (req, res) => {
      const token = req.body.token;
      console.log(token);
      AppDataSource.manager.query(`DELETE FROM session_tokens
      WHERE token = '${String(token)}'
      `);
      res.send("Token deleted");
    });

    app.post("/authentication_time_check", async (req, res) => {
      const token = req.body.token;
      console.log(token);
      await AppDataSource.manager
        .query(
          `SELECT expiry FROM session_tokens WHERE token = '${String(
            token
          )}' AND
        expiry > now()`
        )
        .then(async (response) => {
          if (response.length > 0) {
            res.send({
              response: "Token valid",
              token: token,
            });
          } else {
            await AppDataSource.manager.query(
              `DELETE FROM session_tokens WHERE token = '${String(token)}'`
            );
            res.send({
              response: "Token invalid",
              token: token,
            });
          }
        });
    });

    app.post("/admin_authentication", async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      console.log(email);
      await AppDataSource.manager
        .query(
          `SELECT id FROM login_credentials WHERE email = '${email}' 
          AND password = crypt('${password}', password) AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0) {
            res.send({
              response: "Admin authenticated",
            });
          } else {
            res.send({
              response: "Admin not authenticated",
            });
          }
        });
    });

    // sign up
    app.post("/login_credentials", async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      await AppDataSource.manager
        .query(`INSERT INTO login_credentials (email, password, admin) VALUES (
        '${email}',
        crypt('${password}', gen_salt('bf', 8)),
        false
      );`);

      res.send("works");
    });

    app.listen(port, () => {
      console.log(`Project-Omerta-Server listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
