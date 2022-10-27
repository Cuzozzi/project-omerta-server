import express from "express";
import { AppDataSource } from "../data-source";

let router = express.Router();

router.route("/super-admin").get(async (req, res) => {
  const token = req.headers.authorization;
  const main_response = await AppDataSource.manager.query(
    `SELECT expiry FROM session_tokens WHERE token = '${String(
      token.split(" ")[1]
    )}' AND
      expiry > now()`
  );
  if (main_response.length > 0) {
    const response = await AppDataSource.manager.query(
      `SELECT super_admin FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
        WHERE token = '${String(token.split(" ")[1])}'`
    );
    if (response[0].super_admin === true) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});

router.route("/admin").get(async (req, res) => {
  const token = req.headers.authorization;
  const main_response = await AppDataSource.manager.query(
    `SELECT expiry FROM session_tokens WHERE token = '${String(
      token.split(" ")[1]
    )}' AND
      expiry > now()`
  );
  if (main_response.length > 0) {
    const response = await AppDataSource.manager.query(
      `SELECT admin FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
        WHERE token = '${String(token.split(" ")[1])}'`
    );
    if (response[0].admin === true) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});

router.route("/moderator").get(async (req, res) => {
  const token = req.headers.authorization;
  const main_response = await AppDataSource.manager.query(
    `SELECT expiry FROM session_tokens WHERE token = '${String(
      token.split(" ")[1]
    )}' AND
      expiry > now()`
  );
  if (main_response.length > 0) {
    const response = await AppDataSource.manager.query(
      `SELECT moderator FROM login_credentials JOIN session_tokens ON login_credentials.id = user_id
        WHERE token = '${String(token.split(" ")[1])}'`
    );
    if (response[0].moderator === true) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});

router.route("/user").get(async (req, res) => {
  const token = req.headers.authorization;
  const main_response = await AppDataSource.manager.query(
    `SELECT expiry FROM session_tokens WHERE token = '${String(
      token.split(" ")[1]
    )}' AND
        expiry > now()`
  );
  if (main_response.length > 0) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

export default router;
