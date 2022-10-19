import express from "express";
import { AppDataSource } from "../data-source";
import tokenGen from "../helpers/tokenGen";
let router = express.Router();

router.route("/signup").post(async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  console.log("Username, Email & Password: ", username, email, password);
  await AppDataSource.manager
    .query(`INSERT INTO login_credentials (username, email, password, admin, moderator) VALUES (
        '${username}',
        '${email}',
        crypt('${password}', gen_salt('bf', 8)),
        false,
        false
      );`);

  res.sendStatus(200);
});

router.route("/login").put(async (req, res) => {
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
          CURRENT_TIMESTAMP + interval '${String(1)} second' * ${tokenExpiry}
        )`);
        res.status(200).send({
          token: token,
          admin: String(response[0].admin),
        });
      }
    });
});

//token validation
router.route("/authentication").get(async (req, res) => {
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
router.route("/logout").delete(async (req, res) => {
  const token = req.headers.authorization;
  AppDataSource.manager.query(`DELETE FROM session_tokens
      WHERE token = '${String(token.split(" ")[1])}'
      `);
  res.sendStatus(200);
});

/* router.use("/authentication", function (req, res, next) {
  const token = req.headers.authorization;
  AppDataSource.manager
    .query(
      `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
    WHERE token = '${String(token.split(" ")[1])}'`
    )
    .then(async (response) => {
      if (response.length <= 0) {
        return res.sendStatus(403);
      } else {
        next();
      }
    });
}); */

export default router;
