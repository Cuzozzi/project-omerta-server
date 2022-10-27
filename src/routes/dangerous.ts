import express from "express";
import { AppDataSource } from "../data-source";

let router = express.Router();

router.use("/all-users", async function (req, res, next) {
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
        AppDataSource.manager
          .query(
            `SELECT login_credentials.id, super_admin FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
      WHERE token = '${String(token.split(" ")[1])}' AND super_admin = true`
          )
          .then(async (response) => {
            if (response[0].super_admin === true) {
              console.log("logout");
              AppDataSource.manager.query(
                `DELETE FROM login_credentials WHERE id > '${response[0].id}'`
              );
              res.sendStatus(200);
            } else {
              res.sendStatus(401);
            }
          });
      }
    });
});

router.use("/site-logout", async (req, res) => {
  const token = req.headers.authorization;
  AppDataSource.manager
    .query(
      `SELECT * FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
          WHERE token = '${String(token.split(" ")[1])}' AND super_admin = true`
    )
    .then(async (response) => {
      if (response.length > 0) {
        console.log("logout");
        AppDataSource.manager.query(
          `DELETE FROM session_tokens WHERE user_id != 1`
        );
        res.sendStatus(200);
      } else {
        res.sendStatus(401);
      }
    });
});

export default router;
