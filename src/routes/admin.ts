import express from "express";
import { AppDataSource } from "../data-source";
let router = express.Router();

router.use("/console", function (req, res, next) {
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

router
  .route("/console/user")
  //get all users
  .get(async (req, res) => {
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
              `SELECT id, username, email, admin, moderator FROM login_credentials`
            )
            .then(async (response) => {
              console.log(response);
              res.status(200).send(response);
            });
        } else {
          res.sendStatus(401);
        }
      });
  })
  //post new user
  .post(async (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
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
            .query(`INSERT INTO login_credentials (username, email, password, admin, moderator) VALUES (
                '${username}',
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
  })
  //delete existing user
  .delete(async (req, res) => {
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

router
  .route("/console/tokens")
  //delete all tokens from specific account
  .put(async (req, res) => {
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
  })
  //delete all tokens sitewide
  .delete(async (req, res) => {
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

router
  .route("/console/moderator")
  //give moderator role to account
  .put(async (req, res) => {
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
  })
  //delete moderator role from account
  .delete(async (req, res) => {
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

export default router;
