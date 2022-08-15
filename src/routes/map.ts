import express from "express";
import { AppDataSource } from "../data-source";

let router = express.Router();

//count all tiles
router.get("/count-tiles", (req, res) => {
  AppDataSource.manager
    .query(`SELECT count(*) FROM tile_positions`)
    .then(async (response) => {
      if (response) {
        res.status(200).send(response);
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
      } else {
        res.sendStatus(401);
      }
    });
});

router.put("/test-generation", async (req, res) => {
  const countTiles = Number(req.body.counttiles);
  const tilePower = Number(req.body.tilepower);
  const allTiles = await AppDataSource.manager.query(
    `SELECT * FROM tile_positions ORDER BY "ID" ASC`
  );
  const lastTile = allTiles[allTiles.length - 1];
  let lastX = Number(lastTile.x);
  let lastZ = Number(lastTile.z);
  let lockType = "";
  let lockType2 = "";
  let renderArray = [];

  function generationLogic(x, z) {
    let result = { x: 0, z: 0 };
    // zero zero right
    if (x === 0 && z === 0 && lockType !== "rightLock") {
      result = { x: x + 32, z: z };
      lastX = x + 32;
      return result;
    }
    // down
    if (
      Math.sign(x) === 1 &&
      x !== z &&
      z + x !== 0 &&
      lockType !== "downLock" &&
      lockType2 !== "downLock"
    ) {
      result = { x: x, z: z + 32 };
      lastZ = z + 32;
      return result;
    }
    // bottom right corner left
    if (Math.sign(x) === 1 && x === z && lockType !== "leftLock") {
      result = { x: x - 32, z: z };
      lastX = x - 32;
      lockType = "downLock";
      return result;
    }
    //left
    if (
      Math.sign(z) === 1 &&
      x !== z &&
      x + z !== 0 &&
      lockType !== "leftLock"
    ) {
      result = { x: x - 32, z: z };
      lastX = x - 32;
      return result;
    }
    // bottom left-corner up
    if (x + z === 0 && Math.sign(z) === 1 && lockType !== "upLock") {
      result = { x: x, z: z - 32 };
      lastZ = z - 32;
      lockType = "leftLock";
      return result;
    }

    // up
    if (Math.sign(x) === -1 && x !== z && lockType !== "upLock") {
      result = { x: x, z: z - 32 };
      lastZ = z - 32;
      return result;
    }
    // top left corner right
    if (Math.sign(x) === -1 && x === z && lockType !== "rightLock") {
      result = { x: x + 32, z: z };
      lastX = x + 32;
      lockType = "upLock";
      lockType2 = "downLock";
      return result;
    }
    // top right-corner right
    if (z + x === 0 && lockType !== "rightLock") {
      result = { x: x + 32, z: z };
      lastX = x + 32;
      lockType = "rightLock";
      lockType2 = "";
      return result;
    }
    //right
    if (Math.sign(z) === -1 && x !== z && lockType !== "rightLock") {
      result = { x: x + 32, z: z };
      lastX = x + 32;
      return result;
    }
  }
  if (countTiles < tilePower) {
    for (let i = countTiles; i < tilePower; i++) {
      renderArray.push(generationLogic(lastX, lastZ));
    }
  }
  let constructString = `INSERT INTO tile_positions (x, y, z) VALUES`;
  renderArray.forEach(function (i, idx, array) {
    if (idx !== array.length - 1) {
      constructString = constructString + " " + `(${i.x}, 0, ${i.z}), `;
    } else if (idx === array.length - 1) {
      constructString = constructString + " " + `(${i.x}, 0, ${i.z})`;
    }
  });
  AppDataSource.query(constructString);
  res.status(200).send(renderArray);
});

export default router;
