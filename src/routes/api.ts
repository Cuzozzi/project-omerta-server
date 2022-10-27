import express from "express";
import { AppDataSource } from "../data-source";
import tokenGen from "../helpers/tokenGen";
let router = express.Router();

//signup
router.route("/signup").post(async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  await AppDataSource.manager
    .query(`INSERT INTO login_credentials (username, email, password, tilepower, super_admin, admin, moderator) VALUES (
        '${username}',
        '${email}',
        crypt('${password}', gen_salt('bf', 8)),
        3,
        false,
        false,
        false
      );`);

  res.sendStatus(200);
});

//login
router.route("/login").put(async (req, res) => {
  const identifier = req.body.identifier;
  const password = req.body.password;
  const token = tokenGen();
  const tokenExpiry = String(7 * 24 * 60 * 60);
  AppDataSource.manager
    .query(
      `SELECT id, admin, super_admin, moderator
  FROM login_credentials
  WHERE email = '${identifier}' 
  AND password = crypt('${password}', password) 
  `
    )
    .then(function (response) {
      if (response.length === 0) {
        AppDataSource.manager
          .query(
            `SELECT id, admin, super_admin, moderator
        FROM login_credentials
        WHERE username = '${identifier}' 
        AND password = crypt('${password}', password) 
        `
          )
          .then(function (response) {
            if (response.length === 0) {
              res.status(404).send({
                token: "404",
                super_admin: false,
                admin: false,
                moderator: false,
              });
            } else {
              AppDataSource.manager
                .query(`INSERT INTO session_tokens (user_id, token, expiry) VALUES (
          ${response[0].id},
          '${token}',
          CURRENT_TIMESTAMP + interval '${String(1)} second' * ${tokenExpiry}
        )`);
              res.status(200).send({
                token: token,
                super_admin: Boolean(response[0].super_admin),
                admin: Boolean(response[0].admin),
                moderator: Boolean(response[0].moderator),
              });
            }
          });
      } else {
        AppDataSource.manager
          .query(`INSERT INTO session_tokens (user_id, token, expiry) VALUES (
          ${response[0].id},
          '${token}',
          CURRENT_TIMESTAMP + interval '${String(1)} second' * ${tokenExpiry}
        )`);
        res.status(200).send({
          token: token,
          super_admin: Boolean(response[0].super_admin),
          admin: Boolean(response[0].admin),
          moderator: Boolean(response[0].moderator),
        });
      }
    });
});

//logout
router.route("/logout").delete(async (req, res) => {
  const token = req.headers.authorization;
  AppDataSource.manager.query(`DELETE FROM session_tokens
      WHERE token = '${String(token.split(" ")[1])}'
      `);
  res.sendStatus(200);
});

export default router;
