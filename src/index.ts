import { AppDataSource } from "./data-source";
import { login_credentials } from "./entity/login-credentials";
import tokenGen from "../tokenGen";
import { request } from "http";
import { as } from "pg-promise";
import { response } from "express";

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

    // sign up
    app.post("/login_credentials", async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      await AppDataSource.manager
        .query(`INSERT INTO login_credentials (email, password, admin, moderator) VALUES (
            '${email}',
            crypt('${password}', gen_salt('bf', 8)),
            false,
            false
          );`);

      res.send("works");
    });

    // login authentication
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

    //logout
    app.delete("/authentication", (req, res) => {
      const token = req.body.token;
      console.log(token);
      AppDataSource.manager.query(`DELETE FROM session_tokens
      WHERE token = '${String(token)}'
      `);
      res.send("Token deleted");
    });

    //admin authentication and console
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

    app.post("/admin-console-add", async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      const token = req.body.token;
      console.log(email, password, token);
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token)}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0) {
            AppDataSource.manager
              .query(`INSERT INTO login_credentials (email, password, admin, moderator) VALUES (
                '${email}',
                crypt('${password}', gen_salt('bf', 8)),
                false,
                false
              );`);
            res.send("User added");
          } else {
            res.send("Authentication failed");
          }
        });
    });

    app.delete("/admin-console-delete", (req, res) => {
      const user_id = req.body.user_id;
      const user_email = req.body.user_email;
      const token = req.body.token;
      console.log(user_id, user_email, token);
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token)}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0 && req.body.user_id > 0) {
            AppDataSource.manager.query(
              `DELETE FROM login_credentials WHERE id = ${user_id}`
            );
            res.send("User deleted by ID");
          } else if (response.length > 0 && req.body.user_email !== "") {
            AppDataSource.manager.query(
              `DELETE FROM login_credentials WHERE email = '${user_email}'`
            );
            res.send("User deleted by email");
          } else {
            res.send("Authentication failed");
          }
        });
    });

    app.delete("/admin-console-delete-tokens", (req, res) => {
      let user_id = req.body.user_id;
      const user_email = req.body.user_email;
      const token = req.body.token;
      console.log(user_id, user_email, token);
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token)}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0 && req.body.user_id > 0) {
            AppDataSource.manager.query(
              `DELETE FROM session_tokens WHERE user_id = ${user_id}`
            );
            res.send("User tokens deleted by ID");
          } else if (response.length > 0 && req.body.user_email !== "") {
            AppDataSource.manager
              .query(
                `SELECT id FROM login_credentials WHERE email = '${user_email}'`
              )
              .then(async (response) => {
                user_id = response[0].id;
                AppDataSource.manager.query(
                  `DELETE FROM session_tokens WHERE user_id = ${user_id}`
                );
                res.send("User tokens deleted by email");
              });
          } else {
            res.send("Authentication failed");
          }
        });
    });

    app.delete("/admin-console-delete-all-tokens", (req, res) => {
      const token = req.body.token;
      console.log(token);
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token)}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0) {
            AppDataSource.manager.query(`DELETE FROM session_tokens`);
            res.send("All session tokens deleted sitewide");
          } else {
            res.send("Authentication failed");
          }
        });
    });

    app.put("/admin-console-give-moderator", (req, res) => {
      const user_id = req.body.user_id;
      const user_email = req.body.user_email;
      const token = req.body.token;
      console.log(user_id, user_email, token);
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token)}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0 && req.body.user_id > 0) {
            AppDataSource.manager.query(
              `UPDATE login_credentials SET moderator = true WHERE id = ${user_id}`
            );
            res.send("User granted moderator role by ID");
          } else if (response.length > 0 && req.body.user_email !== "") {
            AppDataSource.manager.query(
              `UPDATE login_credentials SET moderator = true WHERE email = '${user_email}'`
            );
            res.send("User granted moderator role by email");
          } else {
            res.send("Authentication failed");
          }
        });
    });

    app.put("/admin-console-remove-moderator", (req, res) => {
      const user_id = req.body.user_id;
      const user_email = req.body.user_email;
      const token = req.body.token;
      console.log(user_id, user_email, token);
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token)}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0 && req.body.user_id > 0) {
            AppDataSource.manager.query(
              `UPDATE login_credentials SET moderator = false WHERE id = ${user_id}`
            );
            res.send("User revoked moderator role by ID");
          } else if (response.length > 0 && req.body.user_email !== "") {
            AppDataSource.manager.query(
              `UPDATE login_credentials SET moderator = false WHERE email = '${user_email}'`
            );
            res.send("User revoked moderator role by email");
          } else {
            res.send("Authentication failed");
          }
        });
    });

    app.listen(port, () => {
      console.log(`Project-Omerta-Server listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
