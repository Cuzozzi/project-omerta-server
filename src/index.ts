import { AppDataSource } from "./data-source";
import tokenGen from "../tokenGen";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
const port = 5433;

AppDataSource.initialize()
  .then(async () => {
    app.use(cors());

    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "http://localhost:3001");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      next();
    });

    app.use("/admin", function (req, res, next) {
      const token = req.headers.authorization;
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
        WHERE token = '${String(token.split(" ")[1])}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length <= 0) {
            return res.sendStatus(403);
          } else {
            next();
          }
        });
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

      res.sendStatus(200);
    });

    // login authentication
    app.put("/authentication", async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      const token = tokenGen();
      AppDataSource.manager
        .query(
          `SELECT id, admin
      FROM login_credentials
      WHERE email = '${email}' 
      AND password = crypt('${password}', password) 
      `
        )
        .then(function (response) {
          console.log(response);
          if (response.length === 0) {
            res.sendStatus(401);
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
            res.status(200).send({
              token: token,
              admin: String(response[0].admin),
            });
          }
        });
    });

    app.get("/authentication_time_check", async (req, res) => {
      const token = req.headers.authorization;
      await AppDataSource.manager
        .query(
          `SELECT expiry FROM session_tokens WHERE token = '${String(
            token.split(" ")[1]
          )}' AND
        expiry > now()`
        )
        .then(async (response) => {
          if (response.length > 0) {
            res.sendStatus(200);
          } else {
            await AppDataSource.manager.query(
              `DELETE FROM session_tokens WHERE token = '${String(
                token.split(" ")[1]
              )}'`
            );
            res.sendStatus(401);
          }
        });
    });

    //logout
    app.delete("/authentication", (req, res) => {
      const token = req.headers.authorization;
      AppDataSource.manager.query(`DELETE FROM session_tokens
      WHERE token = '${String(token.split(" ")[1])}'
      `);
      res.sendStatus(200);
    });

    //admin authentication and console
    app.post("/admin/console-add", async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      const token = req.headers.authorization;
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token.split(" ")[1])}' AND admin = true`
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
            res.sendStatus(200);
          } else {
            res.sendStatus(401);
          }
        });
    });

    app.get("/admin/console-all-users", async (req, res) => {
      const token = req.headers.authorization;
      await AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token.split(" ")[1])}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0) {
            await AppDataSource.manager
              .query(
                `SELECT id, email, admin, moderator FROM login_credentials`
              )
              .then(async (response) => {
                console.log(response);
                res.status(200).send(response);
              });
          } else {
            res.sendStatus(401);
          }
        });
    });

    app.delete("/admin/console-delete", (req, res) => {
      const user_id = req.body.user_id;
      const user_email = req.body.user_email;
      const token = req.headers.authorization;
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token.split(" ")[1])}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0 && req.body.user_id > 0) {
            AppDataSource.manager.query(
              `DELETE FROM login_credentials WHERE id = ${user_id}`
            );
            res.sendStatus(200);
          } else if (response.length > 0 && req.body.user_email !== "") {
            AppDataSource.manager.query(
              `DELETE FROM login_credentials WHERE email = '${user_email}'`
            );
            res.sendStatus(200);
          } else {
            res.sendStatus(401);
          }
        });
    });

    app.delete("/admin/console-delete-tokens", (req, res) => {
      let user_id = req.body.user_id;
      const user_email = req.body.user_email;
      const token = req.headers.authorization;
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token.split(" ")[1])}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0 && req.body.user_id > 0) {
            AppDataSource.manager.query(
              `DELETE FROM session_tokens WHERE user_id = ${user_id}`
            );
            res.sendStatus(200);
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
                res.sendStatus(200);
              });
          } else {
            res.sendStatus(401);
          }
        });
    });

    app.delete("/admin/console-delete-all-tokens", (req, res) => {
      const token = req.headers.authorization;
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token.split(" ")[1])}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0) {
            AppDataSource.manager.query(`DELETE FROM session_tokens`);
            res.sendStatus(200);
          } else {
            res.sendStatus(401);
          }
        });
    });

    app.put("/admin/console-give-moderator", (req, res) => {
      const user_id = req.body.user_id;
      const user_email = req.body.user_email;
      const token = req.headers.authorization;
      AppDataSource.manager
        .query(
          `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token.split(" ")[1])}' AND admin = true`
        )
        .then(async (response) => {
          if (response.length > 0 && req.body.user_id > 0) {
            AppDataSource.manager.query(
              `UPDATE login_credentials SET moderator = true WHERE id = ${user_id}`
            );
            res.sendStatus(200);
          } else if (response.length > 0 && req.body.user_email !== "") {
            AppDataSource.manager.query(
              `UPDATE login_credentials SET moderator = true WHERE email = '${user_email}'`
            );
            res.sendStatus(200);
          } else {
            res.sendStatus(401);
          }
        });
    });

    app.put("/admin/console-remove-moderator", (req, res) => {
      const user_id = req.body.user_id;
      const user_email = req.body.user_email;
      {
        if (req.body.user_id > 0) {
          AppDataSource.manager.query(
            `UPDATE login_credentials SET moderator = false WHERE id = ${user_id}`
          );
          res.sendStatus(200);
        } else if (req.body.user_email !== "") {
          AppDataSource.manager.query(
            `UPDATE login_credentials SET moderator = false WHERE email = '${user_email}'`
          );
          res.sendStatus(200);
        } else {
          res.sendStatus(401);
        }
      }
      return;
    });

    app.listen(port, () => {
      console.log(`Project-Omerta-Server listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
