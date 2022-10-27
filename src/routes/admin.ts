import express from "express";
import { AppDataSource } from "../data-source";
let router = express.Router();

router.use("/console", function (req, res, next) {
  const token = req.headers.authorization;
  AppDataSource.manager
    .query(
      `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
      WHERE token = '${String(
        token.split(" ")[1]
      )}' AND admin = true OR super_admin = true`
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
          WHERE token = '${String(
            token.split(" ")[1]
          )}' AND admin = true OR super_admin = true`
      )
      .then(async (response) => {
        if (response.length > 0) {
          await AppDataSource.manager
            .query(
              `SELECT id, username, email, admin, moderator FROM login_credentials ORDER BY id`
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
    console.log("TEST: ", email, username, password);
    AppDataSource.manager
      .query(
        `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(
            token.split(" ")[1]
          )}' AND admin = true OR super_admin = true`
      )
      .then(async (response) => {
        if (response.length > 0) {
          AppDataSource.manager
            .query(
              `INSERT INTO login_credentials (username, email, password, super_admin, admin, moderator) VALUES (
                '${username}',
                '${email}',
                crypt('${password}', gen_salt('bf', 8)),
                false,
                false,
                false
              );`
            )
            .then(() => {
              AppDataSource.manager
                .query(
                  `SELECT * FROM login_credentials WHERE email = '${req.body.email}'`
                )
                .then((response) => {
                  console.log(response);
                  res.status(200).send(response);
                });
            });
        } else {
          res.sendStatus(401);
        }
      });
  })
  //delete existing user
  .delete(async (req, res) => {
    const user_id = req.body.user_id;
    const token = req.headers.authorization;
    AppDataSource.manager
      .query(
        `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(
            token.split(" ")[1]
          )}' AND admin = true OR super_admin = true`
      )
      .then(async (response) => {
        if (response.length > 0 && req.body.user_id > 0) {
          AppDataSource.manager.query(
            `DELETE FROM login_credentials WHERE id = ${user_id}`
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
    const user_id = req.body.user_id;
    const token = req.headers.authorization;
    AppDataSource.manager
      .query(
        `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
        WHERE token = '${String(
          token.split(" ")[1]
        )}' AND admin = true OR super_admin = true`
      )
      .then(async (response) => {
        if (response.length > 0 && req.body.user_id > 0) {
          AppDataSource.manager.query(
            `DELETE FROM session_tokens WHERE user_id = ${user_id}`
          );
          res.sendStatus(200);
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
          WHERE token = '${String(
            token.split(" ")[1]
          )}' AND admin = true OR super_admin = true`
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
  .route("/console/admin")
  //give admin role to account
  .put(async (req, res) => {
    const user_id = req.body.user_id;
    const token = req.headers.authorization;
    AppDataSource.manager
      .query(
        `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id WHERE token = '${String(
          token.split(" ")[1]
        )}' AND super_admin = true`
      )
      .then(async (response) => {
        if (response.length > 0 && req.body.user_id > 0) {
          AppDataSource.manager.query(
            `UPDATE login_credentials SET admin = true WHERE id = ${user_id}`
          );
          res.sendStatus(200);
        }
      });
  })

  .delete(async (req, res) => {
    const user_id = req.body.user_id;
    const token = req.headers.authorization;
    AppDataSource.manager
      .query(
        `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token.split(" ")[1])}' AND super_admin = true`
      )
      .then(async (response) => {
        if (response.length > 0 && req.body.user_id > 0) {
          AppDataSource.manager.query(
            `UPDATE login_credentials SET admin = false WHERE id = ${user_id}`
          );
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
    const token = req.headers.authorization;
    AppDataSource.manager
      .query(
        `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(
            token.split(" ")[1]
          )}' AND admin = true OR super_admin = true`
      )
      .then(async (response) => {
        if (response.length > 0 && req.body.user_id > 0) {
          AppDataSource.manager.query(
            `UPDATE login_credentials SET moderator = true WHERE id = ${user_id}`
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
    const token = req.headers.authorization;
    AppDataSource.manager
      .query(
        `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(
            token.split(" ")[1]
          )}' AND admin = true OR super_admin = true`
      )
      .then(async (response) => {
        if (response.length > 0 && req.body.user_id > 0) {
          AppDataSource.manager.query(
            `UPDATE login_credentials SET moderator = false WHERE id = ${user_id}`
          );
          res.sendStatus(200);
        } else {
          res.sendStatus(401);
        }
      });
  });

export default router;
