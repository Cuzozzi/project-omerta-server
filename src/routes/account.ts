import express from "express";
import { AppDataSource } from "../data-source";
let router = express.Router();

router.use("/", function (req, res, next) {
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
});

router.get("/info", (req, res) => {
  const token = req.headers.authorization;
  AppDataSource.manager
    .query(
      `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
        WHERE token = '${String(token.split(" ")[1])}'`
    )
    .then(async (response) => {
      if (response) {
        res.status(200).send(response);
      } else {
        res.sendStatus(404);
      }
    });
});

router.put("/change-username", (req, res) => {
  const token = req.headers.authorization;
  const password = req.body.password;
  const username = req.body.username;

  AppDataSource.manager
    .query(
      `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
      WHERE token = '${String(
        token.split(" ")[1]
      )}' AND password = crypt('${password}', password)`
    )
    .then(async (response) => {
      if (response.length > 0) {
        console.log(response);
        AppDataSource.manager.query(
          `UPDATE login_credentials SET username = '${username}' WHERE username = '${response[0].username}'`
        );
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    });
});

router.put("/change-email", (req, res) => {
  const token = req.headers.authorization;
  const password = req.body.password;
  const email = req.body.email;

  AppDataSource.manager
    .query(
      `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
        WHERE token = '${String(
          token.split(" ")[1]
        )}' AND password = crypt('${password}', password)`
    )
    .then(async (response) => {
      if (response.length > 0) {
        console.log(response);
        AppDataSource.manager.query(
          `UPDATE login_credentials SET email = '${email}' WHERE email = '${response[0].email}'`
        );
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    });
});

router.put("/change-password", (req, res) => {
  const token = req.headers.authorization;
  const oldpassword = req.body.password;
  const newpassword = req.body.newpassword;

  AppDataSource.manager
    .query(
      `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(
            token.split(" ")[1]
          )}' AND password = crypt('${oldpassword}', password)`
    )
    .then(async (response) => {
      if (response.length > 0) {
        console.log(response);
        AppDataSource.manager.query(
          `UPDATE login_credentials SET password = crypt('${newpassword}', gen_salt('bf', 8)) WHERE password = '${response[0].password}'`
        );
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    });
});

export default router;
