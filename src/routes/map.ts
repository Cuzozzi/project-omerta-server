import express from "express";
import { AppDataSource } from "../data-source";
import { ReturnOne } from "../helpers/map-returns";

let router = express.Router();

//count all tiles
router.get("/count-tiles", (req, res) => {
  AppDataSource.manager
    .query(`SELECT count(*) FROM tile_positions`)
    .then(async (response) => {
      if (response) {
        res.status(200).send(response);
        //console.log(response);
      } else {
        res.sendStatus(404);
      }
    });
});

//returns total tilepower among users
router.get("/tile-power", (req, res) => {
  AppDataSource.manager
    .query(`SELECT SUM (tilepower) AS tilepower FROM login_credentials`)
    .then(async (response) => {
      if (response) {
        res.status(200).send(response);
        //console.log(response);
      } else {
        res.sendStatus(404);
      }
    });
});

//returns all tile rows in table
router.get("/all-tiles", (req, res) => {
  AppDataSource.manager
    .query(`SELECT * FROM tile_positions`)
    .then(async (response) => {
      if (response) {
        res.status(200).send(response);
        //console.log(response);
      } else {
        res.sendStatus(401);
      }
    });
});

//generates tiles
router.get("/tile-generation", async (req, res) => {
  const allTiles = await AppDataSource.manager.query(
    `SELECT * FROM tile_positions ORDER BY "ID" ASC`
  );
  const lastTile = allTiles[allTiles.length - 1];
  console.log(allTiles);
  console.log(lastTile.x, lastTile.z);
  const x = Number(lastTile.x);
  const z = Number(lastTile.z);

  if (allTiles) {
    ReturnOne(x, z, res);
  } else {
    res.sendStatus(500);
  }
});

export default router;
